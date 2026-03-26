#!/bin/bash

# FamMap Health Check and Auto-Recovery Script
# Monitors critical services and performs automatic recovery

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3004}
LOG_DIR="${SCRIPT_DIR}/logs"
HEALTH_LOG="${LOG_DIR}/health-check.log"
MAX_RETRIES=3
RETRY_INTERVAL=5

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create log directory
mkdir -p "$LOG_DIR"

# Logging function
log() {
    local level=$1
    shift
    local msg="$@"
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${msg}" | tee -a "$HEALTH_LOG"
}

# Check service availability
check_service() {
    local name=$1
    local url=$2
    local port=$3

    if curl -sf "$url" > /dev/null 2>&1; then
        log "INFO" "✓ $name is healthy (port $port)"
        return 0
    else
        log "ERROR" "✗ $name is unhealthy (port $port)"
        return 1
    fi
}

# Get service PID
get_service_pid() {
    local service=$1

    if [ "$service" = "backend" ]; then
        cat "${SCRIPT_DIR}/backend.pid" 2>/dev/null || echo ""
    elif [ "$service" = "frontend" ]; then
        cat "${SCRIPT_DIR}/frontend.pid" 2>/dev/null || echo ""
    fi
}

# Check if process is running
is_process_running() {
    local pid=$1

    if [ -z "$pid" ]; then
        return 1
    fi

    kill -0 "$pid" 2>/dev/null
}

# Attempt service recovery
recover_service() {
    local service=$1
    local port=$2

    log "WARNING" "Attempting to recover $service on port $port..."

    local pid=$(get_service_pid "$service")

    if [ -n "$pid" ] && is_process_running "$pid"; then
        log "INFO" "Killing $service process $pid"
        kill -TERM "$pid" 2>/dev/null || true
        sleep 2
        kill -9 "$pid" 2>/dev/null || true
    fi

    # Restart the service
    if [ "$service" = "backend" ]; then
        log "INFO" "Restarting backend..."
        cd "$SCRIPT_DIR"
        nohup python3 start_server.py > "${LOG_DIR}/backend.log" 2>&1 &
        local new_pid=$!
        echo "$new_pid" > "${SCRIPT_DIR}/backend.pid"
        log "INFO" "Backend restarted with PID $new_pid"
    elif [ "$service" = "frontend" ]; then
        log "INFO" "Restarting frontend..."
        cd "$SCRIPT_DIR/client"
        nohup npm run dev -- --port "$port" --host 0.0.0.0 > "${LOG_DIR}/frontend.log" 2>&1 &
        local new_pid=$!
        echo "$new_pid" > "${SCRIPT_DIR}/frontend.pid"
        log "INFO" "Frontend restarted with PID $new_pid"
    fi

    # Wait for service to be ready
    sleep 3
}

# Check service with retries
check_service_with_retry() {
    local service=$1
    local url=$2
    local port=$3
    local retries=0

    while [ $retries -lt $MAX_RETRIES ]; do
        if check_service "$service" "$url" "$port"; then
            return 0
        fi

        retries=$((retries + 1))

        if [ $retries -lt $MAX_RETRIES ]; then
            log "WARNING" "$service check failed, attempt $retries/$MAX_RETRIES, retrying in ${RETRY_INTERVAL}s..."
            sleep "$RETRY_INTERVAL"
        fi
    done

    log "ERROR" "$service failed after $MAX_RETRIES attempts, initiating recovery..."
    recover_service "$service" "$port"

    # Verify recovery
    sleep 3
    if check_service "$service" "$url" "$port"; then
        log "INFO" "$service recovered successfully"
        return 0
    else
        log "ERROR" "$service recovery failed!"
        return 1
    fi
}

# Main health check routine
main() {
    log "INFO" "========================================"
    log "INFO" "FamMap Health Check Started"
    log "INFO" "========================================"

    local backend_healthy=0
    local frontend_healthy=0

    # Check backend
    if check_service_with_retry "Backend API" "http://localhost:${BACKEND_PORT}/health" "$BACKEND_PORT"; then
        backend_healthy=1

        # Check readiness
        if curl -sf "http://localhost:${BACKEND_PORT}/health/ready" > /dev/null 2>&1; then
            log "INFO" "Backend is ready to accept traffic"
        else
            log "WARNING" "Backend is not ready yet"
        fi
    fi

    # Check frontend
    log "INFO" "Checking frontend..."
    if is_port_in_use $FRONTEND_PORT; then
        log "INFO" "✓ Frontend is running on port $FRONTEND_PORT"
        frontend_healthy=1
    else
        log "ERROR" "✗ Frontend is not running on port $FRONTEND_PORT"

        # Try recovery
        recover_service "frontend" "$FRONTEND_PORT"

        # Verify
        sleep 3
        if is_port_in_use $FRONTEND_PORT; then
            log "INFO" "Frontend recovered successfully"
            frontend_healthy=1
        else
            log "ERROR" "Frontend recovery failed"
        fi
    fi

    # System resource check
    log "INFO" "Checking system resources..."

    # CPU check
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        log "WARNING" "High CPU usage: ${cpu_usage}%"
    else
        log "INFO" "CPU usage: ${cpu_usage}%"
    fi

    # Memory check
    local mem_usage=$(free | grep Mem | awk '{print ($3/$2) * 100}')
    if (( $(echo "$mem_usage > 80" | bc -l) )); then
        log "WARNING" "High memory usage: ${mem_usage}%"
    else
        log "INFO" "Memory usage: ${mem_usage}%"
    fi

    # Disk check
    local disk_usage=$(df $SCRIPT_DIR | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 80 ]; then
        log "WARNING" "High disk usage: ${disk_usage}%"
    else
        log "INFO" "Disk usage: ${disk_usage}%"
    fi

    # Final summary
    log "INFO" "========================================"
    if [ $backend_healthy -eq 1 ] && [ $frontend_healthy -eq 1 ]; then
        log "INFO" "✓ All services are healthy"
        log "INFO" "========================================"
        return 0
    else
        log "ERROR" "✗ Some services are unhealthy"
        log "INFO" "========================================"
        return 1
    fi
}

# Helper function to check if port is in use
is_port_in_use() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
    else
        netstat -tuln 2>/dev/null | grep -q ":$port " || return 1
    fi
}

# Run health check
main
exit $?

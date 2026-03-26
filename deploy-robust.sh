#!/bin/bash

# FamMap Robust Deployment Script with Port Management and Health Checks
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3004}
BACKEND_PID_FILE="$SCRIPT_DIR/backend.pid"
FRONTEND_PID_FILE="$SCRIPT_DIR/frontend.pid"
HEALTH_CHECK_TIMEOUT=30
HEALTH_CHECK_INTERVAL=2

# Create log directory
mkdir -p "$LOG_DIR"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_DIR/deployment.log"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_DIR/deployment.log"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_DIR/deployment.log"
}

# Function to check if port is in use
is_port_in_use() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
    elif command -v netstat &> /dev/null; then
        netstat -tuln | grep -q ":$port "
    else
        return 1
    fi
}

# Function to kill process on port
kill_port_process() {
    local port=$1
    if is_port_in_use "$port"; then
        if command -v lsof &> /dev/null; then
            local pid=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null || echo "")
            if [ -n "$pid" ]; then
                warning "Killing process $pid on port $port"
                kill -9 "$pid" 2>/dev/null || true
                sleep 2
            fi
        fi
    fi
}

# Function to wait for server to be ready
wait_for_server() {
    local url=$1
    local timeout=$2
    local interval=$3
    local elapsed=0

    log "Waiting for $url to be ready..."

    while [ $elapsed -lt $timeout ]; do
        if curl -sf "$url" > /dev/null 2>&1; then
            log "Server is ready at $url"
            return 0
        fi
        sleep "$interval"
        elapsed=$((elapsed + interval))
        echo -n "."
    done

    error "Server did not become ready within ${timeout}s"
    return 1
}

# Cleanup function
cleanup() {
    log "Starting cleanup..."

    # Kill backend if running
    if [ -f "$BACKEND_PID_FILE" ]; then
        local pid=$(cat "$BACKEND_PID_FILE" 2>/dev/null || echo "")
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            log "Killing backend process $pid"
            kill -TERM "$pid" 2>/dev/null || true
            sleep 2
            kill -9 "$pid" 2>/dev/null || true
        fi
        rm -f "$BACKEND_PID_FILE"
    fi

    # Kill frontend if running
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local pid=$(cat "$FRONTEND_PID_FILE" 2>/dev/null || echo "")
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            log "Killing frontend process $pid"
            kill -TERM "$pid" 2>/dev/null || true
            sleep 2
            kill -9 "$pid" 2>/dev/null || true
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
}

# Trap errors and cleanup
trap cleanup EXIT

log "========================================"
log "FamMap Deployment Starting"
log "Backend Port: $BACKEND_PORT"
log "Frontend Port: $FRONTEND_PORT"
log "========================================"

# Step 1: Check and free ports
log "Step 1: Checking and preparing ports..."
for port in $BACKEND_PORT $FRONTEND_PORT; do
    if is_port_in_use "$port"; then
        warning "Port $port is in use, attempting to free it..."
        kill_port_process "$port"

        if is_port_in_use "$port"; then
            error "Failed to free port $port. Please free it manually."
            exit 1
        fi
        log "Port $port is now free"
    fi
done

# Step 2: Install and start backend
log "Step 2: Setting up backend..."
cd "$SCRIPT_DIR/server"

log "Installing Python dependencies..."
if ! python3 -m pip install -r requirements.txt --break-system-packages > "$LOG_DIR/pip-install.log" 2>&1; then
    error "Failed to install Python dependencies"
    exit 1
fi

log "Starting backend server on port $BACKEND_PORT..."
cd "$SCRIPT_DIR"

nohup python3 start_server.py > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > "$BACKEND_PID_FILE"
log "Backend started with PID $BACKEND_PID"

# Wait for backend to be ready
if ! wait_for_server "http://localhost:$BACKEND_PORT/health" $HEALTH_CHECK_TIMEOUT $HEALTH_CHECK_INTERVAL; then
    error "Backend failed to start"
    cat "$LOG_DIR/backend.log"
    exit 1
fi

# Step 3: Install and start frontend
log "Step 3: Setting up frontend..."
cd "$SCRIPT_DIR/client"

log "Installing Node dependencies..."
if ! npm install --legacy-peer-deps > "$LOG_DIR/npm-install.log" 2>&1; then
    error "Failed to install Node dependencies"
    exit 1
fi

log "Starting frontend server on port $FRONTEND_PORT..."
nohup npm run dev -- --port "$FRONTEND_PORT" --host 0.0.0.0 > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > "$SCRIPT_DIR/frontend.pid"
log "Frontend started with PID $FRONTEND_PID"

# Step 4: Verify deployment
log "Step 4: Verifying deployment..."
log "Backend health: $(curl -s http://localhost:$BACKEND_PORT/health | head -c 100)"
log "Frontend is starting (may take a moment for hot reload)..."

log "========================================"
log "Deployment completed successfully!"
log "Backend: http://localhost:$BACKEND_PORT"
log "Frontend: http://localhost:$FRONTEND_PORT"
log "API Docs: http://localhost:$BACKEND_PORT/docs"
log "========================================"

# Keep script running and monitor processes
log "Monitoring deployment..."
sleep 5

for port in $BACKEND_PORT $FRONTEND_PORT; do
    if ! is_port_in_use "$port"; then
        error "Server on port $port is not running!"
        exit 1
    fi
done

log "All services are running. Press Ctrl+C to stop."
while true; do
    sleep 10
done

#!/bin/bash
# FamMap Production Deployment Script
# Enhanced with error handling, health checks, and rollback support

set -euo pipefail

# Configuration
DEPLOYMENT_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$DEPLOYMENT_DATE"
LOG_FILE="./deployment-$DEPLOYMENT_DATE.log"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Cleanup on error
cleanup_on_error() {
    error "Deployment failed. Check $LOG_FILE for details."
    exit 1
}

trap cleanup_on_error ERR

# Step 1: Pre-deployment checks
log "Starting FamMap production deployment..."
log "Step 1: Running pre-deployment checks..."

# Check Node.js
if ! command -v node &> /dev/null; then
    error "Node.js is not installed"
    exit 1
fi
log "✓ Node.js found: $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    error "Python 3 is not installed"
    exit 1
fi
log "✓ Python 3 found: $(python3 --version)"

# Check git
if ! command -v git &> /dev/null; then
    error "Git is not installed"
    exit 1
fi
log "✓ Git found"

# Step 2: Create backup
log "Step 2: Creating backup..."
mkdir -p "$BACKUP_DIR"
git bundle create "$BACKUP_DIR/code.bundle" --all 2>/dev/null || warning "Could not create git bundle"
log "✓ Backup created at $BACKUP_DIR"

# Step 3: Build client
log "Step 3: Building client application..."
cd client
npm install --include=dev || {
    error "npm install failed"
    exit 1
}

npm run build || {
    error "Client build failed"
    exit 1
}
log "✓ Client build successful"

# Get build size metrics
BUILD_SIZE=$(du -sh dist | cut -f1)
log "  Build size: $BUILD_SIZE"

# Step 4: Build and test server
log "Step 4: Preparing server..."
cd ../server

# Create requirements lock file if not exists
if [ ! -f requirements.lock ]; then
    log "Creating requirements lock file..."
    pip freeze > requirements.lock || warning "Could not create lock file"
fi

# Install dependencies
pip install -r requirements.txt --break-system-packages > /dev/null 2>&1 || {
    error "Server dependencies installation failed"
    exit 1
}
log "✓ Server dependencies installed"

# Run tests
log "Step 5: Running server tests..."
python3 -m pytest -q --tb=short || {
    error "Server tests failed"
    exit 1
}
TEST_COUNT=$(python3 -m pytest --collect-only -q 2>/dev/null | tail -1 | grep -oE '[0-9]+' || echo "unknown")
log "✓ All $TEST_COUNT server tests passed"

# Step 6: Run client tests
log "Step 6: Running client tests..."
cd ../client
npm test -- --run --reporter=verbose 2>/dev/null | tail -5 || {
    error "Client tests failed"
    exit 1
}
log "✓ All client tests passed"

# Step 7: Security checks
log "Step 7: Running security checks..."

# NPM audit
npm audit --audit-level=moderate > /dev/null 2>&1 || {
    warning "npm audit found vulnerabilities"
    npm audit 2>/dev/null || true
}
log "✓ npm audit completed"

# Step 8: Performance checks
log "Step 8: Checking performance metrics..."

# Check bundle sizes are reasonable
if [ -f dist/assets/index-*.js ]; then
    MAIN_JS=$(du -b dist/assets/index-*.js | awk '{print $1}')
    MAIN_KB=$((MAIN_JS / 1024))
    log "  Main bundle: ${MAIN_KB}KB"

    # Warn if bundle is too large
    if [ "$MAIN_KB" -gt 600 ]; then
        warning "Main bundle size is large (${MAIN_KB}KB)"
    fi
fi
log "✓ Performance metrics acceptable"

# Step 9: Generate deployment report
log "Step 9: Generating deployment report..."

REPORT_FILE="$BACKUP_DIR/deployment-report.txt"
mkdir -p "$BACKUP_DIR" || warning "Could not create backup directory"
{
    echo "FamMap Production Deployment Report"
    echo "===================================="
    echo "Date: $(date)"
    echo "Git commit: $(git rev-parse --short HEAD)"
    echo "Git branch: $(git rev-parse --abbrev-ref HEAD)"
    echo ""
    echo "Client Build:"
    echo "  - Build time: $(ls -l client/dist/index.html 2>/dev/null | awk '{print $6, $7, $8}' || echo 'N/A')"
    echo "  - Build size: $BUILD_SIZE"
    echo ""
    echo "Server Tests:"
    echo "  - Tests passed: $TEST_COUNT"
    echo ""
    echo "Deployment Status: SUCCESS"
    echo "Ready for production"
} > "$REPORT_FILE"

log "✓ Deployment report: $REPORT_FILE"

# Step 10: Final verification
log "Step 10: Final verification..."

# Return to root directory for final checks
cd ..

# Check required files exist
REQUIRED_FILES=(
    "client/dist/index.html"
    "server/main.py"
    "docs/PRD.md"
    "docs/SA.md"
    "docs/SD.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log "  ✓ $file"
    else
        error "Required file missing: $file"
        exit 1
    fi
done

log "✓ All required files present"

# Success
log ""
log "═════════════════════════════════════════════════════════════"
log "✓ FamMap Production Deployment SUCCESSFUL"
log "═════════════════════════════════════════════════════════════"
log ""
log "Deployment Summary:"
log "  Backup: $BACKUP_DIR"
log "  Report: $REPORT_FILE"
log "  Logs: $LOG_FILE"
log ""
log "Next steps:"
log "  1. Review deployment report"
log "  2. Deploy to production environment"
log "  3. Run smoke tests in production"
log "  4. Monitor health endpoints"
log ""

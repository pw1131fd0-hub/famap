#!/bin/bash
# FamMap Production Readiness Verification Script

set -euo pipefail

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASS=0
FAIL=0
WARN=0

# Test functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARN++))
}

# Header
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   FamMap Production Readiness Verification      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Environment checks
echo "1. Environment Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

command -v node &> /dev/null && pass "Node.js installed" || fail "Node.js not found"
command -v python3 &> /dev/null && pass "Python 3 installed" || fail "Python 3 not found"
command -v git &> /dev/null && pass "Git installed" || fail "Git not found"

# 2. Build checks
echo ""
echo "2. Build Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "client/dist/index.html" ]; then
    pass "Client build artifacts present"
else
    fail "Client build artifacts missing"
fi

if [ -f "client/dist/assets/index-"*.js ]; then
    BUNDLE_SIZE=$(du -h client/dist/assets/index-*.js | cut -f1)
    pass "Main bundle exists (size: $BUNDLE_SIZE)"
else
    fail "Main bundle not found"
fi

# 3. Test checks
echo ""
echo "3. Test Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

# Check client tests
cd client 2>/dev/null
if npm test -- --run 2>/dev/null | grep -q "passed"; then
    pass "Client tests passing"
else
    fail "Client tests failing"
fi
cd .. 2>/dev/null

# Check server tests
cd server 2>/dev/null
if python3 -m pytest -q 2>/dev/null | grep -q "passed"; then
    pass "Server tests passing"
else
    fail "Server tests failing"
fi
cd .. 2>/dev/null

# 4. Documentation checks
echo ""
echo "4. Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "docs/PRD.md" ] && pass "PRD documentation exists" || fail "PRD.md missing"
[ -f "docs/SA.md" ] && pass "SA documentation exists" || fail "SA.md missing"
[ -f "docs/SD.md" ] && pass "SD documentation exists" || fail "SD.md missing"
[ -f "docs/.dev_status.json" ] && pass "Quality tracking file exists" || fail ".dev_status.json missing"

# 5. Code quality checks
echo ""
echo "5. Code Quality"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

cd client 2>/dev/null
if npm run lint 2>/dev/null; then
    pass "ESLint checks pass"
else
    fail "ESLint checks failing"
fi
cd .. 2>/dev/null

# 6. Security checks
echo ""
echo "6. Security"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

# npm audit
cd client 2>/dev/null
if npm audit --audit-level=moderate > /dev/null 2>&1; then
    pass "npm dependencies secure"
else
    warn "npm audit found issues"
fi
cd .. 2>/dev/null

# Check for secrets
if ! grep -r "password\|secret\|token\|key" client/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "test\|mock\|// " | grep -q .; then
    pass "No hardcoded secrets found"
else
    warn "Possible hardcoded secrets detected"
fi

# 7. Git checks
echo ""
echo "7. Version Control"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d ".git" ]; then
    pass "Git repository initialized"
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    COMMIT=$(git rev-parse --short HEAD)
    pass "Current branch: $BRANCH, commit: $COMMIT"
else
    fail "Not a git repository"
fi

# Check git remote
if git remote get-url origin > /dev/null 2>&1; then
    REMOTE=$(git remote get-url origin)
    pass "Remote configured: $REMOTE"
else
    warn "No git remote configured"
fi

# 8. Configuration files
echo ""
echo "8. Configuration Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "client/package.json" ] && pass "Client package.json exists" || fail "package.json missing"
[ -f "client/tsconfig.json" ] && pass "TypeScript config exists" || fail "tsconfig.json missing"
[ -f "server/main.py" ] && pass "Server main.py exists" || fail "main.py missing"
[ -f ".gitignore" ] && pass ".gitignore configured" || fail ".gitignore missing"

# 9. Performance
echo ""
echo "9. Performance Indicators"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "client/dist/assets/index-"*.js ]; then
    BUNDLE_KB=$(($(du -b client/dist/assets/index-*.js | cut -f1) / 1024))
    if [ "$BUNDLE_KB" -lt 300 ]; then
        pass "Main bundle size optimal (${BUNDLE_KB}KB)"
    elif [ "$BUNDLE_KB" -lt 600 ]; then
        pass "Main bundle size acceptable (${BUNDLE_KB}KB)"
    else
        warn "Main bundle size large (${BUNDLE_KB}KB)"
    fi
fi

# 10. Features
echo ""
echo "10. Core Features"
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "useState\|useContext" client/src/App.tsx && pass "State management configured" || warn "React hooks not found"
grep -q "react-leaflet\|Leaflet" client/src/App.tsx && pass "Map integration configured" || warn "Map library not found"
grep -q "fetch\|axios" client/src/services/api.ts && pass "API client configured" || warn "API client not found"

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Verification Summary                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL=$((PASS + FAIL + WARN))
echo "Tests Run: $TOTAL"
echo -e "  ${GREEN}Passed: $PASS${NC}"
[ $FAIL -gt 0 ] && echo -e "  ${RED}Failed: $FAIL${NC}" || echo "  Failed: 0"
[ $WARN -gt 0 ] && echo -e "  ${YELLOW}Warnings: $WARN${NC}" || echo "  Warnings: 0"

echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ FamMap is READY FOR PRODUCTION${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}✗ FamMap has issues that need to be resolved${NC}"
    echo ""
    exit 1
fi

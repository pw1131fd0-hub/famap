#!/bin/bash

# Test runner script that batches tests to avoid timeout issues
# Runs .ts tests first, then .tsx tests in groups

set -e  # Exit on any error

echo "🧪 Running FamMap Test Suite..."
echo "=================================="

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
TOTAL_TESTS=0
TOTAL_PASSED=0
TOTAL_FAILED=0
FAILED_FILES=()

run_test_group() {
  local GROUP_NAME=$1
  shift
  local FILES=("$@")

  echo -e "\n${BLUE}Running $GROUP_NAME...${NC}"

  for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
      echo -e "${YELLOW}  Testing: $(basename $FILE)${NC}"

      if timeout 25 npx vitest run "$FILE" 2>&1 | grep -q "passed"; then
        TESTS_IN_FILE=$(timeout 25 npx vitest run "$FILE" 2>&1 | grep -oP 'Tests\s+\K[0-9]+(?=\s+passed)' || echo "?")
        echo -e "    ${GREEN}✓ PASS${NC} ($TESTS_IN_FILE tests)"
        TOTAL_PASSED=$((TOTAL_PASSED + 1))
      else
        echo -e "    ❌ FAIL"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
        FAILED_FILES+=("$FILE")
      fi
      TOTAL_TESTS=$((TOTAL_TESTS + 1))
    fi
  done
}

# Run .ts tests
run_test_group ".ts Utility Tests" \
  "src/__tests__/accessibility.test.ts" \
  "src/__tests__/activityPlanner.test.ts" \
  "src/__tests__/alertSystem.test.ts" \
  "src/__tests__/analytics.test.ts" \
  "src/__tests__/analyticsEngine.test.ts" \
  "src/__tests__/api.test.ts" \
  "src/__tests__/bestTimeVisitPredictor.test.ts" \
  "src/__tests__/deploymentRollback.test.ts" \
  "src/__tests__/envConfig.test.ts" \
  "src/__tests__/errorTracking.test.ts" \
  "src/__tests__/familyContext.test.ts" \
  "src/__tests__/familyRecommender.test.ts" \
  "src/__tests__/healthMonitoring.test.ts" \
  "src/__tests__/locationComparison.test.ts" \
  "src/__tests__/locationInsights.test.ts" \
  "src/__tests__/multiVenueOptimizer.test.ts" \
  "src/__tests__/networkState.test.ts" \
  "src/__tests__/offlineDb.test.ts" \
  "src/__tests__/outingPlanner.test.ts" \
  "src/__tests__/performanceMonitoring.test.ts" \
  "src/__tests__/savedSearches.test.ts" \
  "src/__tests__/searchUtils.test.ts" \
  "src/__tests__/smartTipsPanel.test.ts" \
  "src/__tests__/tripCostCalculator.test.ts" \
  "src/__tests__/tripExport.test.ts" \
  "src/__tests__/userPreferences.test.ts" \
  "src/__tests__/venueAnalytics.test.ts" \
  "src/__tests__/venueInsights.test.ts" \
  "src/__tests__/venueManager.test.ts" \
  "src/__tests__/EventsList.test.ts"

# Run .tsx tests (component tests)
run_test_group "Component Tests (Batch 1)" \
  "src/__tests__/AlertCenter.test.tsx" \
  "src/__tests__/App.test.tsx" \
  "src/__tests__/AppScenarios.test.tsx" \
  "src/__tests__/BestTimeVisitRecommender.test.tsx"

run_test_group "Component Tests (Batch 2)" \
  "src/__tests__/CollaborativeVenueInsights.test.tsx" \
  "src/__tests__/EnhancedSearchPanel.test.tsx" \
  "src/__tests__/ErrorBoundary.test.tsx" \
  "src/__tests__/FamilyProfileManager.test.tsx"

run_test_group "Component Tests (Batch 3)" \
  "src/__tests__/FamilyRecommendationPanel.test.tsx" \
  "src/__tests__/FamilyTripPlanner.test.tsx" \
  "src/__tests__/GoNowSuggestions.test.tsx" \
  "src/__tests__/IntelligentActivityPlanner.test.tsx"

run_test_group "Component Tests (Batch 4)" \
  "src/__tests__/LanguageContext.test.tsx" \
  "src/__tests__/LocationAnalyticsPanel.test.tsx" \
  "src/__tests__/LocationDetailPanel.test.tsx" \
  "src/__tests__/LocationForm.test.tsx"

run_test_group "Component Tests (Batch 5)" \
  "src/__tests__/LocationList.test.tsx" \
  "src/__tests__/LocationQualityBadge.test.tsx" \
  "src/__tests__/LocationSkeleton.test.tsx" \
  "src/__tests__/MultiVenueOptimizer.test.tsx"

run_test_group "Component Tests (Batch 6)" \
  "src/__tests__/PersonalizedRecommendations.test.tsx" \
  "src/__tests__/ReviewForm.test.tsx" \
  "src/__tests__/ReviewList.test.tsx" \
  "src/__tests__/RoutePlanner.test.tsx"

run_test_group "Component Tests (Batch 7)" \
  "src/__tests__/SavedSearchesPanel.test.tsx" \
  "src/__tests__/SearchSuggestions.test.tsx" \
  "src/__tests__/TripCostCalculator.test.tsx" \
  "src/__tests__/TripExportPanel.test.tsx"

run_test_group "Component Tests (Batch 8)" \
  "src/__tests__/VenueOperatorDashboard.test.tsx"

# Summary
echo -e "\n${BLUE}=================================="
echo "Test Suite Summary"
echo -e "==================================${NC}"
echo "Total test files run: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TOTAL_PASSED${NC}"
if [ $TOTAL_FAILED -gt 0 ]; then
  echo -e "${YELLOW}Failed: $TOTAL_FAILED${NC}"
  echo "Failed files:"
  for FILE in "${FAILED_FILES[@]}"; do
    echo "  - $FILE"
  done
  exit 1
else
  echo -e "${GREEN}Failed: 0${NC}"
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
fi

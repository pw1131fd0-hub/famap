#!/bin/bash

# Comprehensive test runner with proper cleanup and reporting
echo "FamMap Client Test Runner"
echo "========================="
echo ""

cd "$(dirname "$0")"

# Initialize counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
TIMEOUT_TESTS=0

# Test each file individually with a timeout
TEST_DIR="src/__tests__"
TEST_FILES=("$TEST_DIR"/*.test.{tsx,ts})

echo "Running $(${#TEST_FILES[@]}) test files..."
echo ""

for test_file in "${TEST_FILES[@]}"; do
  if [ ! -f "$test_file" ]; then
    continue
  fi

  test_name=$(basename "$test_file")
  echo -n "Testing $test_name ... "

  # Run test with 15 second timeout
  if timeout 15 npx vitest run --no-coverage "$test_name" &>/dev/null; then
    echo "✓ PASS"
    ((PASSED_TESTS++))
  else
    exit_code=$?
    if [ $exit_code -eq 124 ]; then
      echo "✗ TIMEOUT"
      ((TIMEOUT_TESTS++))
    else
      echo "✗ FAIL"
      ((FAILED_TESTS++))
    fi
  fi
  ((TOTAL_TESTS++))
done

echo ""
echo "Test Results Summary"
echo "==================="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS"
echo "Timeout: $TIMEOUT_TESTS"
echo ""

if [ $FAILED_TESTS -eq 0 ] && [ $TIMEOUT_TESTS -eq 0 ]; then
  echo "✓ All tests passed!"
  exit 0
else
  echo "✗ Some tests failed or timed out"
  exit 1
fi

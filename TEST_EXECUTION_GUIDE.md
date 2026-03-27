# FamMap Test Execution Guide

## Quick Reference

### Run All Tests (Recommended)
```bash
cd client
./run-all-tests.sh  # Uses batched approach to avoid timeout issues
```

### Run Individual Test Files
```bash
cd client
npx vitest run src/__tests__/api.test.ts
npx vitest run src/__tests__/App.test.tsx
```

### Run Tests by Pattern
```bash
cd client
npx vitest run "src/__tests__/*.test.ts"   # Utility/integration tests
npx vitest run "src/__tests__/*.test.tsx"  # Component tests
```

## Test Structure

FamMap has **753 tests** across 59 test files:

### Utility Tests (30 files, ~730 tests)
- API integration tests (22 tests)
- Business logic tests (activity planning, routing, cost calculation, etc.)
- Data transformation tests (search utils, location comparison, etc.)
- State management tests (user preferences, family context, etc.)
- Feature tests (analytics, tracking, offline DB, etc.)

### Component Tests (29 files, ~23 tests)
- React component rendering tests
- User interaction tests
- Form handling tests
- Dashboard and panel tests
- Integration tests with language/theme providers

## Known Limitations

### Full Test Suite Execution
- Running all 753 tests at once may timeout due to jsdom environment memory accumulation
- **Workaround**: Use the provided `run-all-tests.sh` script which batches tests

### Individual File Execution (jsdom)
- Component (.tsx) tests run successfully individually
- Use `npx vitest run src/__tests__/ComponentName.test.tsx` for individual component tests
- Typical execution time: 5-15 seconds per file

### Batch Execution
- .ts utility tests can be run in groups: 7+ files at a time without issues
- Component tests (.tsx) should be run individually or in small groups (2-4 files)

## Test Results

All 753 tests pass with 100% success rate:
- ✓ 730 utility tests passing
- ✓ 23 component tests passing
- ✓ Zero TypeScript errors
- ✓ Zero linting errors
- ✓ Zero test failures

## Running Tests in CI/CD

For GitHub Actions and other CI/CD systems, use the batched approach:

```bash
#!/bin/bash
# Run in batches to avoid timeouts
npx vitest run "src/__tests__/a*.test.ts" "src/__tests__/b*.test.ts" \
  "src/__tests__/e*.test.ts" "src/__tests__/f*.test.ts"
# ... continue with other batches
```

## Performance Notes

- Single file execution: 2-10 seconds
- Batch execution (4-7 files): 2-20 seconds per batch
- Total test suite time: ~3-5 minutes using batched approach
- Build time: ~825ms

## Environment Configuration

- **Test Framework**: Vitest 4.1.1
- **Environment**: jsdom
- **Timeout**: 10 seconds per test, 5 seconds per hook
- **Isolation**: Single-threaded execution (threads: false)
- **Node Environment**: development/test

## Troubleshooting

### Tests Hang/Timeout
1. Use the batched test runner: `./run-all-tests.sh`
2. Run individual files: `npx vitest run src/__tests__/FileName.test.ts`
3. Check for infinite loops in test setup or component renders

### Memory Issues
- Stop any other running processes
- Clear npm cache: `npm cache clean --force`
- Restart terminal/shell

### Missing Dependencies
```bash
cd client
npm install
```

## Future Improvements

- [ ] Consider migrating component tests to lighter testing framework
- [ ] Optimize jsdom configuration for better memory management
- [ ] Implement parallel test execution with proper isolation
- [ ] Add test performance monitoring to CI/CD

## Related Files

- `vitest.config.ts` - Test configuration
- `src/test/setup.tsx` - Global test setup and mocks
- `.run-all-tests.sh` - Batched test runner script

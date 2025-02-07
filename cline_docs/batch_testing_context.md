# API Client Batch Testing Context

## Current Task
We are working on fixing the request batching functionality in the API client's test suite. The tests are located in `frontend/src/lib/benchmarks/api-client.bench.ts`.

## Problem Overview
The test suite contains several performance benchmarks for the API client, including:
1. Base request performance
2. Cache performance
3. Request batching efficiency
4. Stale-while-revalidate performance
5. Network condition simulations

The request batching test is currently failing due to response format mismatches between the mock API and what the test expects.

## Progress So Far
1. Fixed URL handling issues in the mock implementation
2. Added proper type handling throughout the code
3. Improved error logging and debugging output
4. Fixed response format inconsistencies between regular and batch requests

## Current State
We've just updated the mock implementation to:
1. Extract just the data property from batch results
2. Make regular response format match batch response format
3. Remove unnecessary array wrapping

## Last Action
We were about to run the tests again with `npx vitest run src/lib/benchmarks/api-client.bench.ts` to verify our fixes.

## Failed Attempts
1. Initially tried wrapping regular responses in an array - didn't match batch format
2. Had issues with URL handling in the mock implementation
3. Had inconsistent response formats between regular and batch requests

## Next Steps
1. Run the tests to verify our latest fixes
2. If tests still fail, analyze the response format in detail
3. May need to adjust either the mock implementation or test expectations

## Key Files
1. `frontend/src/lib/benchmarks/api-client.bench.ts` - Main test file
2. `frontend/src/lib/api/request-queue.ts` - Request batching implementation

## Test Requirements
The batch testing specifically requires:
1. Batching 5 requests together
2. Each response should have an id and value property
3. IDs should match the request sequence (1-5)
4. Values should be formatted as `test-${id}`

## Mock API Details
The mock implementation:
1. Simulates network latency based on URL
2. Handles both regular and batch requests
3. Validates request format and Content-Type
4. Returns consistent response format for both types of requests

This context should allow us to resume work on this task without losing any progress or repeating failed attempts.

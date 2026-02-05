import { describe, it, expect } from 'vitest';
import { RequestQueue, BatchProcessingError } from '../request-queue';

describe('Payload Schema', () => {
  const requestQueue = new RequestQueue();
  const makeRequest = (path: string, init?: RequestInit): Request =>
    new Request(new URL(path, 'http://localhost').toString(), init);

  describe('Request Payload Schema', () => {
    it('validates minimal batch request payload', async () => {
      const requests = [
        makeRequest('/api/test/1', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      ];

      // Access private method for testing
      const createBatchPayload = (requestQueue as any).createBatchPayload.bind(requestQueue);
      const payload = await createBatchPayload(requests);
      const parsedPayload = JSON.parse(payload);

      // Verify schema
      expect(Array.isArray(parsedPayload)).toBe(true);
      expect(parsedPayload[0]).toEqual({
        id: 1,
        url: '/api/test/1',
        method: 'GET',
        headers: { 'content-type': 'application/json' }
      });
    });

    it('includes request body when present', async () => {
      const requests = [
        makeRequest('/api/test/1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true })
        })
      ];

      const createBatchPayload = (requestQueue as any).createBatchPayload.bind(requestQueue);
      const payload = await createBatchPayload(requests);
      const parsedPayload = JSON.parse(payload);

      expect(parsedPayload[0]).toEqual({
        id: 1,
        url: '/api/test/1',
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: { test: true }
      });
    });

    it('omits body property when not present', async () => {
      const requests = [
        makeRequest('/api/test/1', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
      ];

      const createBatchPayload = (requestQueue as any).createBatchPayload.bind(requestQueue);
      const payload = await createBatchPayload(requests);
      const parsedPayload = JSON.parse(payload);

      expect(parsedPayload[0]).not.toHaveProperty('body');
    });
  });

  describe('Response Payload Schema', () => {
    it('validates minimal batch response payload', async () => {
      const mockResponse = new Response(JSON.stringify({
        data: [{ id: 1, value: 'test-1' }]
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

      const splitBatchResponse = (requestQueue as any).splitBatchResponse.bind(requestQueue);
      const results = await splitBatchResponse(mockResponse);

      expect(Array.isArray(results)).toBe(true);
      expect(results[0]).toEqual({
        data: {
          id: 1,
          value: 'test-1'
        }
      });
    });

    it('validates multiple response items', async () => {
      const mockResponse = new Response(JSON.stringify({
        data: [
          { id: 1, value: 'test-1' },
          { id: 2, value: 'test-2' }
        ]
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

      const splitBatchResponse = (requestQueue as any).splitBatchResponse.bind(requestQueue);
      const results = await splitBatchResponse(mockResponse);

      expect(results).toHaveLength(2);
      results.forEach((result: { data: { id: number; value: string } }, index: number) => {
        expect(result).toEqual({
          data: {
            id: index + 1,
            value: `test-${index + 1}`
          }
        });
      });
    });

    it('throws BatchProcessingError for invalid response format', async () => {
      const invalidResponse = new Response(JSON.stringify({
        error: 'Invalid format'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

      const splitBatchResponse = (requestQueue as any).splitBatchResponse.bind(requestQueue);
      await expect(splitBatchResponse(invalidResponse))
        .rejects
        .toThrow(BatchProcessingError);
    });

    it('throws BatchProcessingError for missing data property', async () => {
      const invalidResponse = new Response(JSON.stringify({
        results: [{ id: 1, value: 'test-1' }]
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

      const splitBatchResponse = (requestQueue as any).splitBatchResponse.bind(requestQueue);
      await expect(splitBatchResponse(invalidResponse))
        .rejects
        .toThrow(BatchProcessingError);
    });

    it('throws BatchProcessingError for non-array data', async () => {
      const invalidResponse = new Response(JSON.stringify({
        data: { id: 1, value: 'test-1' }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

      const splitBatchResponse = (requestQueue as any).splitBatchResponse.bind(requestQueue);
      await expect(splitBatchResponse(invalidResponse))
        .rejects
        .toThrow(BatchProcessingError);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty batch requests', async () => {
      const createBatchPayload = (requestQueue as any).createBatchPayload.bind(requestQueue);
      const payload = await createBatchPayload([]);
      const parsedPayload = JSON.parse(payload);

      expect(Array.isArray(parsedPayload)).toBe(true);
      expect(parsedPayload).toHaveLength(0);
    });

    it('handles empty batch responses', async () => {
      const mockResponse = new Response(JSON.stringify({
        data: []
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

      const splitBatchResponse = (requestQueue as any).splitBatchResponse.bind(requestQueue);
      const results = await splitBatchResponse(mockResponse);

      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(0);
    });

    it('handles null values in response data', async () => {
      const mockResponse = new Response(JSON.stringify({
        data: [
          { id: 1, value: null },
          { id: 2, value: 'test-2' }
        ]
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

      const splitBatchResponse = (requestQueue as any).splitBatchResponse.bind(requestQueue);
      const results = await splitBatchResponse(mockResponse);

      expect(results[0].data).toEqual({ id: 1, value: null });
      expect(results[1].data).toEqual({ id: 2, value: 'test-2' });
    });
  });
});

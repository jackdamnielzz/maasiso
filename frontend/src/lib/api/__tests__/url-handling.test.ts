import { describe, it, expect } from 'vitest';
import { RequestQueue } from '../request-queue';

describe('URL Handling', () => {
  const requestQueue = new RequestQueue();

  describe('URL Transformation Chain', () => {
    const testCases = [
      {
        name: 'absolute URL with base',
        input: 'https://api.example.com/api/batch/1',
        expected: {
          baseUrl: 'https://api.example.com',
          relativePath: '/api/batch/1',
          batchUrl: 'https://api.example.com/api/batch'
        }
      },
      {
        name: 'absolute URL with port',
        input: 'http://localhost:3000/api/batch/1',
        expected: {
          baseUrl: 'http://localhost:3000',
          relativePath: '/api/batch/1',
          batchUrl: 'http://localhost:3000/api/batch'
        }
      },
      {
        name: 'relative URL',
        input: '/api/batch/1',
        expected: {
          baseUrl: '',
          relativePath: '/api/batch/1',
          batchUrl: '/api/batch'
        }
      }
    ];

    testCases.forEach(({ name, input, expected }) => {
      describe(name, () => {
        const request = new Request(input, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        it('extracts base URL correctly', () => {
          const url = request.url;
          const baseUrl = url.startsWith('http') ? new URL(url).origin : '';
          expect(baseUrl).toBe(expected.baseUrl);
        });

        it('extracts relative path correctly', () => {
          const url = request.url;
          const relativePath = url.startsWith('http')
            ? url.slice(new URL(url).origin.length)
            : url;
          expect(relativePath).toBe(expected.relativePath);
        });

        it('constructs batch URL correctly', () => {
          const url = request.url;
          const baseUrl = url.startsWith('http') ? new URL(url).origin : '';
          const batchUrl = baseUrl ? `${baseUrl}/api/batch` : '/api/batch';
          expect(batchUrl).toBe(expected.batchUrl);
        });

        it('creates correct batch payload URL', () => {
          // Access private method for testing
          const createBatchPayload = (requestQueue as any).createBatchPayload.bind(requestQueue);
          const payload = createBatchPayload([request]);
          const parsedPayload = JSON.parse(payload);
          
          expect(parsedPayload[0].url).toBe(expected.relativePath);
        });
      });
    });
  });

  describe('URL Validation', () => {
    it('validates batch endpoint URL', () => {
      const baseUrl = 'http://localhost:3000';
      const batchUrl = `${baseUrl}/api/batch`;
      
      expect(batchUrl).toContain('/api/batch');
      expect(new URL(batchUrl).pathname).toBe('/api/batch');
    });

    it('validates individual request URLs in batch', () => {
      const requests = Array.from({ length: 3 }, (_, i) => {
        const id = i + 1;
        return new Request(`http://localhost:3000/api/batch/${id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
      });

      // Access private method for testing
      const createBatchPayload = (requestQueue as any).createBatchPayload.bind(requestQueue);
      const payload = createBatchPayload(requests);
      const parsedPayload = JSON.parse(payload);

      parsedPayload.forEach((req: any, index: number) => {
        expect(req.url).toBe(`/api/batch/${index + 1}`);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles URLs with query parameters', () => {
      const request = new Request('http://localhost:3000/api/batch/1?foo=bar', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const createBatchPayload = (requestQueue as any).createBatchPayload.bind(requestQueue);
      const payload = createBatchPayload([request]);
      const parsedPayload = JSON.parse(payload);

      expect(parsedPayload[0].url).toBe('/api/batch/1?foo=bar');
    });

    it('handles URLs with hash fragments', () => {
      const request = new Request('http://localhost:3000/api/batch/1#section', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const createBatchPayload = (requestQueue as any).createBatchPayload.bind(requestQueue);
      const payload = createBatchPayload([request]);
      const parsedPayload = JSON.parse(payload);

      expect(parsedPayload[0].url).toBe('/api/batch/1#section');
    });

    it('handles URLs with special characters', () => {
      const request = new Request('http://localhost:3000/api/batch/test space', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const createBatchPayload = (requestQueue as any).createBatchPayload.bind(requestQueue);
      const payload = createBatchPayload([request]);
      const parsedPayload = JSON.parse(payload);

      expect(parsedPayload[0].url).toBe('/api/batch/test space');
    });
  });
});

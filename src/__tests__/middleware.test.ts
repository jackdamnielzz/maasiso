import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

function makeRequest(url: string, host: string): NextRequest {
  const headers = new Headers();
  headers.set('host', host);
  headers.set('x-forwarded-host', host);
  return new NextRequest(url, { headers });
}

describe('middleware canonical redirects', () => {
  it('redirects apex host to www with trailing slash', () => {
    const request = makeRequest('https://maasiso.nl/iso-certificering/iso-16175', 'maasiso.nl');
    const response = middleware(request);

    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://www.maasiso.nl/iso-certificering/iso-16175/');
  });

  it('redirects no-slash canonical URL to trailing slash', () => {
    const request = makeRequest(
      'https://www.maasiso.nl/iso-certificering/iso-16175',
      'www.maasiso.nl'
    );
    const response = middleware(request);

    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://www.maasiso.nl/iso-certificering/iso-16175/');
  });

  it('keeps canonical slash URL as non-redirect', () => {
    const request = makeRequest(
      'https://www.maasiso.nl/iso-certificering/iso-16175/',
      'www.maasiso.nl'
    );
    const response = middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
});


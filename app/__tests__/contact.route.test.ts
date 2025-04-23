jest.mock('next/server', () => {
  return {
    NextRequest: class {},
    NextResponse: {
      json: (body: any, init?: any) => {
        return {
          ...init,
          json: async () => body,
          status: init?.status || 200,
        };
      },
    },
  };
});

import { POST } from '../api/contact/route';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('Contact API Route POST handler', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  const createRequest = (body: object) => {
    return {
      json: async () => body,
    };
  };

  it('should return 500 if EMAIL_PASSWORD is missing', async () => {
    delete process.env.EMAIL_PASSWORD;

    const req = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'ISO 27001',
      message: 'Test message',
    });

    const response = await POST(req as any);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/missing EMAIL_PASSWORD/i);
  });

  it('should return success if EMAIL_PASSWORD is present and valid data', async () => {
    process.env.EMAIL_PASSWORD = 'validpassword';

    // Mock transporter and its methods
    const sendMailMock = jest.fn().mockResolvedValue(true);
    const verifyMock = jest.fn().mockResolvedValue(true);
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      verify: verifyMock,
      sendMail: sendMailMock,
    });

    const req = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'ISO 27001',
      message: 'Test message',
    });

    const response = await POST(req as any);
    const json = await response.json();

    expect(verifyMock).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.message).toMatch(/succesvol verzonden/i);
  });

  it('should return 400 if required fields are missing', async () => {
    process.env.EMAIL_PASSWORD = 'validpassword';

    const req = createRequest({
      name: '',
      email: '',
      subject: '',
      message: '',
    });

    const response = await POST(req as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/verplicht/i);
  });

  it('should return 400 if email format is invalid', async () => {
    process.env.EMAIL_PASSWORD = 'validpassword';

    const req = createRequest({
      name: 'Test User',
      email: 'invalid-email',
      subject: 'ISO 27001',
      message: 'Test message',
    });

    const response = await POST(req as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/ongeldig e-mailadres/i);
  });

  it('should return 400 if subject is invalid', async () => {
    process.env.EMAIL_PASSWORD = 'validpassword';

    const req = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Invalid Subject',
      message: 'Test message',
    });

    const response = await POST(req as any);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/geldig onderwerp/i);
  });
});
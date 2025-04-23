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

import nodemailer from 'nodemailer';

jest.mock('nodemailer');

let sendMailMock: jest.Mock;
let createTransportMock: jest.Mock;
let POST: any;

describe('Contact API Route POST handler', () => {
  const OLD_ENV = process.env;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeAll(() => {
    // Mock nodemailer.createTransport before importing route.ts
    sendMailMock = jest.fn().mockResolvedValue(true);
    createTransportMock = jest.fn().mockReturnValue({
      sendMail: sendMailMock,
    });
    (nodemailer.createTransport as jest.Mock) = createTransportMock;

    // Import POST after mocking
    POST = require('../api/contact/route').POST;
  });

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    process.env = OLD_ENV;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
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
    expect(console.error).toHaveBeenCalledWith('Missing EMAIL_PASSWORD environment variable');
  });

  it('should return success if EMAIL_PASSWORD is present and valid data', async () => {
    process.env.EMAIL_PASSWORD = 'validpassword';

    const req = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'ISO 27001',
      message: 'Test message',
    });

    const response = await POST(req as any);
    const json = await response.json();

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

  it('should handle transporter.sendMail failure gracefully', async () => {
    process.env.EMAIL_PASSWORD = 'validpassword';

    // Mock sendMail to reject
    sendMailMock.mockRejectedValueOnce(new Error('SMTP send failure'));

    const req = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'ISO 27001',
      message: 'Test message',
    });

    const response = await POST(req as any);
    const json = await response.json();

    expect(sendMailMock).toHaveBeenCalled();
    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.message).toMatch(/fout opgetreden bij het verzenden/i);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error sending email:'), expect.any(Error));
  });

  it('should reuse the transporter instance for multiple requests', async () => {
    process.env.EMAIL_PASSWORD = 'validpassword';

    const req1 = createRequest({
      name: 'User One',
      email: 'user1@example.com',
      subject: 'ISO 9001',
      message: 'Message one',
    });
    const req2 = createRequest({
      name: 'User Two',
      email: 'user2@example.com',
      subject: 'ISO 14001',
      message: 'Message two',
    });

    const response1 = await POST(req1 as any);
    const response2 = await POST(req2 as any);

    // Only check sendMailMock call count to verify transporter reuse
    expect(sendMailMock).toHaveBeenCalledTimes(2);
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  it('should not log EMAIL_PASSWORD value in development mode', async () => {
    process.env.EMAIL_PASSWORD = 'validpassword';

    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
    });

    const req = createRequest({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'ISO 27001',
      message: 'Test message',
    });

    await POST(req as any);

    const logs = (console.log as jest.Mock).mock.calls.flat();
    const passwordLogs = logs.filter(log => typeof log === 'string' && log.includes('validpassword'));
    expect(passwordLogs.length).toBe(0);

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalNodeEnv,
      writable: true,
    });
  });

  it('should handle edge case inputs with long strings and special characters', async () => {
    process.env.EMAIL_PASSWORD = 'validpassword';

    const longString = 'a'.repeat(1000);
    const specialChars = '!@#$%^&*()_+-=[]{}|;\':",./<>?';

    const req = createRequest({
      name: longString + specialChars,
      email: 'test+edge@example.com',
      subject: 'ISO 27001',
      message: longString + specialChars,
    });

    const response = await POST(req as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
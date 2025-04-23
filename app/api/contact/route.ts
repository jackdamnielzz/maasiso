import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SMTPError {
  code?: string;
  message?: string;
  responseCode?: number;
  command?: string;
  stack?: string;
}

// Valid subject options
const validSubjects = [
  'ISO 27001',
  'ISO 9001',
  'ISO 14001',
  'Informatiebeveiliging',
  'Compliance',
  'Privacy/AVG',
  'Advies',
  'Samenwerking',
  'Anders'
];

// Create a nodemailer transporter once, reuse for all requests
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Hostinger SMTP server
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'info@maasiso.nl', // Your email address
    pass: process.env.EMAIL_PASSWORD, // Email password from environment variables
  },
  debug: true, // Enable debug output
  logger: true // Log information about the mail
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json() as ContactFormData;

    // Validate the required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { success: false, message: 'Alle velden zijn verplicht.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, message: 'Ongeldig e-mailadres.' },
        { status: 400 }
      );
    }

    // Validate subject is from the allowed list
    if (!validSubjects.includes(body.subject)) {
      return NextResponse.json(
        { success: false, message: 'Selecteer een geldig onderwerp.' },
        { status: 400 }
      );
    }

    // Validate presence of EMAIL_PASSWORD environment variable
    if (!process.env.EMAIL_PASSWORD) {
      console.error('Missing EMAIL_PASSWORD environment variable');
      return NextResponse.json(
        {
          success: false,
          message: 'Server configuration error: missing EMAIL_PASSWORD environment variable.'
        },
        { status: 500 }
      );
    }

    // Log the form submission (avoid logging environment variables in production)
    console.log('Contact form submission:', body);
    if (process.env.NODE_ENV === 'development') {
      console.log('EMAIL_PASSWORD set:', process.env.EMAIL_PASSWORD ? 'Yes (value hidden)' : 'No');
      console.log('Environment variables:', {
        NODE_ENV: process.env.NODE_ENV,
        // Add other relevant env vars here, but DON'T log the actual password
      });
    }

    // Removed transporter.verify() call to avoid overhead on every request

    // Send the email
    const mailOptions = {
      from: `"${body.name}" <info@maasiso.nl>`,
      to: 'info@maasiso.nl',
      subject: `[Contact Form] ${body.subject}`,
      text: `Name: ${body.name}\nEmail: ${body.email}\nMessage:\n${body.message}`
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (sendError) {
      console.error('Error sending email:', sendError);
      return NextResponse.json(
        {
          success: false,
          message: 'Er is een fout opgetreden bij het verzenden van de e-mail. Probeer het later opnieuw.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Bericht succesvol verzonden.' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Er is een fout opgetreden bij het verwerken van uw aanvraag. Probeer het later opnieuw.'
      },
      { status: 500 }
    );
  }
}
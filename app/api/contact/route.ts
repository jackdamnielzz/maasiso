import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
interface SMTPError {
  code?: string;
  message?: string;
  responseCode?: number;
  command?: string;
  stack?: string;
}

// Define the expected request body structure
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

interface EmailError {
  code?: string;
  name?: string;
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

   // Log the form submission and environment variables (password masked for security)
   console.log('Contact form submission:', body);
   console.log('EMAIL_PASSWORD set:', process.env.EMAIL_PASSWORD ? 'Yes (value hidden)' : 'No');
   console.log('Environment variables:', {
     NODE_ENV: process.env.NODE_ENV,
     // Add other relevant env vars here, but DON'T log the actual password
   });

   // Create a nodemailer transporter
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
   
   // Test SMTP connection before sending
   try {
     console.log('Testing SMTP connection...');
     await transporter.verify();
     console.log('SMTP connection successful!');
   } catch (error) {
     const smtpError = error as SMTPError;
     console.error('SMTP connection failed:', smtpError);
     
     // Include detailed error in response (only in development)
     const isDev = process.env.NODE_ENV === 'development';
     
     return NextResponse.json(
       {
         success: false,
         message: 'Er is een fout opgetreden bij de verbinding met de mailserver.',
         error: isDev ? {
           code: smtpError.code,
           message: smtpError.message,
           responseCode: smtpError.responseCode,
           command: smtpError.command,
           stack: smtpError.stack
         } : 'Details alleen zichtbaar in development mode'
       },
       { status: 500 }
     );
   }

    // Prepare email content
    const mailOptions = {
      from: '"MaasISO Website" <info@maasiso.nl>',
      to: 'info@maasiso.nl',
      replyTo: body.email,
      subject: `Contactformulier: ${body.subject}`,
      text: `
Naam: ${body.name}
E-mail: ${body.email}
Onderwerp: ${body.subject}

Bericht:
${body.message}
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #091E42;">Nieuw bericht via contactformulier</h2>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; width: 120px;"><strong>Naam:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${body.name}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>E-mail:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${body.email}" style="color: #FF8B00;">${body.email}</a></td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Onderwerp:</strong></td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${body.subject}</td>
    </tr>
  </table>
  
  <div style="margin-top: 20px;">
    <strong>Bericht:</strong>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
      ${body.message.replace(/\n/g, '<br>')}
    </div>
  </div>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
    <p>Dit bericht is verzonden via het contactformulier op de MaasISO website.</p>
  </div>
</div>
      `,
    };

    try {
      // Send the email
      console.log('Attempting to send email...');
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);
      
      // Return a success response
      return NextResponse.json(
        {
          success: true,
          message: 'Uw bericht is succesvol verzonden. We nemen zo snel mogelijk contact met u op.'
        },
        { status: 200 }
      );
    } catch (error) {
      const emailError = error as EmailError;
      console.error('Error sending email:', emailError);
      // Log the specific error details for debugging
      console.error('Error name:', emailError.name);
      console.error('Error message:', emailError.message);
      console.error('Stack trace:', emailError.stack);
      
      if (emailError.code) {
        console.error('Error code:', emailError.code);
      }
      
      // Include detailed error in response (always include for troubleshooting)
      return NextResponse.json(
        {
          success: false,
          message: 'Er is een fout opgetreden bij het versturen van de e-mail. Probeer het later opnieuw.',
          debug: {
            emailError: {
              code: emailError.code,
              name: emailError.name,
              message: emailError.message,
              responseCode: emailError.responseCode,
              command: emailError.command
            },
            auth: {
              user: 'info@maasiso.nl',
              pass: process.env.EMAIL_PASSWORD ? '***PASSWORD SET***' : '***PASSWORD NOT SET***'
            },
            env: process.env.NODE_ENV
          }
        },
        { status: 500 }
      );
    }
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
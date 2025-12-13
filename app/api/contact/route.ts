import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

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

interface EmailError {
  code?: string;
  name?: string;
  message?: string;
  responseCode?: number;
  command?: string;
  stack?: string;
}

/**
 * Send email via Microsoft Graph API (application permissions).
 *
 * Requires:
 * - AZURE_TENANT_ID
 * - AZURE_CLIENT_ID
 * - AZURE_CLIENT_SECRET
 * - GRAPH_USER_ID (optional; falls back to EMAIL_USER)
 */
async function sendEmailViaGraph(options: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  replyTo: string;
}) {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const userId = process.env.GRAPH_USER_ID || process.env.EMAIL_USER;

  if (!tenantId || !clientId || !clientSecret || !userId) {
    throw new Error('Microsoft Graph configuration incomplete');
  }

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default']
  });

  const client = Client.initWithMiddleware({ authProvider });

  const message = {
    subject: options.subject,
    body: {
      contentType: 'HTML',
      content: options.htmlBody
    },
    toRecipients: [{ emailAddress: { address: options.to } }],
    replyTo: [{ emailAddress: { address: options.replyTo } }]
  };

  await client.api(`/users/${userId}/sendMail`).post({ message });
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

   const isDev = process.env.NODE_ENV === 'development';
   const isContactDebug = process.env.CONTACT_DEBUG === 'true';

   // Support multiple env var names to prevent deployment misconfig issues.
   // Preferred: EMAIL_PASSWORD (and optionally EMAIL_USER / SMTP_HOST / SMTP_PORT / SMTP_SECURE)
   const smtpHost = (process.env.SMTP_HOST || 'smtp.hostinger.com').trim();
   const smtpPort = Number((process.env.SMTP_PORT || '465').toString().trim());
   const smtpSecure =
     typeof process.env.SMTP_SECURE === 'string'
       ? process.env.SMTP_SECURE.trim().toLowerCase() === 'true'
       : true;

   const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || 'info@maasiso.nl').trim();
   const emailPassword =
     (process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').trim() || undefined;

   const useGraph = !!(
     process.env.AZURE_CLIENT_ID &&
     process.env.AZURE_CLIENT_SECRET &&
     process.env.AZURE_TENANT_ID
   );

   // Log the form submission and environment variables (password masked for security)
   console.log('Contact form submission:', body);
   console.log('Email send config:', {
     NODE_ENV: process.env.NODE_ENV,
     USE_GRAPH: useGraph,
     AZURE_TENANT_ID_SET: process.env.AZURE_TENANT_ID ? 'Yes' : 'No',
     AZURE_CLIENT_ID_SET: process.env.AZURE_CLIENT_ID ? 'Yes' : 'No',
     AZURE_CLIENT_SECRET_SET: process.env.AZURE_CLIENT_SECRET ? 'Yes (value hidden)' : 'No',
     GRAPH_USER_ID_SET: process.env.GRAPH_USER_ID ? 'Yes' : 'No',
     SMTP_HOST: smtpHost,
     SMTP_PORT: smtpPort,
     SMTP_SECURE: smtpSecure,
     EMAIL_USER: emailUser,
     EMAIL_PASSWORD_SET: emailPassword ? 'Yes (value hidden)' : 'No'
   });

    // Prepare email content (shared for Graph + SMTP)
    const mailOptions = {
      from: `"MaasISO Website" <${emailUser}>`,
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

   if (useGraph) {
     try {
       console.log('Attempting to send email via Microsoft Graph...');
       await sendEmailViaGraph({
         to: mailOptions.to,
         subject: mailOptions.subject,
         htmlBody: mailOptions.html,
         textBody: mailOptions.text,
         replyTo: mailOptions.replyTo
       });
       console.log('Email sent successfully via Microsoft Graph!');

       return NextResponse.json(
         { success: true, message: 'Uw bericht is succesvol verzonden. We nemen zo snel mogelijk contact met u op.' },
         { status: 200 }
       );
     } catch (graphError) {
       console.error('Microsoft Graph API failed:', graphError);
       console.log('Falling back to SMTP...');
       // Continue to SMTP fallback below
     }
   }

   // Existing SMTP code here (only runs if Graph not configured OR Graph failed)

   // Fail fast if SMTP credentials are missing (common cause of 500 in production)
   if (!emailPassword) {
     return NextResponse.json(
       {
         success: false,
         message:
           'Er is een fout opgetreden bij de verbinding met de mailserver. (Server configuratie ontbreekt)',
         error: isDev
           ? {
               missingEnv: ['EMAIL_PASSWORD (preferred)', 'or SMTP_PASS / SMTP_PASSWORD'].filter(
                 Boolean
               )
             }
           : 'Details alleen zichtbaar in development mode'
       },
       { status: 500 }
     );
   }

   // Create a nodemailer transporter
   const transporter = nodemailer.createTransport({
     host: smtpHost,
     port: smtpPort,
     secure: smtpSecure, // true for 465, false for other ports
     auth: {
       user: emailUser,
       pass: emailPassword
     },
     debug: isDev, // Enable debug output only in development
     logger: isDev // Log information about the mail only in development
   });
   
   // Test SMTP connection before sending
   try {
     console.log('Testing SMTP connection...');
     await transporter.verify();
     console.log('SMTP connection successful!');
   } catch (error) {
     const smtpError = error as SMTPError;
     console.error('SMTP connection failed:', smtpError);
     
     // Include detailed error in response (development or explicitly enabled debug)
     return NextResponse.json(
       {
         success: false,
         message: 'Er is een fout opgetreden bij de verbinding met de mailserver.',
         error: isDev || isContactDebug
           ? {
               code: smtpError.code,
               message: smtpError.message,
               responseCode: smtpError.responseCode,
               command: smtpError.command,
               stack: smtpError.stack
             }
           : 'Details alleen zichtbaar in development mode'
       },
       { status: 500 }
     );
   }

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
    const serverError = error as Error;
    console.error('Error processing contact form:', serverError);

    const isDev = process.env.NODE_ENV === 'development';
    const isContactDebug = process.env.CONTACT_DEBUG === 'true';

    return NextResponse.json(
      {
        success: false,
        message: 'Er is een fout opgetreden bij het verwerken van uw aanvraag. Probeer het later opnieuw.',
        error: isDev || isContactDebug
          ? {
              name: serverError.name,
              message: serverError.message,
              stack: serverError.stack
            }
          : undefined
      },
      { status: 500 }
    );
  }
}
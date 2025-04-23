/**
 * Minimal SMTP connectivity test script using nodemailer.
 * Connects to smtp.hostinger.com on port 465 with secure connection.
 * Authenticates using EMAIL_PASSWORD environment variable.
 * Outputs success or detailed error messages.
 */

const nodemailer = require('nodemailer');

async function testSmtpConnectivity() {
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailPassword) {
    console.error('ERROR: EMAIL_PASSWORD environment variable is not set.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: 'your-email@example.com', // Replace with your email address
      pass: emailPassword,
    },
  });

  try {
    await transporter.verify();
    console.log('SMTP connection successful: Able to connect and authenticate.');
  } catch (error) {
    console.error('SMTP connection failed:');
    if (error.response) {
      console.error('Response:', error.response);
    }
    if (error.code) {
      console.error('Code:', error.code);
    }
    console.error(error);
    process.exit(1);
  }
}

testSmtpConnectivity();
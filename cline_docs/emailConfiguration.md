# Comprehensive Email Configuration Troubleshooting Guide

## Detailed Diagnostic Approach

### Email Sending Diagnostics
1. Check Detailed Logs
   - Location: /var/log/contact-form-detailed-errors.log
   - Contains:
     * Timestamp of error
     * Specific error messages
     * Server variables
     * Sanitized POST data

2. Verify PHP Mail Configuration
   - Confirm mail() function is enabled
   - Check sendmail_path in php.ini
   - Validate mail server settings

### Potential Issues to Investigate
- Incorrect SMTP configuration
- Firewall blocking outgoing emails
- Incorrect sender domain authentication
- SPF/DKIM/DMARC record issues

### Recommended Debugging Steps
```bash
# Check PHP mail configuration
php -i | grep sendmail
php -i | grep mail

# Test mail function directly
php -r "var_dump(mail('test@example.com', 'Test', 'Test message'));"
```

### Alternative Email Sending Methods
1. PHPMailer Library
2. SMTP Configuration
3. Third-party Email Services
   - SendGrid
   - Mailgun
   - Amazon SES

### Server-Side Checks
- Verify postfix/sendmail is running
- Check mail queue
- Review system logs (/var/log/mail.log)

### Hosting-Specific Recommendations
1. Contact Clou86 support
2. Request:
   - Confirmation of mail() function availability
   - SMTP server details
   - Email sending restrictions

## Next Immediate Actions
1. Review /var/log/contact-form-detailed-errors.log
2. Perform PHP mail function test
3. Consult hosting provider

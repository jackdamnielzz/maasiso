# SMTP Configuration

## Current Status
- **Configuration Status:** On hold
- **Reason:** Pending migration to Hostinger hosting
- **Next Steps:** Await migration completion for proper SMTP setup

## Previous Gmail SMTP Configuration Plan
This configuration was planned but not implemented due to pending hosting migration:

### Gmail Account Details
- Email: maassure@gmail.com
- Purpose: Sending backup notifications via SMTP relay
- Status: Implementation paused

## Planned Setup Steps (For Reference)
Note: These steps may change after migration to Hostinger

1. Create App Password
   - Go to Google Account settings (https://myaccount.google.com)
   - Navigate to Security > 2-Step Verification
   - Scroll down to "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Name it "MaasISO Backup Notifications"
   - Copy the generated 16-character password

2. Configure Postfix
```bash
# Add to /etc/postfix/sasl_passwd
[smtp.gmail.com]:587 maassure@gmail.com:YOUR_APP_PASSWORD

# Create hash database
postmap /etc/postfix/sasl_passwd

# Set permissions
chmod 600 /etc/postfix/sasl_passwd*
```

3. Update main.cf
```bash
# Gmail SMTP settings
relayhost = [smtp.gmail.com]:587
smtp_use_tls = yes
smtp_sasl_auth_enable = yes
smtp_sasl_security_options = noanonymous
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt
smtp_sender_dependent_authentication = yes
sender_canonical_maps = regexp:/etc/postfix/sender_canonical
smtp_header_checks = regexp:/etc/postfix/header_checks
```

4. Create sender_canonical file
```bash
# /etc/postfix/sender_canonical
/^.*$/ backup@maasiso.nl
```

5. Create header_checks file
```bash
# /etc/postfix/header_checks
/^From:.*/ REPLACE From: MaasISO Backup System <backup@maasiso.nl>
```

## Post-Migration Tasks
1. Review Hostinger's SMTP requirements
2. Update configuration based on new hosting environment
3. Implement and test email delivery
4. Document final configuration

## Troubleshooting
- If authentication fails, verify App Password
- If TLS fails, check certificate path
- If sender rewrite fails, check sender_canonical permissions
- If headers not rewriting, check header_checks permissions

## Security Notes
- Store App Password securely
- Keep sasl_passwd file permissions restricted (600)
- Regular password rotation recommended
- Monitor for unauthorized access

## Revision History
- **Date:** 2025-01-14
- **Description:** Initial Gmail SMTP relay configuration
- **Author:** AI
- **Date:** 2025-01-14
- **Description:** Updated to reflect pending hosting migration
- **Author:** AI

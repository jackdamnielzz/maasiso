# Secure Credentials

## Gmail SMTP Credentials
- **Purpose:** MaasISO Backup Notifications
- **Email:** maassure@gmail.com
- **App Password:** wlph fhad auts xebe
- **Created:** 2025-01-14
- **Usage:** PostgreSQL backup email notifications via Postfix

## Strapi API Token
- **Purpose:** Frontend API Access
- **Token:** 43cc26f5da8221caf1b34c628805eeadce1b475f5ac5eecdc4483e5bada78c8cb65712f2084ae21b82ea974d2dff1dfe0b9c100d8d112666caba842be90b74043b810f0dc2c39f95b4b775bdf03772b9f161888a2c37c8e1ce4c5aeb57c0b6d477b59d5ed8647fc9210e99efdeb3416e4ed00da73ad870f144f1eedb650ed95b
- **Created:** 2025-02-03
- **Usage:** Authentication for frontend API requests to Strapi

## Security Notes
- Keep this file secure and restricted
- Do not share or expose these credentials
- Rotate credentials periodically
- Store backup copy securely offline

## Usage Instructions
1. Used in Postfix configuration for SMTP relay
2. Required for backup notification delivery
3. Configure in /etc/postfix/sasl_passwd
4. Used in frontend .env for Strapi API access

## Backup Recovery
In case of system recovery:
1. Configure Postfix with these credentials
2. Test email delivery
3. Verify notification system
4. Configure frontend with Strapi API token

## Revision History
- **Date:** 2025-01-14
- **Description:** Initial Gmail SMTP credentials setup
- **Author:** AI

- **Date:** 2025-02-03
- **Description:** Added Strapi API token
- **Author:** AI

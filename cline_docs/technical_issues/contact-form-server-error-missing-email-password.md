# Technical Issue: Contact Form Server Error (Missing EMAIL_PASSWORD)

**Date:** April 22, 2025

**Problem Description:**
Users attempting to submit the contact form on the live website (https://maasiso.nl/contact) received a generic server error page (50x.html) instead of a success message or a specific error response.

**Diagnosis:**
1.  Examined the frontend code (`src/components/features/ContactForm.tsx`), confirming it submits a POST request to the `/api/contact` endpoint.
2.  Reviewed the backend API route handler (`app/api/contact/route.ts`), which uses `nodemailer` to send emails and relies on the `EMAIL_PASSWORD` environment variable for SMTP authentication.
3.  Suspected a `:ConfigurationError` where the `EMAIL_PASSWORD` was not correctly set in the production environment.
4.  Used SSH to connect to the frontend VPS (147.93.62.188) and investigated the running Next.js process using PM2 commands:
    *   `pm2 list` confirmed the application was running as a PM2 process named `frontend` (id 0).
    *   `pm2 describe frontend` showed process details, including the script path and execution directory.
    *   `pm2 env 0` listed the environment variables available to the running `frontend` process. This confirmed that `EMAIL_PASSWORD` was missing from the environment.

**Root Cause:**
The `EMAIL_PASSWORD` environment variable, required by the backend contact form API route for sending emails via SMTP, was not configured in the PM2 process environment on the production frontend VPS. This caused the `nodemailer` setup to fail, leading to an unhandled exception and the generic `:ServerError`.

**Solution:**
1.  Located the PM2 configuration file, identified as `ecosystem.config.js` in the application root directory (`/var/www/frontend`).
2.  Due to issues with remote command execution for file modification (:ToolLimitation, :QuotingIssue), the `ecosystem.config.js` file became corrupted during initial attempts.
3.  The file was manually edited using `nano` in the active SSH session on the frontend VPS. The entire content was replaced with the correct configuration, ensuring the `EMAIL_PASSWORD` was added to the `env_production` block.
4.  The PM2 process was reloaded using the command `pm2 reload --update-env frontend` in the SSH session. The `--update-env` flag is crucial to ensure PM2 loads the updated environment variables from the configuration file into the running process.

**Verification:**
Testing the contact form on the live website (https://maasiso.nl/contact) confirmed that submissions are now successful and the `:ServerError` is resolved.

**SAPPO Concepts Involved:**
*   `:ServerError`: The initial problem observed by the user.
*   `:ConfigurationError`: The underlying cause of the server error (missing environment variable).
*   `:EnvironmentVariables`: The specific type of configuration issue.
*   `:PM2`: The process manager used on the VPS.
*   `:DeploymentPattern`: The context of the issue within the application deployment.
*   `:ToolLimitation`: The constraint encountered with remote command execution for file modification.
*   `:QuotingIssue`: The specific technical problem encountered with `sed` and `cat` commands over SSH.
*   `:SecurityVulnerability`: Highlighted by the exposure of root credentials during the debugging process (:CredentialExposure).

**Preventative Measures:**
*   Ensure all necessary environment variables are correctly defined in the PM2 `ecosystem.config.js` file for all relevant environments (e.g., `env_production`).
*   Always use `pm2 reload --update-env <process_name>` after modifying environment variables in the ecosystem file.
*   Implement a secure method for managing secrets and environment variables in production, avoiding hardcoding or sharing credentials directly. Consider using SSH keys instead of passwords for server access.
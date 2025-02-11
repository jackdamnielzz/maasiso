# Deployment Guide for MaasISO Frontend

This guide outlines the new deployment workflow using VSCode's Remote-SSH extension for the MaasISO frontend.

## Prerequisites

- Visual Studio Code installed
- Remote-SSH extension installed
- SSH access to Hostinger VPS
- Node.js 20+ installed on VPS
- Production environment variables configured

## Initial Setup

Follow the detailed setup instructions in `cline_docs/vscode_remote_deployment_guide.md` to:
1. Install and configure VSCode Remote-SSH extension
2. Set up SSH connection to the VPS
3. Configure SSH keys and authentication

## Development Workflow

1. **Local Development:**
   - Make and test changes in local development environment
   - Ensure all tests pass and changes work as expected

2. **Build Project:**
   ```bash
   npm install
   npm run build:prod
   ```

## Deployment Steps

1. **Connect to VPS:**
   - Open VSCode Command Palette (Ctrl+Shift+P)
   - Select "Remote-SSH: Connect to Host..."
   - Choose the maasiso-vps connection

2. **Deploy Changes:**
   - Navigate to website directory in VSCode
   - Copy built files to appropriate locations
   - Update any necessary configurations

3. **Verify Deployment:**
   - Use VSCode's integrated terminal to check server status
   - Verify PM2 processes: `pm2 status`
   - Check application logs: `pm2 logs maasiso`

## Environment Variables

Ensure the following environment variables are correctly set in the production environment:

Required:
- `NEXT_PUBLIC_API_URL`: Strapi API URL
- `NEXT_PUBLIC_STRAPI_TOKEN`: Strapi API token
- `NEXT_PUBLIC_SITE_URL`: Frontend site URL (https://maasiso.nl)

Optional:
- `NEXT_PUBLIC_GRAPHQL_URL`: GraphQL endpoint
- `NEXT_PUBLIC_ENABLE_BLOG`: Feature flag (defaults to true)
- `NEXT_PUBLIC_ENABLE_TOOLS`: Feature flag (defaults to true)
- `NEXT_PUBLIC_DEBUG`: Debug mode (defaults to false)

## Post-Deployment Verification

1. Check if the site loads correctly at https://maasiso.nl
2. Verify all pages are working:
   - Home page
   - News page
   - Blog page
   - Whitepaper page
   - Dynamic pages
3. Test the API connections
4. Check if images and static assets are loading
5. Verify forms and interactive elements

## Troubleshooting

If you encounter issues:

1. Check PM2 logs: `pm2 logs maasiso`
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
5. Verify the API endpoints are accessible

## Support

For technical support or questions about the deployment process, contact the development team.

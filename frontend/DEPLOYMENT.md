# Deployment Guide for MaasISO Frontend

This guide outlines the steps to deploy the MaasISO frontend to Hostinger.

## Prerequisites

- Node.js 18+ installed
- Access to Hostinger control panel
- Production environment variables configured

## Build Steps

1. Install dependencies:
```bash
npm install
```

2. Build the production version:
```bash
npm run build:prod
```

This will:
- Clean the previous build
- Run linting checks
- Create an optimized production build

## Deployment Steps

1.  **Log in to Hostinger control panel.**
2.  **Navigate to your hosting space for maasiso.nl.**
3.  **Find the "Git" section in the "Websites" management area.**
4.  **Create a New Repository:**
    *   Select the correct **Repository Address** and **Branch** (e.g., `main` or `master`).
    *   Leave the **Install Path** empty. This will deploy your website to the account's root folder (`/public_html`).  **Important:** The install path directory must be empty.
    *   Click "Create".
5. **Set up Node.js environment:**
      * In Hostinger control panel, ensure Node.js version is set to 18+
      * Configure the entry point as `server.js` if you have custom server logic. If you are using the default Next.js server, you may not need to specify this.
6. **(Optional) Set up Auto Deployment:**
    * Click the "Auto Deployment" button.
    * Copy the provided **Webhook URL**.
    * In your GitHub/GitLab/Bitbucket repository settings, add a webhook that triggers on push events to the selected branch. Paste the Hostinger Webhook URL. This will automatically deploy your project whenever you push new commits.

After the initial deployment (or after a webhook triggers a deployment), Hostinger will automatically:

*   Clone your repository.
*   Run `npm install --production` (if a `package.json` file exists).
*   Run `npm run build` (if a `build` script exists in `package.json`).
*   Run `npm start` (if a `start` script exists in `package.json`).


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

1. Check the server logs in Hostinger control panel
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed
4. Check if the Node.js version is correct
5. Verify the API endpoints are accessible

## Support

For technical support or questions about the deployment process, contact the development team.

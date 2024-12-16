# Instructions for Obtaining Google API Keys

This document provides instructions on how to obtain the necessary API key for the Google PageSpeed Insights API.

## Google PageSpeed Insights API

1.  **Go to the Google Cloud Console**:
    *   Open your web browser and navigate to the Google Cloud Console: [https://console.cloud.google.com/](https://console.cloud.google.com/)
    *   If you don't have a Google Cloud account, you'll need to create one.

2.  **Create a New Project**:
    *   If you don't have an existing project, click on the project dropdown at the top of the page and select "New Project".
    *   Enter a project name (e.g., "SEO Scanner") and click "Create".

3.  **Enable the PageSpeed Insights API**:
    *   In the left-hand menu, navigate to "APIs & Services" > "Library".
    *   **Important:** At the top of the page, there is a search bar labeled "Search for APIs & Services". Use this search bar to search for "PageSpeed Insights API" and click on it. Do not browse through the categories.
    *   Click the "Enable" button.

4.  **Create API Credentials**:
    *   In the left-hand menu, navigate to "APIs & Services" > "Credentials".
    *   Click "Create Credentials" and select "API key".
    *   Copy the generated API key.

## Important Notes

*   **API Key Security**: Keep your API key secure and do not share it publicly.
*   **API Usage Limits**: Be aware of the usage limits for the API.
*   **Billing**: You may need to enable billing for your Google Cloud project to use the API.

Once you have obtained the API key, you will need to add it to the `seo_scanner.py` script. You can do this by storing it in a `.env` file and loading it into the script.

This document will guide you through the process of obtaining the necessary API key.

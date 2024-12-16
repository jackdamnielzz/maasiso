# SEO Scanner MVP

This document defines the Minimum Viable Product (MVP) for the SEO scanner. The MVP will focus on essential functionality to provide a basic SEO analysis of the Maasiso website.

## MVP Goals

1.  **Basic On-Page Analysis**: Implement checks for essential on-page SEO elements.
2.  **Page Speed Check**: Include a basic check for page loading speed.
3.  **Mobile-Friendliness Check**: Include a basic check for mobile-friendliness.
4.  **Simple Reporting**: Generate a simple report summarizing the findings.

## MVP Features

1.  **On-Page Analysis**:
    *   **Title Tag Check**: Verify that each page has a title tag.
    *   **Meta Description Check**: Verify that each page has a meta description.
    *   **Header Tag Check**: Verify that each page has at least one H1 tag.
    *   **Image Alt Text Check**: Verify that images have alt text.
2.  **Page Speed Check**:
    *   Use Google PageSpeed Insights API to get a basic page speed score.
3.  **Mobile-Friendliness Check**:
    *   Use Google Mobile-Friendly Test API to check if the page is mobile-friendly.
4.  **Reporting**:
    *   Generate a simple report that includes:
        *   A list of pages scanned.
        *   The results of the on-page analysis (title tag, meta description, header tag, image alt text).
        *   The page speed score.
        *   The mobile-friendliness check result.

## MVP Implementation

1.  **Web Scraping**: Use a web scraping library to extract data from the website's HTML.
2.  **HTML Parsing**: Parse the HTML to identify key SEO elements.
3.  **Google APIs**: Use Google PageSpeed Insights API and Google Mobile-Friendly Test API.
4.  **Reporting**: Generate a simple text-based report.

## MVP Technology Stack

*   Python
*   Beautiful Soup
*   Google PageSpeed Insights API
*   Google Mobile-Friendly Test API

## MVP Limitations

*   The MVP will not include advanced features such as keyword analysis, link analysis, or content analysis.
*   The MVP will only generate a simple text-based report.
*   The MVP will not include a user interface.

This MVP will be used as a starting point for the development of the SEO scanner.

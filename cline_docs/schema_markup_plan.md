# Schema.org Markup Implementation Plan

## Overview
This document outlines the comprehensive plan for implementing Schema.org markup across the MaasISO website to improve SEO and rich snippets in search results.

## Current Status
- Basic Organization markup exists
- No structured data for services
- No breadcrumb markup
- No WebSite markup

## Implementation Strategy

### 1. Homepage (index.html)
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.maasiso.nl/#website",
      "url": "https://www.maasiso.nl",
      "name": "MaasISO",
      "description": "ISO Certificering en Implementatie Diensten",
      "publisher": {"@id": "https://www.maasiso.nl/#organization"}
    },
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": "https://www.maasiso.nl/#organization",
      "name": "MaasISO",
      "url": "https://www.maasiso.nl",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.maasiso.nl/images/logo.png"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "info@maasiso.nl",
        "contactType": "customer service"
      },
      "sameAs": [
        "https://www.linkedin.com/company/maasiso",
        "https://twitter.com/maasiso"
      ]
    },
    {
      "@type": "Service",
      "@id": "https://www.maasiso.nl/#iso9001service",
      "name": "ISO 9001 Kwaliteitsmanagement",
      "provider": {"@id": "https://www.maasiso.nl/#organization"},
      "description": "Optimaliseer uw bedrijfsprocessen en verhoog klanttevredenheid met onze ISO 9001 implementatie en certificeringsbegeleiding."
    },
    {
      "@type": "Service",
      "@id": "https://www.maasiso.nl/#iso27001service",
      "name": "ISO 27001 Informatiebeveiliging",
      "provider": {"@id": "https://www.maasiso.nl/#organization"},
      "description": "Bescherm uw bedrijfsinformatie en versterk het vertrouwen van uw stakeholders met onze ISO 27001 advies- en implementatiediensten."
    },
    {
      "@type": "Service",
      "@id": "https://www.maasiso.nl/#avgservice",
      "name": "AVG Compliance",
      "provider": {"@id": "https://www.maasiso.nl/#organization"},
      "description": "Zorg dat uw organisatie voldoet aan de Algemene Verordening Gegevensbescherming (AVG) met onze expertise in privacywetgeving en databeveiliging."
    }
  ]
}
```

### 2. Service Pages Structure
Each service page (iso-9001.html, iso-27001.html, avg-compliance.html) will include:
- Service markup with detailed offering information
- BreadcrumbList markup
- Organization reference
- FAQ markup where applicable

### 3. About Us Page (over-ons.html)
- Organization markup with extended details
- BreadcrumbList markup
- Team member markup if applicable

### 4. Contact Page (contact.html)
- Organization markup with contact details
- BreadcrumbList markup
- ContactPage specific markup

### 5. Legal Pages
- WebPage markup
- BreadcrumbList markup
- Organization reference

## Implementation Order
1. index.html
2. diensten.html
3. iso-9001.html
4. iso-27001.html
5. avg-compliance.html
6. over-ons.html
7. contact.html
8. Legal pages

## Testing Protocol
1. Use Google's Rich Results Test for each page
2. Validate using Schema.org Validator
3. Check implementation in Google Search Console
4. Monitor rich snippet appearance in search results

## Maintenance Plan
- Regular validation checks (monthly)
- Update markup when content changes
- Monitor Google Search Console for markup errors
- Keep track of Schema.org updates and new features

## Success Metrics
- Improved rich snippets in search results
- Better click-through rates
- Enhanced search engine visibility
- More accurate search result displays

## Tools & Resources
- Google's Rich Results Test
- Schema.org Validator
- Google Search Console
- Schema.org Documentation
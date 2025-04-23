# Feature Grid Icons Implementation

## Overview

This document details the implementation of appropriate icons for feature grid tiles across all pages of the MaasISO website. The goal was to ensure that each feature tile displays an icon that matches its content/topic, while maintaining consistent icon styling across all feature grid components.

## Implementation Date
March 4, 2025

## Components Created

### 1. SVG Icons
Created a set of themed SVG icons in the `public/icons` directory:
- `certificate.svg` - For general ISO certification
- `compliance.svg` - For compliance and standards
- `consulting.svg` - For advisory and integration services
- `privacy.svg` - For GDPR/AVG related services
- `quality.svg` - Simple checkmark icon for quality-related features
- `risk.svg` - For risk assessment
- `shield.svg` - For information security
- `training.svg` - For education and expertise

All icons follow a consistent style with:
- 24x24 viewBox
- Stroke-based design (no fills)
- #00875A color (MaasISO brand green)
- 2px stroke width
- Round line caps and joins

### 2. Icon Mapping Utility
Created a utility function in `src/lib/utils/iconMapper.ts` that intelligently maps feature titles to appropriate icons:

```typescript
export function getIconForFeature(title: string): string {
  // Convert title to lowercase for case-insensitive matching
  const lowerTitle = title.toLowerCase();

  // Specific service matching for MaasISO
  if (lowerTitle.includes('iso 27001') || lowerTitle.includes('informatiebeveiliging')) {
    return '/icons/shield.svg';
  }
  
  if (lowerTitle.includes('iso 9001') || lowerTitle.includes('kwaliteitsmanagement')) {
    return '/icons/quality.svg';
  }
  
  // ... additional specific mappings ...
  
  // Generic category matching
  if (lowerTitle.includes('iso') || lowerTitle.includes('certificering')) {
    return '/icons/certificate.svg';
  }
  
  if (lowerTitle.includes('beveiliging') || lowerTitle.includes('security')) {
    return '/icons/shield.svg';
  }
  
  // ... additional generic mappings ...
  
  // Default icon selection with hash-based distribution
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const icons = ['/icons/certificate.svg', '/icons/shield.svg', '/icons/consulting.svg', '/icons/quality.svg'];
  return icons[hash % icons.length];
}
```

## Pages Updated

The following pages were updated to use the iconMapper utility:

1. **Diensten Page** (`app/diensten/page.tsx`)
   - Updated to use the iconMapper utility for feature grid tiles
   - Specific service mappings implemented:
     - ISO 27001 Informatiebeveiliging → shield.svg
     - ISO 9001 Kwaliteitsmanagement → quality.svg
     - ISO 14001 & 16175 → certificate.svg
     - AVG/GDPR Compliance → privacy.svg
     - BIO & Overheidsstandaarden → compliance.svg
     - Integratie van Managementsystemen → consulting.svg

2. **Onze Voordelen Page** (`app/onze-voordelen/page.tsx`)
   - Updated to use the iconMapper utility for feature grid tiles
   - Specific advantage mappings implemented:
     - Expertise en Ervaring → training.svg
     - Maatwerkoplossingen → consulting.svg
     - Praktische Aanpak → quality.svg
     - Continu Verbeteren → quality.svg
     - Transparante Communicatie → consulting.svg
     - Resultaatgericht → risk.svg

3. **Over Ons Page** (`app/over-ons/page.tsx`)
   - Updated to use the iconMapper utility for feature grid tiles

4. **Home Page** (`app/home/page.tsx`)
   - Updated to use the iconMapper utility for feature grid tiles
   - Added fallback to use iconMapper when no icon is provided from Strapi

## Implementation Details

### Icon Creation Process
1. Created a script (`scripts/create-icons.js`) to generate all the SVG icons
2. Used a separate script (`scripts/update-quality-icon.js`) to update the quality icon to a simple checkmark design

### Component Modifications
For each page with feature grid components, the following changes were made:

```tsx
// Before
{feature.icon && feature.icon.url ? (
  <div className="...">
    <img src={feature.icon.url} alt={feature.icon.alternativeText || feature.title || 'Service icon'} className="..." />
  </div>
) : (
  <div className="...">
    <svg xmlns="http://www.w3.org/2000/svg" className="..." fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
)}

// After
{feature.icon && feature.icon.url ? (
  <div className="...">
    <img src={feature.icon.url} alt={feature.icon.alternativeText || feature.title || 'Service icon'} className="..." />
  </div>
) : (
  <div className="...">
    <img
      src={getIconForFeature(feature.title || '')}
      alt={feature.title || 'Service icon'}
      className="..."
      data-testid="service-icon"
    />
  </div>
)}
```

## Testing

The implementation was tested by:
1. Verifying that all feature grid tiles display appropriate icons based on their content
2. Ensuring consistent icon styling across all pages
3. Checking that the iconMapper utility correctly maps feature titles to appropriate icons
4. Verifying that the default fallback mechanism works correctly for features without clear categorization

## Future Improvements

1. Add more specialized icons for additional feature categories
2. Implement a more sophisticated mapping algorithm that uses NLP techniques
3. Allow for icon customization through the CMS
4. Add animation effects to icons on hover
5. Consider implementing icon color variations based on feature categories
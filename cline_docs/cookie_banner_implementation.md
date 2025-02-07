# Cookie Banner Implementation

## Overview
The cookie banner system has been implemented with a complete cookie policy page and management system. The implementation follows the design language of the main website and provides users with clear control over their cookie preferences.

## Components

### Cookie Policy Page (`/cookie-policy`)
- Styled to match the main website's design language
- Hero section with navy background (#0B1C35) and orange accent color
- Comprehensive explanation of cookie types and usage
- Interactive cookie preferences management

### Footer Integration
- Cookie policy link added to the "Juridisch" section
- Social media links included for broader reach
- Consistent styling with the main website

### Cookie Management
- Clear categorization of cookie types:
  - Functional (always enabled)
  - Analytical
  - Marketing
  - Third-party
- User-friendly preference toggles
- Persistent storage of user preferences

## Technical Implementation
- Client-side cookie management with localStorage
- Server-side rendering compatible
- Type-safe implementation
- Responsive design for all devices

## File Structure
```
frontend/
├── app/
│   └── cookie-policy/
│       ├── page.tsx
│       └── metadata.ts
├── src/
│   ├── components/
│   │   └── cookies/
│   │       ├── CookieBanner.tsx
│   │       ├── CookiePreferences.tsx
│   │       ├── CookiePreferencesButton.tsx
│   │       └── CookieConsentProvider.tsx
│   └── lib/
│       └── cookies/
│           ├── types.ts
│           ├── cookieStorage.ts
│           └── cookieManager.ts
```

## Usage
The cookie banner appears on first visit and can be managed through:
1. Initial cookie banner buttons
2. Footer link to cookie policy
3. Cookie preferences button in policy page
4. Cookie settings button in banner

## Styling
- Matches MaasISO brand colors
- Consistent with main website design
- Responsive layout
- Accessible design patterns
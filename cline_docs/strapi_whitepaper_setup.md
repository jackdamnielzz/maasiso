# Strapi Whitepaper Lead Generation Setup

## Content Types Configuration

### 1. Whitepaper Collection Type
Current fields:
- Title (Text)
- Description (Rich Text)
- Version (Text)
- Author (Text)
- Download Link (Media)
- SEO Title (Text)
- SEO Description (Text)
- SEO Keywords (Text)
- Publication Date (Date)

### 2. Whitepaper Leads Collection Type (New)
Create a new collection type with the following fields:

| Field Name | Type | Description |
|------------|------|-------------|
| name | Text (required) | Lead's full name |
| email | Email (required) | Lead's email address |
| company | Text (required) | Company name |
| subscribeNewsletter | Boolean | Newsletter opt-in status |
| whitepaperTitle | Text (required) | Title of downloaded whitepaper |
| downloadDate | DateTime | Timestamp of download |
| status | Enumeration | "new", "contacted", "qualified", "converted" |
| notes | Rich Text | Internal notes about the lead |

### 3. Newsletter Subscribers Collection Type (New)
Create a new collection type to manage newsletter subscriptions:

| Field Name | Type | Description |
|------------|------|-------------|
| name | Text (required) | Subscriber's full name |
| email | Email (required, unique) | Subscriber's email address |
| company | Text | Company name |
| source | Text | How they subscribed (e.g., "whitepaper_download") |
| subscriptionDate | DateTime | When they subscribed |
| active | Boolean | Subscription status |
| unsubscribeReason | Text | Optional reason if unsubscribed |

## API Configuration

### Permissions
Set up the following permissions in Strapi's Users & Permissions plugin:

1. Whitepaper:
   - Public: Find and FindOne (to list and view whitepapers)
   - Authenticated: None required

2. Whitepaper Leads:
   - Public: Create (to submit lead information)
   - Authenticated: Find, FindOne (for admin access)

3. Newsletter Subscribers:
   - Public: Create (to add new subscribers)
   - Authenticated: Find, FindOne, Update (for admin access)

### API Endpoints
The following API endpoints will be available:

```
GET /api/whitepapers
GET /api/whitepapers/:id
POST /api/whitepaper-leads
POST /api/newsletter-subscribers
```

## Business Value

This setup enables:
1. Lead Generation:
   - Capture contact information before whitepaper downloads
   - Track which whitepapers are most popular
   - Build a database of interested prospects

2. Newsletter Growth:
   - Convert whitepaper downloads into newsletter subscribers
   - Track subscription sources
   - Maintain clean subscriber list

3. Lead Management:
   - Track lead status and progress
   - Add notes and follow-up information
   - Monitor conversion rates from downloads

4. Analytics:
   - Track most popular whitepapers
   - Monitor download trends
   - Measure conversion rates
   - Analyze subscriber growth

## Implementation Steps

1. Create Collection Types:
   - Go to Content-Type Builder in Strapi
   - Create each collection type with specified fields
   - Save and build the new types

2. Configure Permissions:
   - Go to Settings → Users & Permissions → Roles
   - Configure public and authenticated permissions
   - Save changes

3. Test API Endpoints:
   - Test whitepaper listing
   - Test lead submission
   - Test newsletter subscription

4. Monitor & Analyze:
   - Track lead generation
   - Monitor download patterns
   - Analyze conversion rates
   - Review newsletter growth
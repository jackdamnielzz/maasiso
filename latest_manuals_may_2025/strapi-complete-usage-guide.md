# Strapi CMS Complete Usage Guide
## MaasISO Platform - Praktische Implementatie & Gebruikershandleiding

**Document Version:** 1.0  
**Created:** 24 Mei 2025  
**Status:** Complete Usage Manual  
**Scope:** Praktische implementatie instructies voor alle Content Types

---

## 📖 Overzicht

Deze uitgebreide gebruikershandleiding biedt praktische instructies voor het optimaal gebruiken van het MaasISO Strapi CMS systeem. Gebaseerd op de complete architectuuranalyse, bevat deze gids stap-voor-stap workflows, best practices, en implementatie strategieën voor alle 17 Content Types.

### 🎯 Handleiding Doelstellingen

1. **Praktische Workflows** - Stap-voor-stap instructies voor content creators
2. **Best Practices** - Optimale gebruik van alle Content Types
3. **Frontend Integratie** - Implementatie strategieën voor developers
4. **Troubleshooting** - Oplossingen voor veelvoorkomende problemen
5. **Advanced Features** - Geavanceerde functionaliteiten en optimalisaties

---

## 🚀 Getting Started

### Strapi Development Mode Activeren

**Vereisten:** Je moet in development mode zijn om Content Types te kunnen wijzigen.

**Via Hostinger Browserterminal:**
1. Log in bij Hostinger Control Panel
2. Ga naar VPS Management → strapicms.maasiso.cloud  
3. Open "Browserterminal"
4. Stop productie mode: `pm2 stop strapi`
5. Start development mode: `NODE_ENV=development npm run develop`
6. Open admin interface: `http://153.92.223.23:1337/admin`

**Login Credentials:**
- Email: `niels_maas@hotmail.com`
- Password: `[REDACTED_PASSWORD]`

### Development Mode Workflow

```bash
# Stop production
pm2 stop strapi

# Start development  
NODE_ENV=development npm run develop

# Admin toegang
# http://153.92.223.23:1337/admin

# Terug naar production (na wijzigingen)
pm2 start ecosystem.config.js
```

---

## 📋 Content Types Gebruiksgids

### 📰 Content Publishing System

## 1. Blog Post - Hoofdcontent Engine

### 📝 **Content Creation Workflow**

**Stap 1: Basis Informatie**
```
Content Manager → Collection Types → Blog Post → Create new entry

Required Fields:
✅ title: "ISO 27001 Implementatie Guide"
✅ Content: [Markdown editor] - Hoofdartikel inhoud
✅ slug: [Auto-generated from title] - "iso-27001-implementatie-guide"
```

**Stap 2: SEO Optimalisatie**
```
SEO Fields:
📄 seoTitle: "Complete ISO 27001 Implementatie Guide | MaasISO"
📄 seoDescription: "Leer hoe je ISO 27001 succesvol implementeert met onze stap-voor-stap guide. Expert tips en best practices."
📄 seoKeywords: "ISO 27001, implementatie, informatiebeveiliging, compliance"
🖼️ featuredImageAltText: "ISO 27001 certificaat met implementatie checklist"
```

**Stap 3: Categorisatie & Tagging**
```
Content Organization:
🏷️ categories: Selecteer uit bestaande categorieën (bijv. "ISO Standards", "Compliance")
🏷️ tags: Selecteer relevante tags (bijv. "ISO-27001", "Security", "Implementation")
```

**Stap 4: Media & Publicatie**
```
Media & Publishing:
🖼️ featuredImage: Upload hoofdafbeelding (16:9 ratio aanbevolen)
📅 publicationDate: Stel in voor scheduling (optioneel)
👤 Author: "Niels Maas" (tekst veld)
```

**Stap 5: Preview & Publish**
```
Quality Check:
✅ Preview content in markdown editor
✅ Check SEO fields completeness  
✅ Verify categories & tags
✅ Test featured image display
✅ Save as Draft → Publish
```

### 🎯 **Blog Post Best Practices**

**Content Strategy:**
- **Title optimalisatie:** 50-60 karakters voor optimale SEO
- **Slug formatting:** Gebruik hyphens, lowercase, geen special characters
- **Content structure:** Gebruik headers (H2, H3) voor betere leesbaarheid
- **Image optimization:** Featured images 1200x675px (16:9 ratio)
- **Alt text priority:** `featuredImageAltText` → `featuredImage.alternativeText` → `title`

**SEO Strategy:**
- **seoTitle:** 50-60 karakters, include primary keyword
- **seoDescription:** 150-160 karakters, compelling beschrijving
- **seoKeywords:** 3-5 relevante keywords, comma-separated
- **Internal linking:** Link naar gerelateerde blog posts en pages

**Frontend Integration:**
```typescript
// API Usage
const blogPost = await getBlogPostBySlug(slug);

// Component Usage  
<BlogPostContent post={blogPost} />
<BlogCard post={blogPost} />
<BlogPostCard post={blogPost} />

// Routing
/blog/[slug] → Dynamic blog post pages
```

---

## 2. News Article - Enhanced Publishing

### 📝 **Content Creation Workflow**

**Stap 1: Basis Content**
```
Content Manager → Collection Types → News Article → Create new entry

Core Information:
✅ title: "Nieuwe ISO 27001:2022 Updates Aangekondigd"
✅ content: [Markdown editor] - Nieuws artikel inhoud
✅ slug: [Auto-generated] - "nieuwe-iso-27001-2022-updates"
```

**Stap 2: Enhanced Features**
```
Advanced Features:
📖 readingTime: "5" (minutes) - Manual estimation
📚 isSeriesPart: true (voor multi-part artikelen)
📚 seriesTitle: "ISO 27001 Update Series" (if part of series)
📚 seriesOrder: "1" (order in series)
📝 articledescription: "Additional description for enhanced SEO"
```

**Stap 3: SEO & Categorisatie**
```
SEO & Organization:
📄 seoTitle: "ISO 27001:2022 Updates | Nieuwe Requirements"
📄 seoDescription: "Ontdek de belangrijkste updates in ISO 27001:2022..."
📄 seoKeywords: "ISO 27001, 2022 update, nieuwe requirements"
🏷️ categories: Share with Blog Post categories
🏷️ tags: Share with Blog Post tags
```

**Stap 4: Media & Publishing**
```
Visual & Scheduling:
🖼️ featuredImage: Upload nieuws afbeelding
📅 publicationDate: Scheduling voor coordinated release
```

### 🎯 **News Article Best Practices**

**Series Management:**
```
Multi-Part Article Strategy:
1. Plan complete series vooraf
2. Consistent seriesTitle across all parts
3. Logical seriesOrder numbering
4. Cross-reference tussen delen in content
```

**Reading Time Calculation:**
```
Reading Time Guidelines:
- Average reading speed: 200-250 words/minute
- Count total words in content
- Divide by reading speed
- Round to nearest minute
```

**Content Strategy:**
- **Timely updates:** News articles for immediate/time-sensitive content
- **Series coordination:** Use series functionality for complex topics
- **Enhanced SEO:** Utilize articledescription for additional context

---

## 3. Category - Shared Taxonomy System

### 📝 **Category Management Workflow**

**Stap 1: Category Creation**
```
Content Manager → Collection Types → Category → Create new entry

Basic Information:
✅ name: "ISO Standards"
✅ slug: [Auto-generated] - "iso-standards"  
📝 description: "Articles related to ISO standard implementation and compliance"
```

**Stap 2: Content Association**
```
Bidirectional Relations:
🔗 blog_posts: [Automatically populated when blog posts select this category]
🔗 news_articles: [Automatically populated when news articles select this category]
```

### 🎯 **Category Strategy**

**Category Planning:**
```
Recommended Category Structure:
📁 ISO Standards
  ├── ISO 9001 (Quality Management)
  ├── ISO 14001 (Environmental)
  ├── ISO 27001 (Information Security)
  └── ISO 45001 (Health & Safety)

📁 Compliance
  ├── Implementation Guides
  ├── Audit Preparation
  └── Certification Process

📁 Tools & Resources
  ├── Templates
  ├── Checklists
  └── Software
```

**Frontend Implementation:**
```typescript
// Category Pages
/category/[slug] → Mixed content streams (blog + news)

// Category Navigation
const categories = await getCategories();
categories.map(cat => (
  <Link href={`/category/${cat.slug}`}>
    {cat.name} ({cat.blog_posts.length + cat.news_articles.length})
  </Link>
));
```

---

## 4. Tag - Flexible Content Labeling

### 📝 **Tag Management Workflow**

**Stap 1: Tag Creation**
```
Content Manager → Collection Types → Tag → Create new entry

Tag Information:
✅ name: "Implementation"
✅ slug: [Auto-generated] - "implementation" 
📝 description: "Content related to implementing standards and processes"
```

**Stap 2: Content Association**
```
Cross-Content Tagging:
🏷️ blog_posts: [Auto-populated via blog post selection]
🏷️ news_articles: [Auto-populated via news article selection]
```

### 🎯 **Tagging Strategy**

**Tag Categories:**
```
Topic-Based Tags:
🏷️ Process Tags: "implementation", "audit", "certification", "training"
🏷️ Standard Tags: "iso-9001", "iso-27001", "iso-14001", "gdpr"
🏷️ Industry Tags: "healthcare", "manufacturing", "it-services", "finance"
🏷️ Level Tags: "beginner", "intermediate", "advanced", "expert"
```

**Tag Usage Guidelines:**
- **Specificity:** Gebruik specifieke tags voor betere content discovery
- **Consistency:** Maintain consistent tag naming conventions
- **Relevance:** 3-7 tags per artikel voor optimal organization
- **Evolution:** Regular review en cleanup van unused tags

---

## 5. Section Template - Dynamic Content Composer

### 📝 **Template Creation Workflow**

**Stap 1: Template Setup**
```
Content Manager → Collection Types → Section Template → Create new entry

Template Configuration:
✅ name: "Hero with Features Grid"
📝 description: "Hero section followed by feature showcase - ideal for service pages"
📋 category: Select from predefined enum (e.g., "Landing Page", "Content Section")
✅ isReusable: true (enable template sharing)
```

**Stap 2: Dynamic Zone Composition**
```
Content Dynamic Zone:
🎨 Add components in sequence:

1. Hero Component:
   - Headline: "ISO Compliance Made Simple"
   - Subtext: "Expert guidance for certification success"
   - Background image: Upload hero background
   - CTA button: "Get Started"

2. Text Block Component:
   - Rich text content with markdown
   - Service introduction and benefits

3. feature-grid Component:
   - Add multiple feature items
   - Icons, titles, descriptions per feature

4. Button Component:
   - Final call-to-action
   - Link to contact or services page
```

### 🎯 **Template Design Strategy**

**Component Sequencing:**
```
Effective Template Patterns:
📐 Hero → Text Block → feature-grid → Button
📐 Text Block → image-gallery → Text Block
📐 Hero → feature-grid → image-gallery → Button
```

**Reusability Guidelines:**
- **Modular design:** Create templates for specific use cases
- **Documentation:** Clear descriptions voor template purpose
- **Categorization:** Use enum categories voor organized discovery
- **Testing:** Preview templates before marking as reusable

**Frontend Integration:**
```typescript
// Template Rendering
const template = await getSectionTemplate(templateId);

// Dynamic Zone Rendering
<DynamicZoneRenderer components={template.content} />

// Component Registry
const ComponentRegistry = {
  'text-block': TextBlockComponent,
  'hero': HeroComponent,
  'feature-grid': FeatureGridComponent,
  'button': ButtonComponent,
  'image-gallery': ImageGalleryComponent
};
```

---

## 6. Page - Advanced Page Builder

### 📝 **Page Creation Workflow**

**Stap 1: Page Setup**
```
Content Manager → Collection Types → Page → Create new entry

Page Configuration:
✅ Title: "Over Ons - MaasISO Expertise" (note: hoofdletter T!)
✅ slug: [Auto-generated] - "over-ons"
📄 seoTitle: "Over MaasISO | ISO Compliance Experts"
📄 seoDescription: "Leer meer over MaasISO's expertise in ISO standaarden..."
📄 seoKeywords: "MaasISO, ISO experts, compliance consultancy"
🖼️ featuredImage: Upload page featured image
📅 publicationDate: Set for scheduled publishing
```

**Stap 2: Dynamic Layout Building**
```
Layout Dynamic Zone (7 available components):

1. Hero Component:
   - Company introduction hero
   - Professional background image
   - Value proposition text

2. Text Block Component:
   - Company history and mission
   - Rich markdown content with formatting

3. feature Component (specialized):
   - Individual team member features
   - Photo, name, expertise areas

4. feature-grid Component:
   - Service areas showcase
   - Multiple features in grid layout

5. image-gallery Component:
   - Office photos, team photos
   - Client project showcases

6. cta-button Component (specialized):
   - "Contact Our Experts" button
   - Prominent styling and positioning

7. Button Component:
   - Secondary actions
   - "Download Company Brochure"
```

### 🎯 **Page Builder Strategy**

**Layout Planning:**
```
Page Type Templates:
📄 About Page: Hero → Text Block → feature-grid → image-gallery → cta-button
📄 Service Page: Hero → Text Block → feature-grid → feature → Button
📄 Landing Page: Hero → feature-grid → Text Block → cta-button
📄 Contact Page: Hero → Text Block → feature → Button
```

**Component Usage Guidelines:**
- **Hero placement:** Always start with Hero for consistent branding
- **Content flow:** Alternate between text and visual components
- **CTA strategy:** Use cta-button for primary actions, Button for secondary
- **feature vs feature-grid:** Individual feature for detailed items, grid for overview

---

## 7. Page Template - Template Definition System

### 📝 **Template Definition Workflow**

**Stap 1: Template Configuration**
```
Content Manager → Collection Types → Page Template → Create new entry

Template Setup:
✅ name: "Standard Service Page"
📝 description: "Default template for service pages with hero, content, and features"
📋 category: Select from enum (e.g., "Service", "Landing", "Content")
✅ isDefault: false (set true only for fallback template)
```

**Stap 2: Layout Definition**
```
Layout Dynamic Zone (5 core components):

Predefined Layout Structure:
1. Hero Component - Service introduction
2. Text Block - Service description
3. feature-grid - Service benefits
4. image-gallery - Service examples/results
5. Button - Contact/quote CTA
```

### 🎯 **Template Management Strategy**

**Template Hierarchy:**
```
Template Organization:
🎯 Default Template (isDefault: true)
  ├── Used when no specific template selected
  └── Basic Hero → Text Block → Button layout

📋 Category-Based Templates:
  ├── Service Templates
  ├── Landing Page Templates  
  ├── Content Page Templates
  └── Contact Page Templates
```

**Usage in Pages:**
- Pages kunnen Page Templates als starting point gebruiken
- Layout copying for consistent design
- Template inheritance via composition
- Override capability for customization

---

## 8. Global Content Block - Centralized Content Management

### 📝 **Global Block Creation Workflow**

**Stap 1: Block Configuration**
```
Content Manager → Collection Types → Global Content Block → Create new entry

Block Setup:
✅ naam: "Company CTA Section" (Nederlandse veldnaam!)
📝 description: "Reusable call-to-action section for service pages"
📝 version: "1.0"
📋 contentStatus: "published" (draft → published → archived)
📋 usageLocations: {"pages": ["about", "services"], "templates": ["service-template"]}
```

**Stap 2: Content Composition**
```
Content Dynamic Zone (7 available components):

Reusable Content Structure:
1. feature Component:
   - Key value proposition
   - Compelling benefit statement

2. Text Block Component:
   - Supporting information
   - Trust indicators

3. cta-button Component:
   - Primary action button
   - "Get Free Consultation"

4. Button Component:
   - Secondary action
   - "Download Service Brochure"
```

### 🎯 **Global Content Strategy**

**Content Block Types:**
```
Recommended Global Blocks:
🎯 CTA Sections: Reusable call-to-action areas
📞 Contact Blocks: Consistent contact information  
🏆 Trust Indicators: Testimonials, certifications
📄 Legal Blocks: Privacy notices, terms
🔄 Navigation Elements: Footer content, breadcrumbs
```

**Version Control Workflow:**
```
Content Change Management:
1. Create new version (increment version number)
2. Update content in content Dynamic Zone
3. Test in staging environment
4. Update usageLocations JSON if needed
5. Change contentStatus from "draft" to "published"
6. Archive old version (set status to "archived")
```

**Usage Tracking:**
```json
usageLocations JSON Structure:
{
  "pages": ["about-us", "services", "contact"],
  "templates": ["service-template", "landing-template"],
  "components": ["header", "footer"],
  "lastUpdated": "2025-05-24",
  "updateBy": "admin"
}
```

---

## 9. Template Inheritance - Advanced Template System

### 📝 **Inheritance Setup Workflow**

**Stap 1: Inheritance Configuration**
```
Content Manager → Collection Types → Template Inheritance → Create new entry

Inheritance Setup:
✅ name: "Service Page with Custom Header" (Rich Text - Markdown!)
📝 description: "Extends standard service template with enhanced header section"
🔗 parentTemplate: Select "Standard Service Page" Page Template
🔗 childTemplate: Select target Page Template for inheritance
✅ isActive: true (activate inheritance)
```

**Stap 2: Override Configuration**
```
Overrides JSON Configuration:
{
  "hero": {
    "backgroundColor": "#007bff",
    "textColor": "white",
    "height": "600px"
  },
  "textBlock": {
    "fontSize": "1.2rem",
    "lineHeight": "1.6"
  },
  "additionalComponents": [
    {
      "type": "feature-grid",
      "position": "after_hero",
      "config": {
        "columns": 4,
        "style": "cards"
      }
    }
  ]
}
```

### 🎯 **Template Inheritance Strategy**

**Inheritance Patterns:**
```
Template Hierarchy Examples:
🎯 Base Service Template
  ├── ISO Service Template (overrides: compliance-focused colors)
  └── Consultancy Template (overrides: expert-focused messaging)

📄 Base Landing Template
  ├── Product Landing (overrides: product-focused CTAs)
  └── Service Landing (overrides: service-focused features)
```

**Override Best Practices:**
- **Selective overrides:** Only override specific properties, inherit the rest
- **Consistent structure:** Maintain component order for predictable layouts
- **Documentation:** Clear naming and description voor inheritance purpose
- **Testing:** Preview inherited templates before activation

---

### 👥 User Management & Business Content

## 10. Newsletter Subscriber - Email Marketing Integration

### 📝 **Subscriber Management Workflow**

**Stap 1: Subscriber Entry**
```
Content Manager → Collection Types → Newsletter Subscriber → Create new entry

Subscriber Information:
✅ name: "John Doe"
✅ email: "john.doe@company.com" (validated email field)
📝 company: "ABC Manufacturing"
📝 source: "Website signup form" (track subscription source)
📅 subscriptionDate: [Auto-filled] - timestamp of subscription
✅ active: true (subscription status)
```

**Stap 2: Lifecycle Management**
```
Subscription Lifecycle:
📊 Active Management:
  - Monitor subscription status
  - Track engagement metrics
  - Segment by company/industry

❌ Unsubscribe Process:
  - Set active: false
  - Fill unsubscribeReason: "Too frequent emails"
  - Maintain record for compliance
```

### 🎯 **Email Marketing Strategy**

**Segmentation Strategy:**
```
Subscriber Segmentation:
🏢 B2B Segmentation:
  - Group by company type
  - Industry-specific content
  - Company size considerations

📍 Source Tracking:
  - Website form signups
  - Whitepaper downloads  
  - Event registrations
  - Partner referrals
```

**GDPR Compliance:**
```
Data Protection Workflow:
✅ Explicit consent tracking (subscriptionDate)
✅ Easy unsubscribe (active boolean)
✅ Unsubscribe reason collection
✅ Data minimization (essential fields only)
✅ Record retention for compliance
```

---

## 11. Service - Business Services Catalog

### 📝 **Service Creation Workflow**

**Stap 1: Service Setup**
```
Content Manager → Collection Types → Service → Create new entry

Core Service Information:
✅ name: "ISO 27001 Implementation"
📝 description: [Rich Text - Markdown] - Detailed service description
✅ slug: [Auto-generated] - "iso-27001-implementation"
📝 isoStandards: "ISO/IEC 27001:2013, ISO/IEC 27002:2022" (ISO compliance tracking)
🖼️ featuredImage: Upload service representation image
📝 pricing: "Starting from €2,500" (transparent pricing information)
📅 publicationDate: Schedule service launch
```

**Stap 2: SEO Optimization**
```
Service SEO:
📄 seoTitle: "ISO 27001 Implementation Services | Expert Consultancy"
📄 seoDescription: "Professional ISO 27001 implementation with certified experts..."
📄 seoKeywords: "ISO 27001, implementation, consultancy, certification"
```

### 🎯 **Service Catalog Strategy**

**Service Organization:**
```
Service Categories:
🔒 Information Security:
  - ISO 27001 Implementation
  - ISO 27001 Audit Preparation
  - GDPR Compliance

🌍 Environmental Management:
  - ISO 14001 Implementation
  - Environmental Audit
  - Sustainability Consulting

⚕️ Health & Safety:
  - ISO 45001 Implementation
  - Safety Management Systems
  - Risk Assessment
```

**Pricing Strategy:**
```
Pricing Information Guidelines:
💰 Transparent Pricing:
  - "Starting from €X" for base services
  - "Contact for quote" for complex projects
  - Package pricing for bundled services

📊 Value Communication:
  - ROI benefits in description
  - Certification success rates
  - Timeline expectations
```

**Frontend Implementation:**
```typescript
// Service Catalog Page
/services → Overview of all services
/services/[slug] → Individual service details

// Service Features:
- ISO standards filtering
- Pricing display
- Contact integration
- Related services suggestions
```

---

## 12. Tool - Software Tools Documentation

### 📝 **Tool Documentation Workflow**

**Stap 1: Tool Setup**
```
Content Manager → Collection Types → Tool → Create new entry

Tool Information:
✅ name: "ISO 27001 Risk Assessment Tool"
✅ slug: [Auto-generated] - "iso-27001-risk-assessment-tool"
📝 description: [Rich Text - Markdown] - Tool overview and benefits
📝 version: "2.1.3" (current version tracking)
📝 compatibility: "Windows 10+, macOS 10.15+, Web browsers"
📝 documentation: [Rich Text - Markdown] - Complete technical documentation
```

**Stap 2: Distribution & Documentation**
```
Tool Distribution:
📁 downloadLink: Upload tool file (installer, ZIP, etc.)
📸 screenshots: Upload multiple screenshots showing tool interface
```

**Stap 3: SEO & Discovery**
```
Tool SEO:
📄 seoTitle: "Free ISO 27001 Risk Assessment Tool | Download"
📄 seoDescription: "Download our free ISO 27001 risk assessment tool..."
📄 seoKeywords: "ISO 27001, risk assessment, tool, free download"
```

### 🎯 **Tool Management Strategy**

**Tool Categories:**
```
Tool Organization:
🔧 Assessment Tools:
  - Risk Assessment Tools
  - Gap Analysis Tools
  - Maturity Assessment Tools

📋 Documentation Tools:
  - Policy Templates
  - Procedure Generators
  - Audit Checklists

📊 Monitoring Tools:
  - Compliance Trackers
  - Metric Dashboards
  - Progress Monitors
```

**Version Control:**
```
Tool Lifecycle Management:
🔄 Version Tracking:
  - Semantic versioning (2.1.3)
  - Release notes in documentation
  - Backward compatibility notes

📱 Compatibility Management:
  - System requirements
  - Browser compatibility
  - Mobile device support

📁 Distribution Strategy:
  - Direct downloads via downloadLink
  - Version-specific file naming
  - Download analytics tracking
```

---

## 13. Testimonial - Customer Feedback System

### 📝 **Testimonial Creation Workflow**

**Stap 1: Client Information**
```
Content Manager → Collection Types → Testimonial → Create new entry

Client Details:
✅ clientName: "Sarah Johnson"
📝 company: "TechSecure Solutions"
📸 clientPhoto: Upload professional client photo
🏢 companyLogo: Upload company logo
```

**Stap 2: Testimonial Content**
```
Testimonial Content:
📝 quote: [Rich Text - Markdown] - Client testimonial with formatting
🌟 rating: 5 (numerical rating out of 5)
✅ featured: true (highlight exceptional testimonials)
📅 publicationDate: Schedule testimonial publication
```

### 🎯 **Testimonial Strategy**

**Content Guidelines:**
```
Effective Testimonials:
💬 Quote Structure:
  - Specific results achieved
  - Problems solved
  - Value delivered
  - Recommendation statement

🌟 Rating System:
  - 5-star rating scale
  - Consistent rating criteria
  - Honest feedback representation
```

**Social Proof Strategy:**
```
Testimonial Usage:
🏆 Featured Testimonials:
  - Homepage hero sections
  - Service page social proof
  - Case study highlights

📊 Rating Display:
  - Average rating calculations
  - Star rating visualizations
  - Quantitative trust indicators

🖼️ Visual Elements:
  - Client photos for authenticity
  - Company logos for credibility
  - Professional presentation
```

**Frontend Implementation:**
```typescript
// Testimonial Display
<TestimonialCarousel testimonials={featuredTestimonials} />
<TestimonialGrid testimonials={allTestimonials} />
<RatingDisplay average={averageRating} total={totalReviews} />

// Featured Testimonials
const featured = testimonials.filter(t => t.featured === true);
```

---

## 14. User - Authentication & Authorization

### 📝 **User Management Workflow**

**Stap 1: User Creation**
```
Content Manager → Collection Types → User → Create new entry

User Account:
📝 username: "niels.maas" (unique identifier)
✅ email: "niels@maasiso.nl" (required, validated)
📝 provider: "local" (authentication method)
🔒 password: [Set secure password]
✅ confirmed: true (email verification status)
❌ blocked: false (account active status)
🔑 role: Select appropriate role (admin, editor, author)
```

**Stap 2: Security Configuration**
```
Security Settings:
🔄 resetPasswordToken: [Auto-generated when needed]
📧 confirmationToken: [Auto-generated for email verification]
```

### 🎯 **User Management Strategy**

**Role-Based Access:**
```
User Role Hierarchy:
👑 Super Admin:
  - Full system access
  - User management
  - Content Type modifications

🛠️ Admin:
  - Content management
  - User management (limited)
  - Publishing permissions

✏️ Editor:
  - Content creation/editing
  - Draft/publish workflow
  - Media management

📝 Author:
  - Content creation only
  - Draft submissions
  - Own content editing
```

**Security Best Practices:**
```
Account Security:
🔒 Password Requirements:
  - Minimum 12 characters
  - Mixed case, numbers, symbols
  - Regular password updates

📧 Email Verification:
  - Required for account activation
  - confirmed: true for active accounts
  - Re-verification for email changes

🚫 Account Management:
  - blocked: true for suspended accounts
  - provider tracking for audit
  - Role-based permissions enforcement
```

---

## 15. Whitepaper - Lead Generation Content

### 📝 **Whitepaper Creation Workflow**

**Stap 1: Document Setup**
```
Content Manager → Collection Types → Whitepaper → Create new entry

Document Information:
✅ title: "Complete ISO 27001 Implementation Guide"
✅ slug: [Auto-generated] - "complete-iso-27001-implementation-guide"
📝 description: [Rich Text - Markdown] - Whitepaper overview and value proposition
📝 version: "2.1" (document version tracking)
📝 author: "Niels Maas, CISA, CISSP"
📁 downloadLink: Upload PDF/document file
📅 publicationDate: Schedule whitepaper release
```

**Stap 2: SEO & Marketing**
```
Whitepaper SEO:
📄 seoTitle: "Free ISO 27001 Implementation Guide | Complete PDF Download"
📄 seoDescription: "Download our comprehensive ISO 27001 implementation guide..."
📄 seoKeywords: "ISO 27001, implementation guide, free download, PDF"
```

### 🎯 **Lead Generation Strategy**

**Content Strategy:**
```
Whitepaper Types:
📚 Implementation Guides:
  - Step-by-step ISO implementation
  - Best practices documentation
  - Common pitfalls and solutions

📊 Research Reports:
  - Industry compliance statistics
  - Benchmark studies
  - Market analysis

🎯 Assessment Tools:
  - Self-assessment questionnaires
  - Readiness checklists
  - Gap analysis templates
```

**Lead Capture Integration:**
```
Download Workflow:
1. User discovers whitepaper (SEO, social, referrals)
2. Landing page with value proposition
3. Lead capture form (email, name, company)
4. Form submission creates Whitepaper Lead entry
5. Automated email with download link
6. Lead qualification and nurturing workflow
```

---

## 16. Whitepaper Lead - Lead Tracking & Management

### 📝 **Lead Management Workflow**

**Stap 1: Lead Capture**
```
Content Manager → Collection Types → Whitepaper Lead → Create new entry

Lead Information:
✅ email: "prospect@company.com" (required, validated)
📝 name: "John Smith"
📝 Company: "ABC Corporation" (note: hoofdletter C!)
✅ subscribeNewsletter: true (marketing opt-in)
📝 whitepaperTitle: "Complete ISO 27001 Implementation Guide"
📅 downloadDate: [Auto-filled] - timestamp of download
📋 leadStatus: "new" (lead qualification status)
```

**Stap 2: Lead Qualification**
```
Lead Qualification Process:
📋 leadStatus Options:
  - "new" → Initial lead capture
  - "qualified" → Meets ideal customer profile
  - "contacted" → Sales outreach initiated
  - "opportunity" → Active sales conversation
  - "customer" → Conversion achieved
  - "unqualified" → Not a fit

📝 notes: [Rich Text - Blocks] - CRM integration notes
```

### 🎯 **Lead Management Strategy**

**Lead Scoring:**
```
Qualification Criteria:
🎯 Company Size:
  - Enterprise (500+ employees) - High score
  - Mid-market (50-500 employees) - Medium score
  - Small business (<50 employees) - Low score

🏢 Industry Relevance:
  - High-compliance industries (finance, healthcare) - High score
  - Technology companies - Medium score
  - Other industries - Low score

📚 Content Engagement:
  - Multiple whitepaper downloads - High score
  - Newsletter subscription - Medium score
  - Single download - Low score
```

**Nurturing Workflow:**
```
Lead Nurturing Sequence:
📧 Immediate Follow-up:
  - Download confirmation email
  - Additional resource recommendations
  - Newsletter subscription confirmation

📅 Week 1:
  - Implementation tips email
  - Case study sharing
  - Webinar invitation

📅 Week 2:
  - Personal outreach (if qualified)
  - Consultation offer
  - Success story sharing

📅 Monthly:
  - Newsletter with latest content
  - New whitepaper announcements
  - Industry updates
```

---

## 🔗 Content Relationship Management

### Cross-Content Workflows

**Blog Post + Category + Tag Integration:**
```
Content Publishing Workflow:
1. Create/verify Categories exist
2. Create/verify relevant Tags exist
3. Create Blog Post with category/tag selection
4. Automatic bidirectional relation updates
5. Category/Tag pages automatically include new content
```

**Whitepaper Lead Generation Flow:**
```
Lead Generation Workflow:
1. Create Whitepaper with compelling content
2. User downloads whitepaper (lead capture)
3. Whitepaper Lead entry created automatically
4. Newsletter subscription option integration
5. Lead qualification and nurturing process
```

**Template System Integration:**
```
Template Workflow:
1. Create Page Templates for consistent design
2. Create Section Templates for reusable components
3. Use Template Inheritance for customization
4. Apply Global Content Blocks for consistency
5. Build Pages using template foundations
```

---

## 🚀 Frontend Integration Guide

### API Implementation Strategy

**Content Type API Endpoints:**
```typescript
// Primary Content APIs
/api/blog-posts → Blog content management
/api/news-articles → News content
/api/categories → Category management
/api/tags → Tag management

// Page Builder APIs
/api/pages → Dynamic page content
/api/section-templates → Reusable templates
/api/page-templates → Template definitions
/api/global-content-blocks → Shared content

// Business Content APIs
/api/services → Service catalog
/api/tools → Tool directory
/api/testimonials → Customer feedback
/api/whitepapers → Lead generation content

// User Management APIs
/api/newsletter-subscriptions → Email marketing
/api/whitepaper-leads → Lead tracking
```

### Component Development Priority

**Phase 1: Core Components**
```typescript
// Essential Components (High Priority)
1. TextBlockComponent → Rich text rendering
2. HeroComponent → Hero sections
3. ButtonComponent → Standard CTAs
4. ImageGalleryComponent → Image displays

// Implementation Example:
const TextBlockComponent = ({ content }) => (
  <div className="prose prose-lg max-w-none">
    <ReactMarkdown>{content}</ReactMarkdown>
  </div>
);
```

**Phase 2: Advanced Components**
```typescript
// Advanced Components (Medium Priority)
5. FeatureGridComponent → Feature showcases
6. FeatureComponent → Individual features
7. CtaButtonComponent → Specialized CTAs

// Dynamic Zone Renderer
const DynamicZoneRenderer = ({ components }) => {
  return components.map((component, index) => {
    const Component = ComponentRegistry[component.__component];
    return Component ? (
      <Component key={component.id || index} {...component} />
    ) : (
      <div key={index}>Unknown component: {component.__component}</div>
    );
  });
};
```

**Phase 3: System Integration**
```typescript
// System Components (Integration Priority)
8. TemplateInheritanceProcessor → Template inheritance
9. GlobalContentBlockRenderer → Shared content
10. LeadCaptureForm → Whitepaper lead generation

// Component Registry
export const ComponentRegistry = {
  'text-block': TextBlockComponent,
  'hero': HeroComponent,
  'button': ButtonComponent,
  'image-gallery': ImageGalleryComponent,
  'feature-grid': FeatureGridComponent,
  'feature': FeatureComponent,
  'cta-button': CtaButtonComponent
};
```

---

## 📊 SEO Implementation Guide

### SEO Field Consistency

**Content Types with Full SEO:**
```
SEO Implementation Priority:
✅ Blog Post (seoTitle, seoDescription, seoKeywords, featuredImageAltText)
✅ News Article (seoTitle, seoDescription, seoKeywords)
✅ Page (seoTitle, seoDescription, seoKeywords, featuredImage)
✅ Service (seoTitle, seoDescription, seoKeywords)
✅ Tool (seoTitle, seoDescription, seoKeywords)
✅ Whitepaper (seoTitle, seoDescription, seoKeywords)
```

**SEO Implementation Strategy:**
```typescript
// SEO Component
const SEOHead = ({ content }) => (
  <Head>
    <title>{content.seoTitle || content.title}</title>
    <meta name="description" content={content.seoDescription} />
    <meta name="keywords" content={content.seoKeywords} />
    
    {/* Open Graph */}
    <meta property="og:title" content={content.seoTitle || content.title} />
    <meta property="og:description" content={content.seoDescription} />
    {content.featuredImage && (
      <meta property="og:image" content={content.featuredImage.url} />
    )}
    
    {/* Schema.org */}
    <script type="application/ld+json">
      {JSON.stringify(generateSchemaOrg(content))}
    </script>
  </Head>
);
```

### URL Structure & Routing

**Recommended URL Patterns:**
```
Content URLs:
/blog/[slug] → Blog posts
/news/[slug] → News articles
/category/[slug] → Category pages
/tag/[slug] → Tag pages
/services/[slug] → Individual services
/tools/[slug] → Tool downloads
/whitepapers/[slug] → Whitepaper landing pages
/pages/[slug] → Custom pages
```

---

## 🛠️ Troubleshooting Guide

### Common Issues & Solutions

**Development Mode Issues:**
```
Problem: Cannot modify Content Types
Solution: Ensure development mode is active
Commands:
  pm2 stop strapi
  NODE_ENV=development npm run develop
```

**Relation Issues:**
```
Problem: Relations not showing in frontend
Solution: Check API populate parameters
Example:
  const post = await strapi.findOne('blog-post', id, {
    populate: ['categories', 'tags', 'featuredImage']
  });
```

**Media Serving Issues:**
```
Problem: Images not loading
Solution: Check proxy API configuration
Path: /api/proxy/assets/uploads/[filename]
Ensure: Proper media permissions in Strapi
```

**SEO Issues:**
```
Problem: Meta tags not appearing
Solution: Verify SEO field population
Check: seoTitle, seoDescription, seoKeywords filled
Ensure: Proper meta tag rendering in components
```

### Performance Optimization

**Query Optimization:**
```typescript
// Efficient querying with specific fields
const optimizedQuery = {
  fields: ['title', 'slug', 'seoTitle'],
  populate: {
    categories: { fields: ['name', 'slug'] },
    tags: { fields: ['name', 'slug'] },
    featuredImage: { fields: ['url', 'alternativeText'] }
  }
};
```

**Caching Strategy:**
```typescript
// Next.js caching for Strapi content
export async function getStaticProps({ params }) {
  const post = await getBlogPostBySlug(params.slug);
  
  return {
    props: { post },
    revalidate: 3600 // 1 hour cache
  };
}
```

---

## 📈 Analytics & Monitoring

### Content Performance Tracking

**Key Metrics to Monitor:**
```
Content Analytics:
📊 Blog Posts:
  - Page views per post
  - Reading time vs actual time on page
  - Social shares and engagement
  - Comment interactions

📊 Whitepapers:
  - Download conversion rates
  - Lead quality scoring
  - Whitepaper lead progression
  - Newsletter subscription rates

📊 Services:
  - Service page engagement
  - Contact form conversions
  - Pricing inquiry rates
  - Service comparison interactions
```

**Implementation Example:**
```typescript
// Analytics tracking
const trackContentView = (contentType, slug) => {
  gtag('event', 'content_view', {
    content_type: contentType,
    content_id: slug,
    engagement_time_msec: Date.now()
  });
};

// Lead generation tracking
const trackWhitepaperDownload = (whitepaperTitle, leadEmail) => {
  gtag('event', 'lead_generation', {
    event_category: 'whitepaper',
    event_label: whitepaperTitle,
    value: 1
  });
};
```

---

## 🎯 Best Practices Summary

### Content Creation Guidelines

**Universal Best Practices:**
```
Content Quality:
✅ SEO fields always completed (title, description, keywords)
✅ Featured images optimized (1200x675px recommended)
✅ Alt text provided for accessibility
✅ Categories and tags used consistently
✅ Publication dates set for scheduling
✅ Content reviewed before publishing

Component Design:
✅ Dynamic Zones planned before creation
✅ Component reusability considered
✅ Template inheritance utilized
✅ Global Content Blocks for shared elements
✅ Version control for important changes
```

### Technical Implementation

**Frontend Development:**
```
Implementation Priority:
1. Component Registry setup
2. Dynamic Zone rendering system
3. SEO meta tag implementation
4. API endpoint optimization
5. Performance monitoring
6. Analytics integration
```

**Content Management:**
```
Workflow Optimization:
1. Template-first approach for consistency
2. Global Content Blocks for reusable elements
3. Category/Tag strategy planning
4. Lead generation workflow automation
5. Regular content audits and optimization
```

---

## 📚 Quick Reference

### Essential URLs & Commands

**Development Access:**
```
Strapi Admin: http://153.92.223.23:1337/admin
Login: niels_maas@hotmail.com / [REDACTED_PASSWORD]

Development Mode:
pm2 stop strapi
NODE_ENV=development npm run develop

Production Mode:
pm2 start ecosystem.config.js
```

**API Endpoints:**
```
Blog Posts: /api/blog-posts
News Articles: /api/news-articles
Categories: /api/categories
Tags: /api/tags
Pages: /api/pages
Services: /api/services
Tools: /api/tools
Testimonials: /api/testimonials
Whitepapers: /api/whitepapers
```

### Component Quick Reference

**Available Components:**
```
Core Components (5):
- Text Block (rich text content)
- Hero (banner sections)
- Button (standard CTAs)
- image-gallery (image displays)
- feature-grid (feature showcases)

Specialized Components (2):
- feature (individual features)
- cta-button (specialized CTAs)
```

---

## 🎉 Conclusion

Deze uitgebreide gebruikershandleiding biedt alle benodigde informatie voor optimaal gebruik van het MaasISO Strapi CMS systeem. Van basis content creation tot geavanceerde template inheritance en lead generation workflows - alle aspecten zijn gedocumenteerd met praktische voorbeelden en best practices.

**Volgende Stappen:**
1. **Implementeer Component Registry** voor dynamic zone rendering
2. **Setup API endpoints** voor alle Content Types
3. **Ontwikkel frontend components** volgens priority planning
4. **Integreer analytics** voor performance monitoring
5. **Train content creators** op workflows en best practices

---

**Document Status:** Complete gebruikershandleiding - Ready for implementation  
**Last Updated:** 24 Mei 2025  
**Companion Document:** strapi-complete-architecture-analysis.md 
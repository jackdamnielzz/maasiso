# STRAPI CMS AUDIT REPORT
## Blog Post Content Type Analysis

**Date**: 2026-01-26
**Auditor**: Claude AI Assistant
**Project**: MaasISO SEO/GEO Enhancement
**Environment**: https://peaceful-insight-production.up.railway.app

---

## Executive Summary

A comprehensive audit was performed on the Strapi CMS Blog Post content type to assess compliance with SEO/GEO requirements as specified in the implementation plan. The audit reveals that approximately **48% of required fields are implemented**, with 13 critical fields missing or requiring modification.

### Key Findings

- ✅ **Implemented**: 13 fields (48%)
- ❌ **Missing**: 14 fields (52%)
- ⚠️ **Requires Modification**: 1 field (Author - must change from text to relation)
- 🔨 **Components to Create**: 2 (tldrItem, faqItem)
- 📦 **Collection to Create**: 1 (Authors)

---

## Section 1: Currently Implemented Fields

The following fields are **correctly implemented** in the Blog Post content type:

| Field Name | Type | Status | Notes |
|------------|------|--------|-------|
| `title` | Short text | ✅ Implemented | - |
| `slug` | UID | ✅ Implemented | Auto-generated from title |
| `Content` | Rich text | ⚠️ Partially correct | Should be lowercase `content` |
| `seoTitle` | Short text | ✅ Implemented | - |
| `seoDescription` | Long text | ✅ Implemented | - |
| `seoKeywords` | Short text | ✅ Implemented | - |
| `publicationDate` | Datetime | ✅ Implemented | - |
| `featuredImage` | Media | ✅ Implemented | Cloudinary integration |
| `featuredImageAltText` | Short text | ✅ Implemented | Currently null in data |
| `categories` | Relation | ✅ Implemented | Relation to Categories |
| `tags` | Relation | ✅ Implemented | Relation to Tags |
| `createdAt` | Datetime | ✅ Implemented | Auto-generated |
| `updatedAt` | Datetime | ✅ Implemented | Auto-generated |

---

## Section 2: Fields Requiring Modification

| Field Name | Current Type | Required Type | Action Required |
|------------|--------------|---------------|-----------------|
| `Author` | Plain text | Relation → Authors | 1. Create Authors collection<br>2. Migrate existing author data<br>3. Change field type<br>4. Update all posts |
| `Content` | Rich text (uppercase) | Rich text (lowercase) | Rename field to `content` |

---

## Section 3: Missing Critical Fields (Implement Immediately)

These fields are **essential** for SEO/GEO optimization and must be added:

| Field Name | Type | Required | Max Length | Validation | Purpose |
|------------|------|----------|------------|------------|---------|
| `excerpt` | Long text | Yes | 160 | Enforce max length | Short summary for listings, meta description fallback, AI snippeting |
| `tldr` | Component (repeatable) | Yes | - | Min 3, Max 7 items | Key takeaways block for AI citation optimization |
| `faq` | Component (repeatable) | No | - | - | FAQ section for PAA and FAQPage schema |

**Impact**: Without these fields, AI-powered search engines (ChatGPT, Perplexity, Google SGE) cannot properly extract and display content summaries.

---

## Section 4: Missing High Priority Fields (Implement Within 2 Weeks)

| Field Name | Type | Required | Options/Notes | Purpose |
|------------|------|----------|---------------|---------|
| `relatedPosts` | Relation → Blog Posts | No | Multiple, max 5 | Manual internal linking for topical authority |
| `schemaType` | Enumeration | Yes | `Article`, `HowTo`, `FAQPage` (default: Article) | Determines which JSON-LD schema to generate |
| `primaryKeyword` | Short text | No | - | Target keyword for SEMrush tracking |

**Impact**: These fields enable advanced SEO strategies like internal linking clusters and dynamic schema selection.

---

## Section 5: Missing Optional Fields (Implement Within 1 Month)

| Field Name | Type | Required | Options/Notes | Purpose |
|------------|------|----------|---------------|---------|
| `searchIntent` | Enumeration | No | `Informational`, `Commercial`, `Transactional` | Content template selection and analytics |
| `ctaVariant` | Enumeration | No | `contact`, `download`, `newsletter`, `none` | Dynamic CTA selection per post |
| `robotsIndex` | Boolean | No | Default: true | Control search engine indexing per post |
| `robotsFollow` | Boolean | No | Default: true | Control link following per post |
| `ogImage` | Media (single image) | No | - | Override Open Graph image if different from featured |
| `videoUrl` | Short text | No | URL format validation | YouTube/Vimeo URL for posts with video |
| `videoTitle` | Short text | No | - | Video title for VideoObject schema |
| `videoDuration` | Short text | No | ISO 8601 format (e.g., PT5M30S) | Video duration for schema |

---

## Section 6: Components to Create

### Component: `tldrItem`

Create a new component called `components.tldr-item`:

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `point` | Long text | Yes | Single takeaway point (one bullet) |

**Usage**: Repeatable component with min 3, max 7 items

---

### Component: `faqItem`

Create a new component called `components.faq-item`:

| Field Name | Type | Required | Max Length |
|------------|------|----------|------------|
| `question` | Short text | Yes | 200 |
| `answer` | Long text | Yes | 1000 |

**Usage**: Repeatable component

---

## Section 7: Collections to Create

### Collection: `Authors`

Create a new collection type called `authors` with the following fields:

| Field Name | Type | Required | Max Length | Purpose |
|------------|------|----------|------------|---------|
| `name` | Short text | Yes | 100 | Display name |
| `slug` | UID | Yes | - | Auto-generate from name, for author page URL |
| `bio` | Long text | Yes | 500 | 2-3 sentence biography |
| `credentials` | Short text | No | 150 | Professional title, e.g., "Lead Auditor ISO 27001" |
| `expertise` | JSON or Repeatable text | No | - | List of expertise areas, e.g., ["ISO 27001", "AVG", "BIO"] |
| `profileImage` | Media (single image) | No | - | Author headshot |
| `linkedIn` | Short text | No | - | LinkedIn profile URL for sameAs schema |
| `email` | Email | No | - | Contact email |

---

## Section 8: Implementation Priority Order

Based on SEO impact and dependencies, implement in this order:

### Phase 1: Critical Foundation (Week 1)
1. Create `Authors` collection
2. Create `tldrItem` component
3. Create `faqItem` component
4. Add `excerpt` field to Blog Post
5. Add `tldr` field to Blog Post
6. Add `faq` field to Blog Post

### Phase 2: Author Migration (Week 1-2)
7. Create author entries for existing authors
8. Migrate `Author` text field data to new Authors relations
9. Update all existing blog posts with author relations
10. Remove or rename old `Author` text field

### Phase 3: High Priority Fields (Week 2)
11. Add `relatedPosts` relation field
12. Add `schemaType` enumeration field
13. Add `primaryKeyword` text field

### Phase 4: Optional Enhancements (Week 3-4)
14. Add `searchIntent` enumeration
15. Add `ctaVariant` enumeration
16. Add `robotsIndex` boolean
17. Add `robotsFollow` boolean
18. Add `ogImage` media field
19. Add video-related fields (`videoUrl`, `videoTitle`, `videoDuration`)

---

## Section 9: Sample Blog Post Data (Current State)

```json
{
  "id": 352,
  "documentId": "ksqvt1we6aordnzrcjek75za",
  "title": "Risicogebaseerd denken: succesfactor voor kwaliteitsmanagement en ISO-certificering",
  "slug": "risicogebaseerd-denken-succesfactor-iso",
  "Content": "[Rich text content...]",
  "Author": "Niels Maas",
  "seoTitle": "Risicogebaseerd denken: onmisbaar voor ISO en kwaliteitsmanagement",
  "seoDescription": "Ontdek wat risicogebaseerd denken is...",
  "seoKeywords": "risicogebaseerd denken, ISO 9001...",
  "publicationDate": "2025-05-21T11:30:00.000Z",
  "featuredImageAltText": null,
  "createdAt": "2025-05-21T08:52:09.325Z",
  "updatedAt": "2025-12-12T09:59:25.972Z",
  "publishedAt": "2025-12-12T09:59:26.012Z",
  "categories": [...],
  "tags": [...],
  "featuredImage": {...}
}
```

**Observations**:
- `Author` is plain text (should be relation)
- `featuredImageAltText` is null (needs content)
- No `excerpt`, `tldr`, `faq`, or `relatedPosts`
- No schema type specification
- No robots directives

---

## Section 10: Strapi Admin Implementation Guide

### Step-by-Step Instructions for Strapi Admin

#### A. Create Authors Collection

1. Go to **Content-Type Builder** in Strapi Admin
2. Click **Create new collection type**
3. Name: `authors` (plural, lowercase)
4. Add fields as specified in Section 7
5. Configure relations and validations
6. Save content type

#### B. Create Components

1. Go to **Content-Type Builder** → **Components**
2. Click **Create new component**
3. Category: `blog` or `shared`
4. Create `tldrItem` component with fields from Section 6
5. Create `faqItem` component with fields from Section 6
6. Save components

#### C. Update Blog Post Content Type

1. Go to **Content-Type Builder** → **Blog Post**
2. Add new fields as specified in Sections 3, 4, and 5
3. For `tldr`: Select Component (repeatable), choose `tldrItem`, set min 3 max 7
4. For `faq`: Select Component (repeatable), choose `faqItem`
5. For `relatedPosts`: Select Relation, select Blog Posts, configure as "many to many" or "many to one"
6. For enumerations: Add options as specified
7. Save content type

#### D. Migrate Author Data

1. **Export current author names** from all blog posts
2. **Create unique author entries** in the new Authors collection
3. **Bulk update** blog posts to link to correct author
4. **Verify** all posts have author relations
5. **Remove or hide** old `Author` text field

---

## Section 11: API Response Structure (Expected After Implementation)

```json
{
  "data": {
    "id": 352,
    "attributes": {
      "title": "...",
      "slug": "...",
      "content": "...",
      "excerpt": "Concise summary within 160 characters",
      "author": {
        "data": {
          "id": 1,
          "attributes": {
            "name": "Niels Maas",
            "slug": "niels-maas",
            "bio": "...",
            "credentials": "Lead Auditor ISO 27001",
            "profileImage": {...}
          }
        }
      },
      "tldr": [
        { "point": "Key takeaway 1" },
        { "point": "Key takeaway 2" },
        { "point": "Key takeaway 3" }
      ],
      "faq": [
        {
          "question": "What is risk-based thinking?",
          "answer": "..."
        }
      ],
      "relatedPosts": {
        "data": [...]
      },
      "schemaType": "Article",
      "featuredImage": {...},
      "featuredImageAltText": "Descriptive alt text",
      "robotsIndex": true,
      "robotsFollow": true
    }
  }
}
```

---

## Section 12: Validation Checklist

After implementation, verify each item:

```
☐ Authors collection exists with all required fields
☐ tldrItem component is created
☐ faqItem component is created
☐ excerpt field exists on Blog Post
☐ tldr field exists (repeatable component, min 3 max 7)
☐ faq field exists (repeatable component)
☐ author field is a relation (not text)
☐ All existing blog posts have author relations
☐ relatedPosts field exists
☐ schemaType enumeration exists with correct options
☐ robotsIndex boolean exists (default true)
☐ robotsFollow boolean exists (default true)
☐ API response includes all new fields
☐ Test blog post can be created with all fields
☐ No Strapi errors in console
```

---

## Section 13: Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during Author migration | High | Create backup before migration, test on staging first |
| Breaking existing frontend code | Medium | Update TypeScript types first, implement graceful fallbacks |
| Performance impact of complex populate queries | Low | Use selective population, implement caching |
| Missing validation causing bad data | Medium | Implement validation rules in Strapi, add frontend validation |

---

## Section 14: Next Steps

1. **Review this audit** with stakeholders
2. **Create staging environment** backup
3. **Implement Phase 1** (Critical Foundation)
4. **Test thoroughly** with sample blog posts
5. **Proceed to Phase 2** (Author Migration)
6. **Update frontend code** to consume new fields
7. **Deploy to production** with monitoring

---

## Conclusion

The current Strapi Blog Post implementation provides a solid foundation but lacks critical fields for modern SEO/GEO optimization. The implementation plan outlined in this audit will bring the CMS to full compliance with current best practices for AI-powered search engines and traditional SEO.

**Estimated Implementation Time**:
- Strapi CMS changes: 4-6 hours
- Data migration: 2-3 hours
- Testing and verification: 2-3 hours

**Total**: 8-12 hours for complete CMS implementation

---

*Report generated by automated audit script on 2026-01-26*

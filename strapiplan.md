```markdown
# Developer Task: Complete SEO/GEO Audit and Implementation

## Overview

You are assigned to perform a comprehensive audit and implementation of SEO and GEO (Generative Engine Optimization) infrastructure for the blog system at maasiso.nl. This task covers both the Strapi CMS backend and the Next.js frontend.

**Objective:** Ensure every blog post achieves maximum visibility in:
- Traditional Google search (SEO)
- AI-powered search engines like Google AI Overviews, Perplexity, and ChatGPT (GEO)

---

## Technical Environment

| Component | Technology |
|-----------|------------|
| CMS | Strapi (headless) |
| Frontend | Next.js |
| Domain | maasiso.nl |
| Language | Dutch (nl_NL) |
| Content Focus | ISO certifications, information security, privacy (AVG), compliance |

---

## PART 1: STRAPI CMS AUDIT AND IMPLEMENTATION

### Task 1.1: Connect to Strapi CMS

1. Establish connection to the Strapi admin panel or API
2. Verify access to:
   - Content-Type Builder
   - Blog Post content type
   - Media Library
   - Existing collections (Authors, Categories, Tags)
3. Document connection method and access level

### Task 1.2: Audit Current Blog Post Fields

1. Extract the complete field list from the Blog Post content type
2. For each field, document:
   - Field name
   - Field type
   - Required status
   - Validation rules
   - Default values

### Task 1.3: Compare Against Required Specification

Compare your audit results against the required fields below. Generate a report with three categories:

- **Category A:** Fields that exist and are correct (no action needed)
- **Category B:** Fields that exist but need modification (document what changes are needed)
- **Category C:** Fields that are missing (must be created)

---

## Required Field Specification: Blog Post Content Type

### Section 1: Critical Fields (Implement Immediately)

| Field Name | Type | Required | Max Length | Validation | Purpose |
|------------|------|----------|------------|------------|---------|
| `title` | Short text | Yes | 100 | - | H1 page title |
| `slug` | UID | Yes | - | Auto-generate from title, allow manual override | URL-friendly identifier |
| `content` | Rich text (Markdown) | Yes | - | - | Main body content |
| `excerpt` | Long text | Yes | 160 | Enforce max length | Short summary for listings, meta description fallback, AI snippeting |
| `author` | Relation → Authors | Yes | - | Single relation | MUST be a relation, not plain text |
| `categories` | Relation → Categories | Yes | - | Single or multiple | Primary categorization |
| `tags` | Relation → Tags | No | - | Multiple | Topic tags for filtering |
| `featuredImage` | Media (single image) | Yes | - | Image files only | Hero/OG image |
| `featuredImageAltText` | Short text | Yes | 125 | Enforce max length | Accessibility and image SEO |
| `seoTitle` | Short text | No | 60 | Enforce max length | Custom meta title, fallback to title if empty |
| `seoDescription` | Long text | No | 160 | Enforce max length | Custom meta description, fallback to excerpt if empty |
| `publicationDate` | Datetime | Yes | - | - | Original publish date |
| `updatedAt` | Datetime | No | - | - | Last content modification date (critical for freshness signals) |
| `tldr` | Component (repeatable) | Yes | - | Min 3, Max 7 items | Key takeaways block for AI citation optimization |
| `faq` | Component (repeatable) | No | - | - | FAQ section for PAA and FAQPage schema |

### Section 2: High Priority Fields (Implement Within 2 Weeks)

| Field Name | Type | Required | Options/Notes | Purpose |
|------------|------|----------|---------------|---------|
| `relatedPosts` | Relation → Blog Posts | No | Multiple, max 5 | Manual internal linking for topical authority |
| `schemaType` | Enumeration | Yes | `Article`, `HowTo`, `FAQPage` (default: Article) | Determines which JSON-LD schema to generate |
| `primaryKeyword` | Short text | No | - | Target keyword for SEMrush tracking |

### Section 3: Optional Fields (Implement Within 1 Month)

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

## Required Component Specifications

### Component: `tldrItem`

Create this component for the repeatable TL;DR field:

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `point` | Long text | Yes | Single takeaway point (one bullet) |

### Component: `faqItem`

Create this component for the repeatable FAQ field:

| Field Name | Type | Required | Max Length |
|------------|------|----------|------------|
| `question` | Short text | Yes | 200 |
| `answer` | Long text | Yes | 1000 |

---

## Required Collection: Authors

Create a new collection type called `Authors` with the following fields:

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

## Task 1.4: Implement Missing Fields

For each field in Category C (missing):

1. Open Strapi Content-Type Builder
2. Navigate to Blog Post content type
3. Add field with exact specifications from the tables above
4. Configure field type, validation, and default values
5. Save content type

For Author field modification (if currently plain text):

1. First create the Authors collection
2. Create Author entries for existing authors
3. Change Author field from Short text to Relation → Authors
4. Update existing blog posts to link to correct Author entries
5. Remove old text-based author data after migration

### Task 1.5: Verify CMS Implementation

After all implementations:

1. Create a new test blog post
2. Fill in ALL fields including:
   - All critical fields
   - At least 3 TL;DR items
   - At least 2 FAQ items
   - Related posts selection
   - All SEO fields
3. Save and publish the test post
4. Query the API: `GET /api/blog-posts?populate=*`
5. Verify the response includes all fields with correct data types
6. Document the complete API response structure
7. Delete or unpublish the test post

---

## PART 2: FRONTEND (NEXT.JS) AUDIT AND IMPLEMENTATION

### Task 2.1: Locate Blog Post Template

Find the blog post page component. Common locations:
- `app/blog/[slug]/page.tsx` (App Router)
- `pages/blog/[slug].tsx` (Pages Router)

Document the file location and current structure.

### Task 2.2: Audit Metadata Implementation

Check if the following meta tags are dynamically rendered from CMS data. For each item, mark as:
- ✅ Implemented correctly
- ⚠️ Partially implemented (document issues)
- ❌ Not implemented

#### Head Meta Tags Checklist

| Meta Tag | Expected Source | Status |
|----------|-----------------|--------|
| `<title>` | seoTitle, fallback to title | ☐ |
| `<meta name="description">` | seoDescription, fallback to excerpt | ☐ |
| `<link rel="canonical">` | `https://maasiso.nl/blog/{slug}` | ☐ |
| `<meta property="og:title">` | seoTitle, fallback to title | ☐ |
| `<meta property="og:description">` | seoDescription, fallback to excerpt | ☐ |
| `<meta property="og:image">` | ogImage, fallback to featuredImage | ☐ |
| `<meta property="og:url">` | Full canonical URL | ☐ |
| `<meta property="og:type">` | "article" | ☐ |
| `<meta property="og:locale">` | "nl_NL" | ☐ |
| `<meta property="og:site_name">` | "Maas ISO" | ☐ |
| `<meta property="article:published_time">` | publicationDate (ISO 8601) | ☐ |
| `<meta property="article:modified_time">` | updatedAt (ISO 8601) | ☐ |
| `<meta property="article:author">` | author.name | ☐ |
| `<meta name="twitter:card">` | "summary_large_image" | ☐ |
| `<meta name="twitter:title">` | seoTitle, fallback to title | ☐ |
| `<meta name="twitter:description">` | seoDescription, fallback to excerpt | ☐ |
| `<meta name="twitter:image">` | ogImage, fallback to featuredImage | ☐ |
| `<meta name="robots">` | Based on robotsIndex/robotsFollow values | ☐ |

### Task 2.3: Audit JSON-LD Structured Data

Check if valid JSON-LD is present in the page source. Validate each schema type:

#### Article/BlogPosting Schema

| Property | Expected Value | Status |
|----------|----------------|--------|
| `@context` | "https://schema.org" | ☐ |
| `@type` | "Article" or "BlogPosting" | ☐ |
| `headline` | title | ☐ |
| `description` | excerpt | ☐ |
| `image` | featuredImage URL | ☐ |
| `datePublished` | publicationDate (ISO 8601) | ☐ |
| `dateModified` | updatedAt (ISO 8601) | ☐ |
| `author.@type` | "Person" | ☐ |
| `author.@id` | Unique author URI | ☐ |
| `author.name` | author.name | ☐ |
| `author.jobTitle` | author.credentials | ☐ |
| `author.sameAs` | Array containing author.linkedIn | ☐ |
| `author.image` | author.profileImage URL | ☐ |
| `publisher.@type` | "Organization" | ☐ |
| `publisher.name` | "Maas ISO" | ☐ |
| `publisher.logo` | Logo ImageObject | ☐ |
| `mainEntityOfPage` | Canonical URL | ☐ |

#### FAQPage Schema (Conditional: only if faq items exist)

| Property | Expected Value | Status |
|----------|----------------|--------|
| `@type` | "FAQPage" | ☐ |
| `mainEntity` | Array of Question objects | ☐ |
| `mainEntity[].@type` | "Question" | ☐ |
| `mainEntity[].name` | faq.question | ☐ |
| `mainEntity[].acceptedAnswer.@type` | "Answer" | ☐ |
| `mainEntity[].acceptedAnswer.text` | faq.answer | ☐ |

#### BreadcrumbList Schema

| Property | Expected Value | Status |
|----------|----------------|--------|
| `@type` | "BreadcrumbList" | ☐ |
| `itemListElement[0]` | Home (position 1) | ☐ |
| `itemListElement[1]` | Blog (position 2) | ☐ |
| `itemListElement[2]` | Current post title (position 3) | ☐ |

### Task 2.4: Audit HTML Semantic Structure

Check the rendered HTML for proper semantic markup:

| Element | Requirement | Status |
|---------|-------------|--------|
| Single `<h1>` | Page has exactly one H1 containing the title | ☐ |
| Heading hierarchy | H2 → H3 → H4, no skipped levels | ☐ |
| `<article>` wrapper | Main content is wrapped in article tag | ☐ |
| `<time>` for dates | publicationDate and updatedAt use time element with datetime attribute | ☐ |
| `<figure>` for images | Images with captions use figure + figcaption | ☐ |
| `<nav>` for breadcrumb | Breadcrumb navigation uses nav with aria-label | ☐ |
| Alt text on images | All images have descriptive alt attributes | ☐ |
| Lazy loading | Images below fold have loading="lazy" | ☐ |

### Task 2.5: Audit Content Block Rendering

Check if these CMS fields are rendered visibly on the page:

| Field | Expected Rendering | Status |
|-------|-------------------|--------|
| `tldr` | Styled box/card near top of article with bullet points | ☐ |
| `faq` | Expandable accordion or details/summary elements | ☐ |
| `author` | Author box showing: photo, name, credentials, bio, LinkedIn link | ☐ |
| `relatedPosts` | Grid or list of related articles at bottom | ☐ |
| `updatedAt` | Visible text: "Laatst bijgewerkt: {date}" | ☐ |
| `publicationDate` | Visible text: "Gepubliceerd: {date}" | ☐ |
| `categories` | Displayed as clickable links | ☐ |
| `tags` | Displayed as clickable tags/pills | ☐ |

---

## Task 2.6: Generate Frontend Audit Report

Create a structured report with:

```
## Frontend Audit Report

### Date: [DATE]
### Auditor: [NAME/ID]

### Summary
- Total items checked: [X]
- Implemented correctly: [X]
- Needs fixes: [X]
- Not implemented: [X]

### Category A: Implemented Correctly
[List items with ✅]

### Category B: Needs Fixes
[List items with issues and describe what needs to change]

### Category C: Not Implemented
[List items that must be built from scratch]

### Priority Order for Implementation
1. [Highest priority item]
2. [Second priority item]
...
```

---

## Task 2.7: Implement Missing Frontend Elements

### Implementation 2.7.1: Metadata (Next.js App Router)

Create or update the generateMetadata function:

```typescript
// app/blog/[slug]/page.tsx

import { Metadata } from 'next';
import { getPostBySlug } from '@/lib/api';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post niet gevonden',
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const image = post.ogImage?.url || post.featuredImage?.url;
  const canonicalUrl = `https://maasiso.nl/blog/${post.slug}`;

  return {
    title: title,
    description: description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: title,
      description: description,
      url: canonicalUrl,
      siteName: 'Maas ISO',
      images: image ? [{ url: image, width: 1200, height: 630, alt: post.featuredImageAltText }] : [],
      locale: 'nl_NL',
      type: 'article',
      publishedTime: post.publicationDate,
      modifiedTime: post.updatedAt || post.publicationDate,
      authors: post.author?.name ? [post.author.name] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: image ? [image] : [],
    },
    robots: {
      index: post.robotsIndex ?? true,
      follow: post.robotsFollow ?? true,
    },
  };
}
```

### Implementation 2.7.2: JSON-LD Schema Component

Create a reusable schema component:

```typescript
// components/BlogPostSchema.tsx

interface Author {
  name: string;
  slug: string;
  credentials?: string;
  linkedIn?: string;
  profileImage?: { url: string };
}

interface FaqItem {
  question: string;
  answer: string;
}

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publicationDate: string;
  updatedAt?: string;
  featuredImage?: { url: string };
  author?: Author;
  faq?: FaqItem[];
  schemaType?: 'Article' | 'HowTo' | 'FAQPage';
}

interface Props {
  post: BlogPost;
}

export function BlogPostSchema({ post }: Props) {
  const canonicalUrl = `https://maasiso.nl/blog/${post.slug}`;
  const authorUrl = post.author?.slug 
    ? `https://maasiso.nl/auteurs/${post.author.slug}` 
    : undefined;

  // Base Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage?.url,
    datePublished: post.publicationDate,
    dateModified: post.updatedAt || post.publicationDate,
    author: {
      '@type': 'Person',
      '@id': authorUrl ? `${authorUrl}#person` : undefined,
      name: post.author?.name,
      jobTitle: post.author?.credentials,
      image: post.author?.profileImage?.url,
      sameAs: post.author?.linkedIn ? [post.author.linkedIn] : [],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Maas ISO',
      logo: {
        '@type': 'ImageObject',
        url: 'https://maasiso.nl/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://maasiso.nl',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://maasiso.nl/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  };

  // FAQ Schema (conditional)
  const faqSchema = post.faq && post.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } : null;

  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(Boolean);

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
```

### Implementation 2.7.3: TL;DR Block Component

```typescript
// components/TldrBlock.tsx

interface TldrItem {
  point: string;
}

interface Props {
  items: TldrItem[];
}

export function TldrBlock({ items }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <aside 
      className="tldr-block bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg"
      data-speakable="true"
      aria-label="Samenvatting"
    >
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        ⚡ In 30 Seconden
      </h2>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-blue-500 mt-1">✓</span>
            <span>{item.point}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

### Implementation 2.7.4: FAQ Section Component

```typescript
// components/FaqSection.tsx

interface FaqItem {
  question: string;
  answer: string;
}

interface Props {
  items: FaqItem[];
}

export function FaqSection({ items }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <section className="faq-section my-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-bold mb-6">
        Veelgestelde Vragen
      </h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <details 
            key={index} 
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <summary className="px-6 py-4 cursor-pointer font-medium hover:bg-gray-50 flex justify-between items-center">
              <span>{item.question}</span>
              <span className="text-gray-400">+</span>
            </summary>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
```

### Implementation 2.7.5: Author Box Component

```typescript
// components/AuthorBox.tsx

interface Author {
  name: string;
  slug: string;
  bio: string;
  credentials?: string;
  profileImage?: { url: string };
  linkedIn?: string;
}

interface Props {
  author: Author;
}

export function AuthorBox({ author }: Props) {
  if (!author) return null;

  return (
    <aside 
      className="author-box border border-gray-200 rounded-lg p-6 my-8"
      itemScope
      itemType="https://schema.org/Person"
    >
      <div className="flex items-start gap-4">
        {author.profileImage?.url && (
          <img
            src={author.profileImage.url}
            alt={author.name}
            className="w-20 h-20 rounded-full object-cover"
            itemProp="image"
          />
        )}
        <div className="flex-1">
          <h3 className="font-bold text-lg" itemProp="name">
            {author.name}
          </h3>
          {author.credentials && (
            <p className="text-sm text-gray-600" itemProp="jobTitle">
              {author.credentials}
            </p>
          )}
          <p className="mt-2 text-gray-700" itemProp="description">
            {author.bio}
          </p>
          {author.linkedIn && (
            <a
              href={author.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-blue-600 hover:underline"
              itemProp="sameAs"
            >
              <span>LinkedIn profiel</span>
              <span>→</span>
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
```

### Implementation 2.7.6: Related Posts Component

```typescript
// components/RelatedPosts.tsx

interface RelatedPost {
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: { url: string };
}

interface Props {
  posts: RelatedPost[];
}

export function RelatedPosts({ posts }: Props) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="related-posts my-12" aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-2xl font-bold mb-6">
        Gerelateerde Artikelen
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {post.featuredImage?.url && (
              <img
                src={post.featuredImage.url}
                alt={post.title}
                className="w-full h-40 object-cover"
                loading="lazy"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold mb-2">{post.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
```

### Implementation 2.7.7: Complete Blog Post Page Template

```typescript
// app/blog/[slug]/page.tsx

import { getPostBySlug, getAllPostSlugs } from '@/lib/api';
import { BlogPostSchema } from '@/components/BlogPostSchema';
import { TldrBlock } from '@/components/TldrBlock';
import { FaqSection } from '@/components/FaqSection';
import { AuthorBox } from '@/components/AuthorBox';
import { RelatedPosts } from '@/components/RelatedPosts';
import { notFound } from 'next/navigation';

// ... generateMetadata function from 2.7.1 ...

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const formattedPublicationDate = new Date(post.publicationDate).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedUpdatedDate = post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <>
      <BlogPostSchema post={post} />
      
      <article itemScope itemType="https://schema.org/Article">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li>/</li>
            <li><a href="/blog" className="hover:underline">Blog</a></li>
            <li>/</li>
            <li className="text-gray-900">{post.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 itemProp="headline" className="text-4xl font-bold mb-4">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>
              Gepubliceerd:{' '}
              <time itemProp="datePublished" dateTime={post.publicationDate}>
                {formattedPublicationDate}
              </time>
            </span>
            
            {formattedUpdatedDate && (
              <span>
                Laatst bijgewerkt:{' '}
                <time itemProp="dateModified" dateTime={post.updatedAt}>
                  {formattedUpdatedDate}
                </time>
              </span>
            )}
            
            {post.author && (
              <span>
                Door:{' '}
                <a 
                  href={`/auteurs/${post.author.slug}`}
                  itemProp="author"
                  className="hover:underline"
                >
                  {post.author.name}
                </a>
              </span>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage?.url && (
          <figure className="mb-8">
            <img
              src={post.featuredImage.url}
              alt={post.featuredImageAltText || post.title}
              className="w-full rounded-lg"
              itemProp="image"
            />
          </figure>
        )}

        {/* TL;DR Block */}
        <TldrBlock items={post.tldr} />

        {/* Main Content */}
        <div 
          itemProp="articleBody" 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* FAQ Section */}
        <FaqSection items={post.faq} />

        {/* Author Box */}
        <AuthorBox author={post.author} />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 my-8">
            {post.tags.map((tag) => (
              <a
                key={tag.slug}
                href={`/blog/tag/${tag.slug}`}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
              >
                {tag.name}
              </a>
            ))}
          </div>
        )}

        {/* Related Posts */}
        <RelatedPosts posts={post.relatedPosts} />
      </article>
    </>
  );
}
```

---

## Task 2.8: Additional Technical Requirements

### 2.8.1: Implement IndexNow

Add IndexNow notification when posts are published or updated:

```typescript
// lib/indexnow.ts

export async function notifyIndexNow(url: string) {
  const key = process.env.INDEXNOW_KEY;
  
  if (!key) {
    console.warn('IndexNow key not configured');
    return;
  }

  try {
    await fetch(`https://api.indexnow.org/indexnow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'maasiso.nl',
        key: key,
        urlList: [url],
      }),
    });
  } catch (error) {
    console.error('IndexNow notification failed:', error);
  }
}
```

### 2.8.2: XML Sitemap with lastmod

Ensure sitemap includes lastmod from updatedAt:

```typescript
// app/sitemap.ts

import { getAllPosts } from '@/lib/api';

export default async function sitemap() {
  const posts = await getAllPosts();
  
  const blogUrls = posts.map((post) => ({
    url: `https://maasiso.nl/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publicationDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://maasiso.nl',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://maasiso.nl/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...blogUrls,
  ];
}
```

### 2.8.3: Server-Side Rendering Verification

Verify SSR is working correctly:

1. Run `curl -s https://maasiso.nl/blog/[test-slug] | head -200`
2. Confirm HTML contains:
   - Full article content (not just loading placeholders)
   - All meta tags populated with actual values
   - JSON-LD script tags with complete data
   - Semantic HTML structure (h1, article, time elements)

---

## PART 3: VERIFICATION AND TESTING

### Task 3.1: CMS Verification Checklist

Complete this checklist after CMS implementation:

```
☐ All required fields exist in Blog Post content type
☐ All components (tldrItem, faqItem) are created
☐ Authors collection exists with all required fields
☐ Author field on Blog Post is a relation (not text)
☐ Test post can be created with all fields populated
☐ API returns all fields when querying with populate=*
☐ Media files are accessible via URL
```

### Task 3.2: Frontend Verification Checklist

Complete this checklist after frontend implementation:

```
☐ Page title matches seoTitle (or falls back to title)
☐ Meta description matches seoDescription (or falls back to excerpt)
☐ Canonical URL is correct and self-referencing
☐ All Open Graph tags are populated
☐ All Twitter Card tags are populated
☐ Article schema is valid (test with Google Rich Results Test)
☐ FAQ schema is valid (when FAQ items exist)
☐ Breadcrumb schema is valid
☐ TL;DR block renders visibly on page
☐ FAQ section renders with expandable items
☐ Author box displays with all available data
☐ Dates are visible to users (published and updated)
☐ Related posts section displays linked articles
☐ All images have alt text
☐ Page passes Lighthouse SEO audit (score 90+)
☐ HTML is fully rendered server-side (check page source)
```

### Task 3.3: Testing Tools

Use these tools to validate implementation:

| Tool | URL | Purpose |
|------|-----|---------|
| Google Rich Results Test | https://search.google.com/test/rich-results | Validate JSON-LD schemas |
| Schema.org Validator | https://validator.schema.org | Deep schema validation |
| Meta Tags Debugger | https://metatags.io | Preview social sharing |
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug | Validate OG tags |
| Google PageSpeed Insights | https://pagespeed.web.dev | Check Core Web Vitals |
| Lighthouse (Chrome DevTools) | Built into Chrome | Full SEO audit |

### Task 3.4: Final Test Procedure

1. Create a new blog post with ALL fields populated
2. Publish the post
3. Wait 2 minutes for any caching to clear
4. Run all verification tools from Task 3.3
5. Document any errors or warnings
6. Fix issues and re-test until all checks pass
7. Create final verification report

---

## Deliverables

Upon completion, provide:

1. **CMS Audit Report** — Document of current vs. required fields
2. **CMS Implementation Log** — List of all fields/components created or modified
3. **Frontend Audit Report** — Document of current vs. required implementations
4. **Frontend Implementation Log** — List of all components and changes made
5. **Verification Report** — Results from all testing tools
6. **API Documentation** — Updated API response structure for blog posts
7. **Component Documentation** — Brief description of each new component created

---

## Timeline Expectations

| Phase | Duration |
|-------|----------|
| CMS Audit | 1-2 hours |
| CMS Implementation | 2-4 hours |
| CMS Verification | 1 hour |
| Frontend Audit | 1-2 hours |
| Frontend Implementation | 4-8 hours |
| Testing & Verification | 2-3 hours |
| Documentation | 1-2 hours |
| **Total** | **12-22 hours** |

---

## Questions?

If any requirement is unclear or you encounter blockers, document:
1. The specific requirement in question
2. What you have attempted
3. The error or obstacle encountered
4. Your proposed alternative solution (if any)

Do not skip requirements without explicit approval.
```

---

This is the complete developer task prompt. Copy everything inside the code block and provide it to your AI developer. The prompt is structured to be:

1. **Clear and systematic** — Organized in logical phases
2. **Comprehensive** — Covers all CMS and frontend requirements
3. **Verifiable** — Includes checklists and testing procedures
4. **Self-contained** — All specifications are included, no external references needed
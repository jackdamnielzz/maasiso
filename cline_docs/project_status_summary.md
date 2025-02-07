# Gedetailleerde Project Status: MaasISO Website Development

## Huidige Situatie

### Architectuur & Infrastructuur
We hebben een Next.js frontend en een Strapi CMS backend succesvol geïntegreerd via GraphQL. De backend draait op een Hostinger VPS (153.92.223.23) met de volgende configuratie:
- Ubuntu 22.04 LTS
- Node.js v20.18.1
- PostgreSQL 14
- Nginx als reverse proxy
- PM2 voor process management
- GraphQL API endpoint actief

### Core Componenten

#### 1. Frontend (Next.js 14)
```typescript
// src/lib/api.ts
export async function getBlogPosts(): Promise<{ blogPosts: BlogPost[] }> {
  const query = `
    query GetBlogPosts {
      blogPosts {
        documentId
        title
        Content
        slug
        Author
        categories {
          documentId
          name
        }
        createdAt
        updatedAt
      }
    }
  `;

  return client.request(query);
}
```

Deze API integratie is cruciaal omdat het:
- Data ophaalt van Strapi via GraphQL
- Type-safe is met TypeScript interfaces
- Error handling bevat
- Consistent is over de hele applicatie

#### 2. Blog Card Component
```typescript
export default function BlogCard({ post }: BlogCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          {post.categories?.map((category) => (
            <span key={category.documentId} className="text-sm text-[#091E42]/70 mr-2">
              {category.name}
            </span>
          ))}
          {post.publicationDate && (
            <span className="text-sm text-[#091E42]/70">
              {new Date(post.publicationDate).toLocaleDateString('nl-NL')}
            </span>
          )}
        </div>
        
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-semibold text-[#091E42] mb-3 hover:text-[#FF8B00]">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-[#091E42]/80 mb-4 line-clamp-3 whitespace-pre-wrap">
          {post.Content.replace(/[#*]/g, '').split('\n').filter(line => line.trim())[0]}
        </p>
        
        <Link href={`/blog/${post.slug}`} className="text-[#FF8B00] hover:text-[#E67E00] mt-auto">
          Lees meer
        </Link>
      </div>
    </div>
  );
}
```

Deze component bevat:
- Responsive design
- Markdown content preview
- Category weergave
- Datum formatting
- Error handling
- Loading states

### Recent Geïmplementeerde Functionaliteiten

1. **GraphQL Integratie**
   - Plugin geïnstalleerd en geconfigureerd
   - Public permissions ingesteld
   - Query structuur geoptimaliseerd
   - Error handling geïmplementeerd

2. **Blog Functionaliteit**
   - Blog posts ophalen via GraphQL
   - Blog card component met preview
   - Categorie weergave
   - Publicatiedatum formatting
   - Markdown content verwerking

3. **Content Types in Strapi**
   - Blog Posts (met categorieën)
   - Nieuws Artikelen
   - Whitepapers
   - Tools
   - Testimonials
   - Events

## Huidige Uitdagingen

### 1. Blog Post Detail Pagina's
We moeten nog implementeren:
- Dynamic routing voor blog posts
- Detail pagina template
- Markdown rendering
- SEO meta tags

### 2. Mobile Navigatie
- Nog niet geïmplementeerd
- Moet rekening houden met dropdown functionaliteit
- Hamburger menu design nodig

### 3. Type Safety
- GraphQL types volledig geïmplementeerd
- Enkele `any` types in navigatie configuratie
- Betere TypeScript interfaces nodig voor nested structures

### 4. Performance
- Markdown rendering optimalisatie nodig
- Image loading strategy bepalen
- Caching implementeren

## Oplossingspogingen

Voor de GraphQL integratie hebben we verschillende benaderingen geprobeerd:

1. **Directe Query Aanpak (Huidige Oplossing)**:
```typescript
const query = `
  query GetBlogPosts {
    blogPosts {
      documentId
      title
      Content
      // ...andere velden
    }
  }
`;
```
Dit werkt goed en is eenvoudig te onderhouden.

2. **GraphQL Codegen (Overwogen)**:
Besloten dit later te implementeren wanneer de schema stabieler is.

## Context voor Nieuwe Developer

### Project Setup
- Next.js 14 met App Router
- Tailwind CSS voor styling
- TypeScript voor type safety
- GraphQL voor data fetching
- Markdown voor content

### Belangrijke Bestanden
- `src/lib/api.ts` - GraphQL queries en types
- `src/components/features/BlogCard.tsx` - Blog card component
- `src/app/page.tsx` - Home page met blog sectie

### Nog Te Implementeren
1. Blog post detail pagina's
2. Mobile navigatie systeem
3. Markdown rendering
4. Image optimalisatie
5. Caching strategie

## Volgende Stappen

### Prioriteit 1: Blog Post Detail Pagina's
1. Implementeer dynamic routing
2. Creëer detail pagina template
3. Voeg markdown rendering toe
4. Implementeer SEO meta tags

### Prioriteit 2: Mobile Navigatie
1. Ontwikkel hamburger menu component
2. Implementeer touch-friendly dropdown systeem
3. Maak responsive aanpassingen

### Prioriteit 3: Performance Optimalisatie
1. Implementeer image optimalisatie
2. Voeg caching toe
3. Optimaliseer markdown rendering

## Technische Notities
- GraphQL endpoint: http://153.92.223.23/graphql
- Gebruik `npm run dev` voor development
- Check `/cline_docs` voor uitgebreide documentatie
- Volg Tailwind naming conventions
- Houd rekening met toekomstige meertaligheid

## Revision History
- **Date:** 2025-01-12
- **Description:** Updated after comprehensive documentation review
- **Author:** AI
- **Date:** 2025-01-12
- **Description:** Added GraphQL integration and blog functionality progress
- **Author:** AI
- **Date:** 2025-01-12
- **Description:** Initial project status summary
- **Author:** AI

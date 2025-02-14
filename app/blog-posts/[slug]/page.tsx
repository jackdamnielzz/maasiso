import { Metadata } from 'next';
import { getBlogPostBySlug } from '../../../src/lib/api';
import { notFound } from 'next/navigation';
import { formatDate } from '../../../src/lib/utils';

type PageParams = { slug: string };

type BlogPostPageProps = {
  params: Promise<PageParams>;
};

export async function generateMetadata(
  { params }: BlogPostPageProps
): Promise<Metadata> {
  const resolvedParams = await params;
  
  try {
    const { blogPost } = await getBlogPostBySlug(resolvedParams.slug);
    if (!blogPost) return { title: 'Blog Post Not Found' };
    
    return {
      title: blogPost.title,
      description: blogPost.summary,
      openGraph: blogPost.featuredImage ? {
        images: [{ url: blogPost.featuredImage.url }],
      } : undefined,
    };
  } catch (error) {
    return {
      title: 'Error Loading Blog Post',
      description: 'There was an error loading this blog post.',
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  
  try {
    const { blogPost } = await getBlogPostBySlug(resolvedParams.slug);
    
    if (!blogPost) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-white">
        <article className="max-w-4xl mx-auto px-6 py-16">
          {/* Featured Image */}
          {blogPost.featuredImage && (
            <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
              <img
                src={blogPost.featuredImage.url}
                alt={blogPost.featuredImage.alternativeText || blogPost.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-[#091E42] mb-4">
              {blogPost.title}
            </h1>
            
            <div className="flex items-center text-[#091E42]/70 mb-4">
              {/* Categories */}
              <div className="flex items-center">
                {blogPost.categories.map((category, index) => (
                  <span key={category.id}>
                    {category.name}
                    {index < blogPost.categories.length - 1 && ', '}
                  </span>
                ))}
              </div>
              
              {/* Publication Date */}
              {blogPost.publishedAt && (
                <>
                  <span className="mx-2">•</span>
                  <time dateTime={blogPost.publishedAt}>
                    {formatDate(blogPost.publishedAt)}
                  </time>
                </>
              )}
            </div>

            {/* Summary */}
            {blogPost.summary && (
              <p className="text-xl text-[#091E42]/80 leading-relaxed">
                {blogPost.summary}
              </p>
            )}
          </header>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-[#091E42] prose-p:text-[#091E42]/80"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />
        </article>
      </main>
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-600 mb-4">
            Error Loading Blog Post
          </h1>
          <p className="text-[#091E42]/70">
            There was an error loading this blog post. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}

import { getBlogPosts } from '@/lib/api';
import { BlogPost } from '@/lib/types';
import BlogCard from '@/components/features/BlogCard';
import Link from 'next/link';

export default async function Home() {
  try {
    // Try to fetch latest blog posts (limited to 3)
    let blogPosts: BlogPost[] = [];
    try {
      const response = await getBlogPosts(1, 3);
      blogPosts = response.posts;
    } catch (error) {
      console.log('No blog posts found:', error);
    }
    
    return (
      <div className="bg-[#091E42] text-white">
        {/* Hero Section */}
        <div className="container-custom py-32">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-[3.75rem] font-medium mb-12 leading-[1.25] tracking-tight">
              Informatiebeveiliging en Privacy |<br />
              <span className="mt-6 block">Excellentie door ISO Certificering</span>
            </h1>
            <p className="text-xl text-white/90 mb-16 leading-relaxed max-w-3xl">
              Wij helpen uw bedrijf sterker te worden. Met onze begeleiding bij ISO 9001, ISO 27001 en de AVG-regels.
            </p>
            <Link
              href="/contact"
              className="cta-button inline-flex items-center justify-center text-center min-w-[260px] bg-[#FF8B00] hover:bg-[#E67E00] shadow-lg hover:shadow-xl"
            >
              Vraag een gratis consult aan
            </Link>
          </div>
        </div>

        {/* Recent Blog Posts Section */}
        {blogPosts.length > 0 && (
          <div className="bg-white py-24">
            <div className="container-custom">
              <h2 className="text-3xl font-semibold text-[#091E42] mb-12">
                Laatste Artikelen
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
              <div className="mt-12 text-center">
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center text-center px-8 py-3 bg-[#091E42] text-white hover:bg-[#122f66] rounded-lg transition-colors"
                >
                  Bekijk alle artikelen
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error loading home page:', error);
    return (
      <div className="container-custom py-32 text-center">
        <h1 className="text-2xl text-red-600">
          Er is een fout opgetreden bij het laden van de pagina. Probeer het later opnieuw.
        </h1>
      </div>
    );
  }
}

import Link from 'next/link';
import { dateFormatter, getExcerpt } from '@/lib/utils';

export interface SearchResultItemProps {
  id: string;
  title: string;
  content: string;
  slug: string;
  publishedAt?: string;
  type: 'blog' | 'news';
  query?: string;
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === query.toLowerCase() ? 
      <mark key={i} className="bg-yellow-100 rounded px-0.5">{part}</mark> : 
      part
  );
}

export default function SearchResultItem({
  title,
  content,
  slug,
  publishedAt,
  type,
  query = ''
}: SearchResultItemProps) {
  const baseUrl = type === 'blog' ? '/blog' : '/nieuws';
  
  return (
    <article className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
      <Link 
        href={`${baseUrl}/${slug}`}
        className="block group"
      >
        <h3 className="text-lg font-semibold text-[#091E42] group-hover:text-[#FF8B00] transition-colors mb-2">
          {highlightText(title, query)}
        </h3>
        <p className="text-[#091E42]/70 mb-2 line-clamp-2">
          {highlightText(getExcerpt(content), query)}
        </p>
        <div className="flex items-center text-sm text-[#091E42]/60">
          {publishedAt && (
            <time dateTime={publishedAt}>
              {dateFormatter(publishedAt)}
            </time>
          )}
        </div>
      </Link>
    </article>
  );
}

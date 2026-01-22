'use client';

import { Tag } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';

interface TagListProps {
  tags: Tag[];
  selectedTags?: string[];
  articleCounts?: { [tagId: string]: number };
  className?: string;
}

export default function TagList({
  tags = [],
  selectedTags = [],
  articleCounts = {},
  className = ''
}: TagListProps) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return null;
  }
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTagClick = (tagId: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    const currentTags = params.get('tags')?.split(',').filter(Boolean) || [];
    
    let newTags: string[];
    if (currentTags.includes(tagId)) {
      // Remove tag if already selected
      newTags = currentTags.filter(t => t !== tagId);
    } else {
      // Add tag if not selected
      newTags = [...currentTags, tagId];
    }
    
    if (newTags.length > 0) {
      params.set('tags', newTags.join(','));
    } else {
      params.delete('tags');
    }
    
    router.push(`?${params.toString()}`);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag.id)}
            className={`
              px-3 py-1 rounded-full text-sm font-medium
              transition-colors duration-200
              ${isSelected 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {tag.name}
            {articleCounts && articleCounts[tag.id] > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                isSelected ? 'bg-blue-400' : 'bg-gray-200'
              }`}>
                {articleCounts[tag.id]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
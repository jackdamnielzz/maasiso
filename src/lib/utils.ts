import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Class name utility for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date using Intl.DateTimeFormat
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// Legacy date formatter (keeping for compatibility)
export const dateFormatter = formatDate;

// Get excerpt from content
export function getExcerpt(content: string, maxLength: number = 200): string {
  // Remove Markdown syntax
  const plainText = content
    .replace(/[#*`]/g, '') // Remove Markdown syntax
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with just their text
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find the last complete word within maxLength
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

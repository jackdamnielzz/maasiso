import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(dateString));
}

export const dateFormatter = formatDate;

export function isPromise(value: unknown): value is Promise<unknown> {
  return value instanceof Promise;
}

export function getExcerpt(text: string, maxLength: number = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

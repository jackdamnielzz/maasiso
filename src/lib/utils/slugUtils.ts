/**
 * Utilities for handling URL slugs
 */

/**
 * Convert a string to a URL-friendly slug
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Handles multiple consecutive hyphens
 */
export function createSlug(str: string): string {
  return str
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate and sanitize a slug
 * - Ensures the slug is URL-friendly
 * - Returns the sanitized slug
 */
export function validateSlug(slug: string): string {
  if (!slug) {
    throw new Error('Slug cannot be empty');
  }
  return createSlug(slug);
}
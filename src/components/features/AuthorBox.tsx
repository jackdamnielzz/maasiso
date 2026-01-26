'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Author } from '@/lib/types';

interface AuthorBoxProps {
  author?: Author | string;
  className?: string;
}

/**
 * AuthorBox component displays author information
 * Optimized for E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 * Includes Person schema.org markup for better author recognition
 */
export function AuthorBox({ author, className = '' }: AuthorBoxProps) {
  // Don't render if no author provided
  if (!author) {
    return null;
  }

  // Handle backward compatibility - if author is just a string
  if (typeof author === 'string') {
    return (
      <aside className={`author-box border border-gray-200 rounded-lg p-6 my-8 bg-gray-50 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">
              Door: {author}
            </h3>
          </div>
        </div>
      </aside>
    );
  }

  // Full Author object with all details
  const authorUrl = `/auteurs/${author.slug}`;
  const hasImage = author.profileImage?.url;

  return (
    <aside
      className={`author-box border border-gray-200 rounded-lg p-6 my-8 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
      itemScope
      itemType="https://schema.org/Person"
      role="complementary"
      aria-label="Over de auteur"
    >
      <div className="flex items-start gap-6">
        {/* Author Image */}
        {hasImage && (
          <div className="flex-shrink-0">
            <Link href={authorUrl} aria-label={`Bekijk profiel van ${author.name}`}>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 ring-blue-100 hover:ring-blue-300 transition-all duration-200">
                <Image
                  src={author.profileImage.url}
                  alt={author.name}
                  fill
                  className="object-cover"
                  itemProp="image"
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </div>
            </Link>
          </div>
        )}

        {/* Author Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1">
              <Link
                href={authorUrl}
                itemProp="name"
                className="hover:text-blue-600 transition-colors duration-150"
              >
                {author.name}
              </Link>
            </h3>

            {author.credentials && (
              <p
                className="text-sm text-blue-600 font-medium"
                itemProp="jobTitle"
              >
                {author.credentials}
              </p>
            )}
          </div>

          {author.bio && (
            <p
              className="text-gray-700 leading-relaxed mb-4"
              itemProp="description"
            >
              {author.bio}
            </p>
          )}

          {/* Expertise Tags */}
          {author.expertise && author.expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {author.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  itemProp="knowsAbout"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {author.linkedIn && (
              <a
                href={author.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                itemProp="sameAs"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                aria-label={`LinkedIn profiel van ${author.name}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span>LinkedIn</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}

            {author.email && (
              <a
                href={`mailto:${author.email}`}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors duration-150"
                aria-label={`Email ${author.name}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="hidden sm:inline">Email</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Hidden metadata for schema */}
      <meta itemProp="url" content={`https://maasiso.nl${authorUrl}`} />
    </aside>
  );
}

export default AuthorBox;

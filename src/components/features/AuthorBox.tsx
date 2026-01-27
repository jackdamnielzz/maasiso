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
 * AuthorBox component displays author information as a professional "business card"
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
      <aside className={`author-box my-12 ${className}`}>
        <div className="border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Geschreven door</p>
          <p className="font-semibold text-gray-900 text-lg">{author}</p>
        </div>
      </aside>
    );
  }

  // Full Author object with all details - Business Card Style
  const authorUrl = `/auteurs/${author.slug}`;
  const hasImage = author.profileImage?.url;

  // Construct proper image URL
  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://peaceful-insight-production.up.railway.app';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <aside
      className={`author-card my-12 ${className}`}
      itemScope
      itemType="https://schema.org/Person"
      role="complementary"
      aria-label="Over de auteur"
    >
      {/* Section Header */}
      <div className="border-t border-gray-200 pt-8 mb-6">
        <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">
          Geschreven door
        </p>
      </div>

      {/* Author Card */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
          {/* Author Image */}
          {hasImage && (
            <div className="flex-shrink-0">
              <Link href={authorUrl} aria-label={`Bekijk profiel van ${author.name}`}>
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg hover:ring-blue-100 transition-all duration-300 group">
                  <Image
                    src={getImageUrl(author.profileImage!.url)}
                    alt={`Profielfoto van ${author.name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    itemProp="image"
                    sizes="(max-width: 640px) 96px, 112px"
                  />
                </div>
              </Link>
            </div>
          )}

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            {/* Name and Credentials */}
            <div className="mb-3">
              <h3 className="font-bold text-xl sm:text-2xl text-gray-900 mb-1">
                <Link
                  href={authorUrl}
                  itemProp="name"
                  className="hover:text-blue-600 transition-colors duration-200"
                >
                  {author.name}
                </Link>
              </h3>

              {author.credentials && (
                <p
                  className="text-sm sm:text-base text-blue-600 font-semibold"
                  itemProp="jobTitle"
                >
                  {author.credentials}
                </p>
              )}
            </div>

            {/* Bio */}
            {author.bio && (
              <p
                className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base line-clamp-3"
                itemProp="description"
              >
                {author.bio}
              </p>
            )}

            {/* Expertise Tags */}
            {author.expertise && author.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {author.expertise.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                    itemProp="knowsAbout"
                  >
                    {skill}
                  </span>
                ))}
                {author.expertise.length > 5 && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500">
                    +{author.expertise.length - 5} meer
                  </span>
                )}
              </div>
            )}

            {/* Social Links & Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {author.linkedIn && (
                <a
                  href={author.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  itemProp="sameAs"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors duration-200 shadow-sm"
                  aria-label={`LinkedIn profiel van ${author.name}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              )}

              {author.email && (
                <a
                  href={`mailto:${author.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                  aria-label={`Email ${author.name}`}
                >
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Contact</span>
                </a>
              )}

              <Link
                href={authorUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200"
              >
                <span>Bekijk profiel</span>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden metadata for schema */}
      <meta itemProp="url" content={`https://maasiso.nl${authorUrl}`} />
    </aside>
  );
}

export default AuthorBox;

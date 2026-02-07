"use client";

import React from 'react';
import Link from 'next/link';
import { COMPANY_DETAILS } from '@/config/company';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Over MaasISO</h3>
            <p className="text-gray-400">
              Pragmatische ISO-consultancy voor MKB. MaasISO begeleidt, de certificerende instelling toetst.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Diensten</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/iso-certificering" className="text-gray-400 hover:text-white">
                  ISO-certificering
                </Link>
              </li>
              <li>
                <Link href="/informatiebeveiliging" className="text-gray-400 hover:text-white">
                  Informatiebeveiliging
                </Link>
              </li>
              <li>
                <Link href="/avg-wetgeving" className="text-gray-400 hover:text-white">
                  AVG & Wetgeving
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Kennis</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/kennis/blog" className="text-gray-400 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/kennis/whitepapers" className="text-gray-400 hover:text-white">
                  Whitepapers
                </Link>
              </li>
              <li>
                <Link href="/kennis/e-learning" className="text-gray-400 hover:text-white">
                  E-learning
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">
                <span>Tel: {COMPANY_DETAILS.phoneDisplay}</span>
              </li>
              <li className="text-gray-400">
                <span>Email: {COMPANY_DETAILS.email}</span>
              </li>
              <li className="text-gray-400">
                <span>
                  Adres: {COMPANY_DETAILS.addressLine1}, {COMPANY_DETAILS.postalCode} {COMPANY_DETAILS.city}
                </span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Juridisch</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-gray-400 hover:text-white">
                  Cookie Beleid
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-gray-400 hover:text-white">
                  Algemene Voorwaarden
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} MaasISO. Alle rechten voorbehouden.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="https://twitter.com/maasiso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/maasiso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/maasiso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

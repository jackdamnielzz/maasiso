'use client';

import React, { ReactElement } from 'react';
import Link from 'next/link';
import { useNavigation } from '@/components/providers/NavigationProvider';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps): ReactElement {
  const { pathname } = useNavigation();

  return (
    <header className="site-header">
      <nav className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-semibold text-white bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              Maas<span className="text-[#FF8B00] bg-none">ISO</span>
            </span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              href="/diensten"
              className={`text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                pathname === '/diensten' ? 'text-[#FF8B00]' : 'text-white'
              }`}
            >
              Diensten
            </Link>
            <Link
              href="/onze-voordelen"
              className={`text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                pathname === '/onze-voordelen' ? 'text-[#FF8B00]' : 'text-white'
              }`}
            >
              Onze Voordelen
            </Link>
            <Link
              href="/over-ons"
              className={`text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                pathname === '/over-ons' ? 'text-[#FF8B00]' : 'text-white'
              }`}
            >
              Over Ons
            </Link>
            <Link
              href="/contact"
              className={`text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                pathname === '/contact' ? 'text-[#FF8B00]' : 'text-white'
              }`}
            >
              Contact
            </Link>

            {/* Dropdown Menu */}
            <div className="relative group">
              <button className={`text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                (pathname && (pathname === '/news' || pathname.startsWith('/blog'))) ? 'text-[#FF8B00]' : 'text-white'
              }`}>
                Informatie
              </button>
              <div className="absolute hidden group-hover:block bg-white min-w-[200px] rounded-md shadow-lg py-2 mt-2 right-0">
                <div className="absolute top-0 h-2 w-full -mt-2 bg-transparent" />
                <Link
                  href="/news"
                  className={`block px-4 py-2 text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                    pathname === '/news' ? 'text-[#FF8B00]' : 'text-[#091E42]'
                  }`}
                >
                  Nieuws
                </Link>
                <Link
                  href="/blog"
                  className={`block px-4 py-2 text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                    pathname === '/blog' ? 'text-[#FF8B00]' : 'text-[#091E42]'
                  }`}
                >
                  Blog
                </Link>
                <Link
                  href="/whitepaper"
                  className={`block px-4 py-2 text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                    pathname === '/whitepaper' ? 'text-[#FF8B00]' : 'text-[#091E42]'
                  }`}
                >
                  Whitepapers
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-white" aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}

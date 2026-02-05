'use client';

import React, { ReactElement, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useNavigation } from '@/components/providers/NavigationProvider';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps): ReactElement {
  const { pathname } = useNavigation();
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Log state changes
  console.log('[Header] State:', {
    isHydrated,
    mobileMenuOpen
  });

  // Create stable callback function that won't be recreated on renders
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prevState) => !prevState);
  }, []);

  // Close menu only when navigating to a different page
  useEffect(() => {
    console.log('[Header] Route changed:', { pathname });
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle initial hydration
  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true);
      console.log('[Header] Component hydrated:', {
        pathname
      });
    }
  }, [isHydrated, pathname]);

  return (
    <header className="site-header">
      <nav className="container-custom relative max-w-[1400px]">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-semibold text-white bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              Maas<span className="text-[#FF8B00] bg-none">ISO</span>
            </span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/iso-certificering"
              className={`text-[13px] leading-none whitespace-nowrap hover:text-[#FF8B00] transition-colors duration-200 ${
                pathname?.startsWith('/iso-certificering') ? 'text-[#FF8B00]' : 'text-white'
              }`}
            >
              ISO-certificering
            </Link>
            <Link
              href="/informatiebeveiliging"
              className={`text-[13px] leading-none whitespace-nowrap hover:text-[#FF8B00] transition-colors duration-200 ${
                pathname?.startsWith('/informatiebeveiliging') ? 'text-[#FF8B00]' : 'text-white'
              }`}
            >
              Informatiebeveiliging
            </Link>
            <Link
              href="/avg-wetgeving"
              className={`text-[13px] leading-none whitespace-nowrap hover:text-[#FF8B00] transition-colors duration-200 ${
                pathname?.startsWith('/avg-wetgeving') ? 'text-[#FF8B00]' : 'text-white'
              }`}
            >
              AVG & Wetgeving
            </Link>
            <Link
              href="/kennis"
              className={`text-[13px] leading-none whitespace-nowrap hover:text-[#FF8B00] transition-colors duration-200 ${
                pathname?.startsWith('/kennis') ? 'text-[#FF8B00]' : 'text-white'
              }`}
            >
              Kennis
            </Link>
            <Link
              href="/waarom-maasiso"
              className={`text-[13px] leading-none whitespace-nowrap hover:text-[#FF8B00] transition-colors duration-200 ${
                pathname === '/waarom-maasiso' ? 'text-[#FF8B00]' : 'text-white'
              }`}
            >
              Waarom MaasISO
            </Link>
            <Link
              href="/over-ons"
              className={`text-[13px] leading-none whitespace-nowrap hover:text-[#FF8B00] transition-colors duration-200 ${
                pathname === '/over-ons' ? 'text-[#FF8B00]' : 'text-white'
              }`}
            >
              Over ons
            </Link>
            <Link
              href="/contact"
              className={`text-[13px] leading-none whitespace-nowrap hover:text-[#FF8B00] transition-colors duration-200 ${
                pathname === '/contact' ? 'text-[#FF8B00]' : 'text-white'
              }`}
            >
              Contact
            </Link>

            {/* ISO Selector Button */}
            <Link
              href="/iso-selector"
              className="text-[13px] font-semibold text-white px-3 py-2 rounded-lg bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] hover:from-[#FF9B20] hover:to-[#FF7B10] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              ISO-Selector
            </Link>
          </div>

          <div className="md:hidden">
            {/* Mobile Menu Button - Separated as its own div for better isolation */}
            <button 
              className="p-2 text-white focus:outline-none" 
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              onClick={toggleMobileMenu}
              type="button"
              id="mobile-menu-button"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <div 
            className={`absolute top-20 left-0 right-0 bg-[#091E42] shadow-lg md:hidden z-50 transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <div className="px-4 py-5 space-y-4">
              <Link
                href="/iso-certificering"
                className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                  pathname?.startsWith('/iso-certificering') ? 'text-[#FF8B00]' : 'text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                ISO-certificering
              </Link>
              <Link
                href="/informatiebeveiliging"
                className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                  pathname?.startsWith('/informatiebeveiliging') ? 'text-[#FF8B00]' : 'text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Informatiebeveiliging
              </Link>
              <Link
                href="/avg-wetgeving"
                className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                  pathname?.startsWith('/avg-wetgeving') ? 'text-[#FF8B00]' : 'text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                AVG & Wetgeving
              </Link>
              <Link
                href="/kennis"
                className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                  pathname?.startsWith('/kennis') ? 'text-[#FF8B00]' : 'text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Kennis
              </Link>
              <Link
                href="/waarom-maasiso"
                className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                  pathname === '/waarom-maasiso' ? 'text-[#FF8B00]' : 'text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Waarom MaasISO
              </Link>
              <Link
                href="/over-ons"
                className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                  pathname === '/over-ons' ? 'text-[#FF8B00]' : 'text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Over ons
              </Link>
              <Link
                href="/contact"
                className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${pathname === '/contact' ? 'text-[#FF8B00]' : 'text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* ISO Selector Mobile */}
              <div className="pt-4 mt-4 border-t border-gray-700">
                <Link
                  href="/iso-selector"
                  className="block text-center text-base font-medium text-white px-4 py-3 rounded-lg bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] hover:from-[#FF9B20] hover:to-[#FF7B10] transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ISO-Selector
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

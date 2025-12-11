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
  const [infoDropdownOpen, setInfoDropdownOpen] = useState(false);

  // Log state changes
  console.log('[Header] State:', {
    isHydrated,
    infoDropdownOpen,
    mobileMenuOpen
  });

  // Create stable callback function that won't be recreated on renders
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prevState) => !prevState);
  }, []);

  // Toggle info dropdown
  const toggleInfoDropdown = useCallback(() => {
    console.log('[Header] Toggling info dropdown:', {
      currentState: infoDropdownOpen,
      isHydrated: typeof window !== 'undefined',
      hasEventListener: document.getElementById('info-dropdown-button')?.hasAttribute('data-hydrated')
    });
    setInfoDropdownOpen((prevState) => !prevState);
  }, [infoDropdownOpen]);

  // Close menu only when navigating to a different page
  useEffect(() => {
    console.log('[Header] Route changed:', { pathname, dropdownState: infoDropdownOpen });
    if (pathname !== '/news' && pathname !== '/blog' && pathname !== '/whitepaper') {
      setMobileMenuOpen(false);
      setInfoDropdownOpen(false);
    }
  }, [pathname]);

  // Handle initial hydration
  useEffect(() => {
    const button = document.getElementById('info-dropdown-button');
    if (button) {
      button.setAttribute('data-hydrated', 'true');
    }

    if (!isHydrated) {
      setIsHydrated(true);
      console.log('[Header] Component hydrated:', {
        pathname,
        dropdownState: infoDropdownOpen,
        hasButton: !!button
      });

      // Only reset states if not on info pages and dropdown isn't open
      if (!infoDropdownOpen &&
          pathname !== '/news' &&
          pathname !== '/blog' &&
          pathname !== '/whitepaper') {
        setMobileMenuOpen(false);
        setInfoDropdownOpen(false);
      }
    }
  }, [isHydrated, infoDropdownOpen, pathname]);

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const dropdownButton = document.getElementById('info-dropdown-button');
      const dropdownMenu = document.getElementById('info-dropdown-menu');
      
      if (infoDropdownOpen && 
          dropdownButton && 
          dropdownMenu && 
          !dropdownButton.contains(event.target as Node) && 
          !dropdownMenu.contains(event.target as Node)) {
        setInfoDropdownOpen(false);
      }
    }

    // Add event listener when dropdown is open
    if (infoDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [infoDropdownOpen]);

  return (
    <header className="site-header">
      <nav className="container-custom relative">
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
            <div className="relative">
              <button 
                id="info-dropdown-button"
                onClick={toggleInfoDropdown}
                className={`text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                (pathname && (pathname === '/news' || pathname.startsWith('/blog'))) ? 'text-[#FF8B00]' : 'text-white'
              }`}>
                Informatie
              </button>
              <div 
                id="info-dropdown-menu"
                className={`absolute ${infoDropdownOpen ? 'block' : 'hidden'} bg-white min-w-[200px] rounded-md shadow-lg py-2 mt-2 right-0 z-50`}>
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

            {/* ISO Selector Button */}
            <a
              href="https://iso-selector.maasiso.nl/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-medium text-white px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] hover:from-[#FF9B20] hover:to-[#FF7B10] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              ISO-Selector
            </a>
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
                href="/diensten"
                className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                  pathname === '/diensten' ? 'text-[#FF8B00]' : 'text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Diensten
              </Link>
              <Link
                href="/onze-voordelen"
                className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                  pathname === '/onze-voordelen' ? 'text-[#FF8B00]' : 'text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Onze Voordelen
              </Link>
              <Link
                href="/over-ons"
                className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                  pathname === '/over-ons' ? 'text-[#FF8B00]' : 'text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Over Ons
              </Link>
              <Link
                href="/contact"
                className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${pathname === '/contact' ? 'text-[#FF8B00]' : 'text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-2 pb-1 border-t border-gray-700">
                <p className="text-white text-sm mb-2">Informatie</p>
                <div className="pl-2 space-y-3">
                  <Link
                    href="/news"
                    className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                      pathname === '/news' ? 'text-[#FF8B00]' : 'text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Nieuws
                  </Link>
                  <Link
                    href="/blog"
                    className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                      pathname === '/blog' ? 'text-[#FF8B00]' : 'text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Blog
                  </Link>
                  <Link
                    href="/whitepaper"
                    className={`block text-base hover:text-[#FF8B00] transition-colors duration-200 ${
                      pathname === '/whitepaper' ? 'text-[#FF8B00]' : 'text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Whitepapers
                  </Link>
                </div>
              </div>
              
              {/* ISO Selector Mobile */}
              <div className="pt-4 mt-4 border-t border-gray-700">
                <a
                  href="https://iso-selector.maasiso.nl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-base font-medium text-white px-4 py-3 rounded-lg bg-gradient-to-r from-[#FF8B00] to-[#FF6B00] hover:from-[#FF9B20] hover:to-[#FF7B10] transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ISO-Selector
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

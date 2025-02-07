"use client";

import { Menu, MenuItem } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface MobileNavigationMenuProps {
  menu: Menu;
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
}

export default function MobileNavigationMenu({
  menu,
  className = '',
  itemClassName = '',
  activeClassName = 'text-[#FF8B00]',
}: MobileNavigationMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
    // Reset expanded items when closing menu
    if (isOpen) {
      setExpandedItems(new Set());
    }
  }, [isOpen]);

  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isActive = pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isExternal = item.type === 'external';

    const itemClasses = cn(
      'transition-colors duration-200 w-full',
      itemClassName,
      item.settings.className,
      isActive && activeClassName,
      level > 0 && 'pl-4' // Indent nested items
    );

    if (hasChildren && item.children) {
      return (
        <div key={item.id} className="w-full">
          <button
            onClick={() => toggleExpanded(item.id)}
            className={cn(
              'flex items-center justify-between w-full px-4 py-2',
              itemClasses
            )}
            aria-expanded={isExpanded}
          >
            <span className="flex items-center">
              {item.settings.icon?.data?.attributes?.url && (
                <Image
                  src={item.settings.icon.data.attributes.url}
                  alt=""
                  width={16}
                  height={16}
                  className="mr-2"
                  aria-hidden="true"
                />
              )}
              {item.title}
            </span>
            <svg
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.path}
        className={cn('block px-4 py-2', itemClasses)}
        onClick={() => setIsOpen(false)} // Close menu when clicking a link
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {item.settings.icon?.data?.attributes?.url && (
          <Image
            src={item.settings.icon.data.attributes.url}
            alt=""
            width={16}
            height={16}
            className="mr-2 inline-block"
            aria-hidden="true"
          />
        )}
        {item.title}
      </Link>
    );
  };

  return (
    <div className={cn('lg:hidden', className)}>
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-600 hover:text-gray-900"
        aria-label="Toggle navigation menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile menu panel */}
      <div
        className={cn(
          'fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-black transition-opacity',
            isOpen ? 'opacity-50' : 'opacity-0'
          )}
          onClick={toggleMenu}
        />

        {/* Menu panel */}
        <nav className="relative w-4/5 max-w-sm h-full bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <span className="text-lg font-semibold">Menu</span>
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:text-gray-900"
              aria-label="Close navigation menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-4rem)]">
            <div className="py-4">
              {menu.items.map(item => renderMenuItem(item))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

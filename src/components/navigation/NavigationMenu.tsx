"use client";

import { Menu, MenuItem } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavigationMenuProps {
  menu: Menu;
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
  dropdownClassName?: string;
}

export default function NavigationMenu({
  menu,
  className = '',
  itemClassName = '',
  activeClassName = 'text-[#FF8B00]',
  dropdownClassName = '',
}: NavigationMenuProps) {
  const pathname = usePathname();

  const renderMenuItem = (item: MenuItem) => {
    const isActive = pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isExternal = item.type === 'external';

    // Base classes for menu items
    const itemClasses = cn(
      'transition-colors duration-200',
      itemClassName,
      item.settings.className,
      isActive && activeClassName,
      hasChildren && 'relative group'
    );

    // If the item has children, render a dropdown
    if (hasChildren && item.children) {
      return (
        <div key={item.id} className={itemClasses}>
          <button
            className="flex items-center space-x-1"
            aria-expanded="false"
            aria-haspopup="true"
            aria-label={`${item.title} dropdown menu`}
          >
            <span>{item.title}</span>
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
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
          <div 
            className={cn(
              'absolute left-0 z-10 hidden w-48 py-2 mt-2 bg-white rounded-md shadow-xl group-hover:block',
              dropdownClassName
            )}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
          >
            {item.children.map((child) => (
              <Link
                key={child.id}
                href={child.path}
                className={cn(
                  'block px-4 py-2 text-sm hover:bg-gray-100',
                  pathname === child.path && activeClassName
                )}
                {...(child.settings.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                role="menuitem"
              >
                {child.settings.icon?.data?.attributes?.url && (
                  <Image
                    src={child.settings.icon.data.attributes.url}
                    alt=""
                    width={16}
                    height={16}
                    className="mr-2 inline-block"
                    aria-hidden="true"
                  />
                )}
                {child.title}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    // For regular menu items
    const LinkComponent = (
      <Link
        href={item.path}
        className={itemClasses}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {item.settings.icon?.data?.attributes?.url && (
          <Image
            src={item.settings.icon.data.attributes.url}
            alt=""
            width={16}
            height={16}
            className="mr-2 inline-block"
          />
        )}
        {item.title}
      </Link>
    );

    // If the item is highlighted, wrap it in a highlight container
    if (item.settings.highlight) {
      return (
        <div key={item.id} className="relative inline-block">
          <div className="absolute inset-0 bg-[#FF8B00] opacity-10 rounded"></div>
          {LinkComponent}
        </div>
      );
    }

    return <div key={item.id}>{LinkComponent}</div>;
  };

  return (
    <nav className={cn('flex items-center', className)}>
      {menu.items.map(renderMenuItem)}
    </nav>
  );
}

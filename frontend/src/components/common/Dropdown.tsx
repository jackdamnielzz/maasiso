'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MenuItem } from '@/config/navigation';

interface DropdownProps {
  item: MenuItem;
}

export default function Dropdown({ item }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="text-white hover:text-[#FF8B00] text-[15px] font-medium tracking-wide transition-all duration-200 flex items-center gap-1.5 group py-2"
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {item.label}
        <svg
          className={`w-3.5 h-3.5 transform transition-transform duration-200 ease-out ${
            isOpen ? 'rotate-180' : ''
          } mt-[1px] opacity-75 group-hover:opacity-100`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`absolute left-0 mt-1 w-56 bg-[#0A1426] rounded shadow-xl py-2 z-50 border border-gray-800/50 transform transition-all duration-150 ease-out ${
          isOpen
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 -translate-y-1 invisible'
        }`}
        onMouseLeave={() => setIsOpen(false)}
      >
        {item.children?.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            className="block px-5 py-2.5 text-[14px] text-white/80 hover:text-[#FF8B00] hover:bg-white/[0.03] transition-all duration-200"
          >
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

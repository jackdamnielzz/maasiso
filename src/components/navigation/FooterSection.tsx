import React from 'react';
import Link from 'next/link';
import { FooterSectionProps } from '@/types/jsx';

const FooterSection: React.FC<FooterSectionProps> = ({ title, items }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link
                href={item.href}
                className="text-white/70 hover:text-[#FF8B00] transition-colors duration-200 text-sm"
              >
                {item.text}
              </Link>
            ) : (
              <span className="text-white/70 text-sm">{item.text}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterSection;

'use client';

import React, { useState } from 'react';

type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
  accentColor?: string;
  allowMultiple?: boolean;
};

/**
 * Accordion component creates an interactive accordion for FAQs
 * It supports expanding/collapsing items and custom styling
 */
const Accordion: React.FC<AccordionProps> = ({
  items,
  className = '',
  accentColor = '#00875A',
  allowMultiple = false
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      // Toggle the item in or out of the openItems array
      setOpenItems(prev => 
        prev.includes(id) 
          ? prev.filter(itemId => itemId !== id) 
          : [...prev, id]
      );
    } else {
      // If the item is already open, close it, otherwise open only this item
      setOpenItems(prev => 
        prev.includes(id) ? [] : [id]
      );
    }
  };

  const isOpen = (id: string) => openItems.includes(id);

  return (
    <div className={`w-full ${className}`} data-testid="accordion">
      <div className="space-y-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            <button
              className="w-full text-left p-5 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors duration-200"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen(item.id)}
              aria-controls={`accordion-content-${item.id}`}
            >
              <h3 className="text-lg font-medium text-gray-900">
                {item.question}
              </h3>
              <div 
                className="flex-shrink-0 ml-4 transition-transform duration-300"
                style={{ transform: isOpen(item.id) ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: accentColor }}
                >
                  <path 
                    d="M19 9L12 16L5 9" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            
            <div 
              id={`accordion-content-${item.id}`}
              className="overflow-hidden transition-all duration-300"
              style={{ 
                maxHeight: isOpen(item.id) ? '500px' : '0',
                opacity: isOpen(item.id) ? 1 : 0
              }}
              aria-hidden={!isOpen(item.id)}
            >
              <div className="p-5 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accordion;
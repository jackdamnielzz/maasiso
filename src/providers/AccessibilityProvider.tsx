import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  isKeyboardUser: boolean;
  focusVisible: boolean;
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<'polite' | 'assertive'>('polite');

  useEffect(() => {
    // Detect keyboard navigation
    const handleFirstTab = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardUser(true);
        setFocusVisible(true);
        window.removeEventListener('keydown', handleFirstTab);
      }
    };

    // Detect mouse use
    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      setFocusVisible(false);
    };

    window.addEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleFirstTab);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Handle focus ring visibility
  useEffect(() => {
    document.body.classList.toggle('keyboard-user', isKeyboardUser);
  }, [isKeyboardUser]);

  // Clear announcements after they're read
  useEffect(() => {
    if (announcement) {
      const timeoutId = setTimeout(() => {
        setAnnouncement('');
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [announcement]);

  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(message);
    setAnnouncementPriority(priority);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        isKeyboardUser,
        focusVisible,
        announceMessage,
      }}
    >
      {children}
      {/* Live region for screen reader announcements */}
      <div
        aria-live={announcementPriority}
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Add global styles for keyboard focus
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    /* Hide focus outline for mouse users */
    :focus:not(:focus-visible) {
      outline: none !important;
    }

    /* Show focus outline for keyboard users */
    .keyboard-user :focus,
    .keyboard-user :focus-visible {
      outline: 2px solid #FF8B00 !important;
      outline-offset: 2px !important;
    }

    /* Hide elements from screen readers */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;
  document.head.appendChild(style);
}
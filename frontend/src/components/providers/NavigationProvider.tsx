'use client';

import { Suspense, createContext, useContext } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface NavigationContextType {
  pathname: string | null;
  searchParams: URLSearchParams | null;
}

interface NavigationProviderProps {
  children: React.ReactNode;
}

const NavigationContext = createContext<NavigationContextType>({
  pathname: null,
  searchParams: null
});

function NavigationContent({ children }: NavigationProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <NavigationContext.Provider value={{ pathname, searchParams }}>
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </NavigationContext.Provider>
  );
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  return (
    <Suspense fallback={null}>
      <NavigationContent>
        {children}
      </NavigationContent>
    </Suspense>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
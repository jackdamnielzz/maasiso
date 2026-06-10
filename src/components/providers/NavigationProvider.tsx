'use client';

import { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';

// BELANGRIJK: geen useSearchParams in deze provider. Hij omhult de hele app
// vanuit de root-layout; useSearchParams op dit niveau dwong elke statische
// pagina naar volledige client-side rendering (BAILOUT_TO_CLIENT_SIDE_RENDERING),
// waardoor crawlers zonder JavaScript — alle AI-zoekmachines — een lege pagina
// zagen. Componenten die query-parameters nodig hebben roepen useSearchParams
// zelf aan, binnen een eigen <Suspense>-boundary.

interface NavigationContextType {
  pathname: string | null;
}

interface NavigationProviderProps {
  children: React.ReactNode;
}

const NavigationContext = createContext<NavigationContextType>({
  pathname: null,
});

export function NavigationProvider({ children }: NavigationProviderProps) {
  const pathname = usePathname();

  return (
    <NavigationContext.Provider value={{ pathname }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

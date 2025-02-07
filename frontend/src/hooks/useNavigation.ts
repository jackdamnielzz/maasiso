import { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  title: string;
  path: string;
  parent?: {
    id: string;
  };
}

interface Menu {
  items: MenuItem[];
}

interface NavigationHookResult {
  menu: Menu | null;
  isLoading: boolean;
  error: Error | null;
}

export function useNavigation(menuType: 'footer' | 'legal' | 'social'): NavigationHookResult {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      try {
        // Simulated menu data - replace with actual API call
        const mockMenus: Record<string, Menu> = {
          footer: {
            items: [
              {
                id: '1',
                title: 'About',
                path: '/about',
              },
              {
                id: '2',
                title: 'Services',
                path: '/services',
                parent: { id: '1' },
              },
            ],
          },
          legal: {
            items: [
              {
                id: '3',
                title: 'Privacy Policy',
                path: '/privacy',
              },
              {
                id: '4',
                title: 'Terms of Service',
                path: '/terms',
              },
            ],
          },
          social: {
            items: [
              {
                id: '5',
                title: 'LinkedIn',
                path: 'https://linkedin.com',
              },
              {
                id: '6',
                title: 'Twitter',
                path: 'https://twitter.com',
              },
            ],
          },
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setMenu(mockMenus[menuType]);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch menu'));
        setIsLoading(false);
      }
    }

    fetchMenu();
  }, [menuType]);

  return { menu, isLoading, error };
}

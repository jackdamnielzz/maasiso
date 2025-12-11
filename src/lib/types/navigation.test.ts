import { normalizeMenu, normalizeMenuItem, normalizeMenuSection, normalizeMenuPosition, normalizeMenuItemSettings, normalizeSocialLink } from '../normalizers';
import { Menu, MenuItem, MenuSection, MenuPosition, MenuItemSettings, SocialLink } from '../types';

describe('Navigation Normalizers', () => {
  const mockDate = '2024-01-26T20:30:00.000Z';

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(mockDate));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('normalizeMenuPosition', () => {
    it('should normalize a complete menu position', () => {
      const input = {
        location: 'header' as const,
        order: 1,
        style: 'horizontal' as const,
        className: 'custom-menu'
      };

      const result = normalizeMenuPosition(input);

      expect(result).toEqual({
        location: 'header',
        order: 1,
        style: 'horizontal',
        className: 'custom-menu'
      });
    });

    it('should handle undefined optional fields', () => {
      const input = {
        location: 'footer' as const,
        order: 2,
        style: 'vertical' as const
      };

      const result = normalizeMenuPosition(input);

      expect(result.className).toBeUndefined();
    });
  });

  describe('normalizeMenuItemSettings', () => {
    it('should normalize complete menu item settings', () => {
      const input = {
        order: 1,
        icon: {
          data: {
            id: 'icon1',
            attributes: {
              url: 'https://example.com/icon.png',
              width: 24,
              height: 24
            }
          }
        },
        openInNewTab: true,
        highlight: true,
        className: 'custom-item'
      };

      const result = normalizeMenuItemSettings(input);

      expect(result).toEqual({
        order: 1,
        icon: {
          data: {
            id: 'icon1',
            attributes: {
              url: 'https://example.com/icon.png',
              width: 24,
              height: 24
            }
          }
        },
        openInNewTab: true,
        highlight: true,
        className: 'custom-item'
      });
    });

    it('should handle missing icon', () => {
      const input = {
        order: 1,
        openInNewTab: false,
        highlight: false
      };

      const result = normalizeMenuItemSettings(input);

      expect(result.icon).toBeUndefined();
      expect(result.className).toBeUndefined();
    });
  });

  describe('normalizeMenuItem', () => {
    it('should normalize a complete menu item', () => {
      const input = {
        id: 'item1',
        attributes: {
          title: 'Home',
          type: 'internal' as const,
          path: '/',
          menu: {
            data: {
              id: 'menu1',
              attributes: {
                title: 'Main Menu',
                handle: 'main',
                type: 'main' as const,
                position: {
                  location: 'header' as const,
                  order: 1,
                  style: 'horizontal' as const
                },
                items: { data: [] }
              }
            }
          },
          settings: {
            order: 1,
            openInNewTab: false,
            highlight: false
          }
        }
      };

      const result = normalizeMenuItem(input);

      expect(result).toEqual({
        id: 'item1',
        title: 'Home',
        type: 'internal',
        path: '/',
        menu: {
          id: 'menu1',
          title: 'Main Menu',
          handle: 'main',
          type: 'main',
          position: {
                  location: 'header' as const,
                  order: 1,
                  style: 'horizontal' as const
          },
          items: []
        },
        settings: {
          order: 1,
          openInNewTab: false,
          highlight: false
        }
      });
    });

    it('should handle numeric ids', () => {
      const input = {
        id: 123 as any,
        attributes: {
          title: 'Home',
          type: 'internal' as const,
          path: '/',
          menu: {
            data: {
              id: 456 as any,
              attributes: {
                title: 'Main Menu',
                handle: 'main',
                type: 'main' as const,
          position: {
            location: 'header' as const,
            order: 1,
            style: 'horizontal' as const
          },
                items: { data: [] }
              }
            }
          },
          settings: {
            order: 1,
            openInNewTab: false,
            highlight: false
          }
        }
      };

      const result = normalizeMenuItem(input);

      expect(typeof result.id).toBe('string');
      expect(result.id).toBe('123');
      expect(result.menu).toBeDefined();
      expect(typeof result.menu?.id).toBe('string');
      expect(result.menu?.id).toBe('456');
    });
  });

  describe('normalizeMenu', () => {
    // Helper to create a self-referential menu structure
    const createMenuInput = (menuId: string, items: Array<{ id: string; title: string; path: string }> = []) => {
      const menuInput = {
        id: menuId,
        attributes: {
          title: 'Main Menu',
          handle: 'main',
          type: 'main' as const,
          position: {
            location: 'header' as const,
            order: 1,
            style: 'horizontal' as const
          },
          items: {
            data: items.map(item => ({
              id: item.id,
              attributes: {
                title: item.title,
                type: 'internal' as const,
                path: item.path,
                menu: {
                  data: {
                    id: menuId,
                    attributes: {
                      title: 'Main Menu',
                      handle: 'main',
                      type: 'main' as const,
                      position: {
                        location: 'header' as const,
                        order: 1,
                        style: 'horizontal' as const
                      },
                      items: { data: [] }
                    }
                  }
                },
                settings: {
                  order: 1,
                  openInNewTab: false,
                  highlight: false
                }
              }
            }))
          }
        }
      };
      return menuInput;
    };

    it('should normalize a complete menu', () => {
      const input = createMenuInput('menu1', [
        { id: 'item1', title: 'Home', path: '/' }
      ]);

      const result = normalizeMenu(input);

      expect(result).toEqual({
        id: 'menu1',
        title: 'Main Menu',
        handle: 'main',
        type: 'main',
        position: {
            location: 'header' as const,
            order: 1,
            style: 'horizontal' as const
        },
        items: [
          {
            id: 'item1',
            title: 'Home',
            type: 'internal',
            path: '/',
            menu: result, // Circular reference is expected
            settings: {
              order: 1,
              openInNewTab: false,
              highlight: false
            }
          }
        ]
      });
    });

    it('should handle empty items array', () => {
      const input = createMenuInput('menu1');

      const result = normalizeMenu(input);

      expect(result.items).toEqual([]);
    });
  });

  describe('normalizeSocialLink', () => {
    it('should normalize a complete social link', () => {
      const input = {
        id: 'social1',
        attributes: {
          platform: 'twitter',
          url: 'https://twitter.com/example',
          icon: {
            data: {
              id: 'icon1',
              attributes: {
                url: 'https://example.com/twitter.png',
                width: 24,
                height: 24
              }
            }
          },
          order: 1
        }
      };

      const result = normalizeSocialLink(input);

      expect(result).toEqual({
        id: 'social1',
        platform: 'twitter',
        url: 'https://twitter.com/example',
        icon: {
          data: {
            id: 'icon1',
            attributes: {
              url: 'https://example.com/twitter.png',
              width: 24,
              height: 24
            }
          }
        },
        order: 1
      });
    });

    it('should handle missing icon', () => {
      const input = {
        id: 'social1',
        attributes: {
          platform: 'twitter',
          url: 'https://twitter.com/example',
          order: 1
        }
      };

      const result = normalizeSocialLink(input);

      expect(result.icon).toBeUndefined();
    });

    it('should handle numeric id', () => {
      const input = {
        id: 123 as any,
        attributes: {
          platform: 'twitter',
          url: 'https://twitter.com/example',
          order: 1
        }
      };

      const result = normalizeSocialLink(input);

      expect(typeof result.id).toBe('string');
      expect(result.id).toBe('123');
    });
  });
});

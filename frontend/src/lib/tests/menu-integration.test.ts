import { describe, it, expect } from 'vitest';
import {
  MenuItem,
  MenuItemSettings,
  MenuPosition,
  MenuItemType,
  convertAndValidateMenuItem,
  convertAndValidateMenu,
  validateStrapiMenuItemAttributes,
  validateStrapiMenuAttributes,
  isMenuItemType,
  isMenuPosition,
  isMenuType,
  isMenuItem,
  isMenu
} from '../types/menu';
import type { StrapiMenuItem, StrapiMenu } from '../types/api';

describe('Menu System Type Tests', () => {
  describe('Type Guards', () => {
    it('should validate MenuItemType', () => {
      expect(isMenuItemType(MenuItemType.LINK)).toBe(true);
      expect(isMenuItemType('invalid')).toBe(false);
    });

    it('should validate MenuPosition', () => {
      expect(isMenuPosition(MenuPosition.HEADER)).toBe(true);
      expect(isMenuPosition('invalid')).toBe(false);
    });

    it('should validate MenuType', () => {
      expect(isMenuType('header')).toBe(true);
      expect(isMenuType('invalid')).toBe(false);
    });
  });

  describe('Menu Item Validation and Conversion', () => {
    const mockStrapiMenuItem: StrapiMenuItem = {
      id: 1,
      label: 'Home',
      url: '/home',
      order: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      openInNewTab: false,
      highlight: false,
      menu: {
        data: {
          id: 1,
          attributes: {
            handle: 'main-menu',
            title: 'Main Menu',
            position: 'header',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01'
          }
        }
      }
    };

    it('should validate valid Strapi menu item attributes', () => {
      expect(validateStrapiMenuItemAttributes(mockStrapiMenuItem)).toBe(true);
    });

    it('should convert valid Strapi menu item', () => {
      const result = convertAndValidateMenuItem(1, mockStrapiMenuItem);
      expect(result).toBeDefined();
      expect(result.title).toBe('Home');
      expect(result.path).toBe('/home');
      expect(result.type).toBe(MenuItemType.LINK);
    });

    it('should reject invalid Strapi menu item attributes', () => {
      const invalidAttributes = {
        // Missing required fields
        url: '/home',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      expect(validateStrapiMenuItemAttributes(invalidAttributes)).toBe(false);
      expect(() => convertAndValidateMenuItem(1, invalidAttributes)).toThrow();
    });
  });

  describe('Menu Validation and Conversion', () => {
    const mockStrapiMenu: StrapiMenu = {
      handle: 'main-menu',
      title: 'Main Menu',
      position: 'header',
      type: 'header',
      items: {
        data: [{
          id: 1,
          attributes: {
            id: 1,
            label: 'Home',
            url: '/home',
            order: 1,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
            openInNewTab: false,
            highlight: false
          }
        }]
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    };

    it('should validate valid Strapi menu attributes', () => {
      expect(validateStrapiMenuAttributes(mockStrapiMenu)).toBe(true);
    });

    it('should convert valid Strapi menu', () => {
      const result = convertAndValidateMenu(1, mockStrapiMenu);
      expect(result).toBeDefined();
      expect(result.handle).toBe('main-menu');
      expect(result.title).toBe('Main Menu');
      expect(result.position).toBe('header');
      expect(result.type).toBe('header');
    });

    it('should reject invalid Strapi menu attributes', () => {
      const invalidAttributes = {
        // Missing required fields
        title: 'Main Menu',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      expect(validateStrapiMenuAttributes(invalidAttributes)).toBe(false);
      expect(() => convertAndValidateMenu(1, invalidAttributes)).toThrow();
    });
  });

  describe('Complex Menu Structures', () => {
    it('should handle nested menu items', () => {
      const mockNestedStrapiMenu: StrapiMenu = {
        handle: 'main-menu',
        title: 'Main Menu',
        position: 'header',
        type: 'header',
        items: {
          data: [{
            id: 1,
            attributes: {
              id: 1,
              label: 'Parent',
              url: '/parent',
              order: 1,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
              openInNewTab: false,
              highlight: false,
              children: {
                data: [{
                  id: 2,
                  attributes: {
                    id: 2,
                    label: 'Child',
                    url: '/child',
                    order: 1,
                    createdAt: '2024-01-01',
                    updatedAt: '2024-01-01',
                    openInNewTab: false,
                    highlight: false
                  }
                }]
              }
            }
          }]
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };

      const result = convertAndValidateMenu(1, mockNestedStrapiMenu);
      expect(result.items[0].children).toBeDefined();
      expect(result.items[0].children?.[0].title).toBe('Child');
    });

    it('should handle menu items with all optional fields', () => {
      const mockMenuItemWithOptionals: StrapiMenuItem = {
        id: 1,
        label: 'Settings',
        url: '/settings',
        order: 1,
        icon: 'gear-icon',
        openInNewTab: true,
        highlight: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        publishedAt: '2024-01-01',
        menu: {
          data: {
            id: 1,
            attributes: {
              handle: 'main-menu',
              title: 'Main Menu',
              position: 'header',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
              publishedAt: '2024-01-01'
            }
          }
        }
      };

      const result = convertAndValidateMenuItem(1, mockMenuItemWithOptionals);
      expect(result.icon).toBe('gear-icon');
      expect(result.settings.openInNewTab).toBe(true);
      expect(result.settings.highlight).toBe(true);
      expect(result.publishedAt).toBe('2024-01-01');
    });
  });
});

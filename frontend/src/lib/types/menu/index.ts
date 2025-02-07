// Re-export everything from types
export * from './types';
import type { Menu, MenuItem } from './types';
import { validateStrapiMenuAttributes, validateStrapiMenuItemAttributes } from './validators';
import { convertStrapiMenu, convertStrapiMenuItem } from './converters';

// Re-export converters
export {
  convertStrapiMenuItem,
  convertStrapiMenu,
  validateMenuPosition,
  validateMenuType
} from './converters';

// Re-export validators
export {
  isMenuItemType,
  isMenuPosition,
  isMenuType,
  isMenuItemSettings,
  isMenuItem,
  isMenu,
  validateStrapiMenuItemAttributes,
  validateStrapiMenuAttributes
} from './validators';

// Export a convenience function that combines validation and conversion
export function convertAndValidateMenu(id: number, attributes: unknown): Menu {
  if (!validateStrapiMenuAttributes(attributes)) {
    throw new Error('Invalid Strapi menu attributes');
  }
  return convertStrapiMenu(id, attributes);
}

export function convertAndValidateMenuItem(id: number, attributes: unknown, parentMenu?: Menu): MenuItem {
  if (!validateStrapiMenuItemAttributes(attributes)) {
    throw new Error('Invalid Strapi menu item attributes');
  }
  return convertStrapiMenuItem(id, attributes, parentMenu);
}

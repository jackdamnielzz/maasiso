import {
  MenuItemType,
  MenuPosition,
  MenuType,
  MenuItem,
  Menu,
  MenuItemSettings,
  StrapiMenuItemAttributes,
  StrapiMenuAttributes
} from './types';

/**
 * Type guard for MenuItemType
 */
export function isMenuItemType(value: unknown): value is MenuItemType {
  return typeof value === 'string' && Object.values(MenuItemType).includes(value as MenuItemType);
}

/**
 * Type guard for MenuPosition
 */
export function isMenuPosition(value: unknown): value is MenuPosition {
  return typeof value === 'string' && Object.values(MenuPosition).includes(value as MenuPosition);
}

/**
 * Type guard for MenuType
 */
export function isMenuType(value: unknown): value is MenuType {
  return typeof value === 'string' && ['header', 'footer', 'sidebar'].includes(value);
}

/**
 * Type guard for MenuItemSettings
 */
export function isMenuItemSettings(value: unknown): value is MenuItemSettings {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const settings = value as Record<string, unknown>;
  
  // Check required properties
  if (typeof settings.order !== 'number') {
    return false;
  }

  // Check optional properties if they exist
  if ('icon' in settings && typeof settings.icon !== 'string' && settings.icon !== undefined) {
    return false;
  }
  if ('openInNewTab' in settings && typeof settings.openInNewTab !== 'boolean' && settings.openInNewTab !== undefined) {
    return false;
  }
  if ('highlight' in settings && typeof settings.highlight !== 'boolean' && settings.highlight !== undefined) {
    return false;
  }

  return true;
}

/**
 * Type guard for MenuItem
 */
export function isMenuItem(value: unknown): value is MenuItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  // Check required properties
  if (typeof item.id !== 'string' ||
      typeof item.title !== 'string' ||
      !isMenuItemType(item.type) ||
      typeof item.path !== 'string' ||
      typeof item.menuHandle !== 'string' ||
      !isMenu(item.menu) ||
      !isMenuItemSettings(item.settings) ||
      typeof item.label !== 'string' ||
      typeof item.url !== 'string' ||
      typeof item.order !== 'number' ||
      typeof item.createdAt !== 'string' ||
      typeof item.updatedAt !== 'string') {
    return false;
  }

  // Check optional properties
  if ('icon' in item && typeof item.icon !== 'string' && item.icon !== undefined) {
    return false;
  }
  if ('publishedAt' in item && typeof item.publishedAt !== 'string' && item.publishedAt !== undefined) {
    return false;
  }
  if ('children' in item) {
    if (!Array.isArray(item.children)) {
      return false;
    }
    if (!item.children.every(isMenuItem)) {
      return false;
    }
  }

  return true;
}

/**
 * Type guard for Menu
 */
export function isMenu(value: unknown): value is Menu {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const menu = value as Record<string, unknown>;

  // Check required properties
  if (typeof menu.id !== 'string' ||
      typeof menu.handle !== 'string' ||
      typeof menu.title !== 'string' ||
      !isMenuPosition(menu.position) ||
      !isMenuType(menu.type) ||
      !Array.isArray(menu.items) ||
      !menu.items.every(isMenuItem) ||
      typeof menu.createdAt !== 'string' ||
      typeof menu.updatedAt !== 'string') {
    return false;
  }

  // Check optional properties
  if ('publishedAt' in menu && typeof menu.publishedAt !== 'string' && menu.publishedAt !== undefined) {
    return false;
  }
  if ('style' in menu && typeof menu.style !== 'string' && menu.style !== undefined) {
    return false;
  }
  if ('className' in menu && typeof menu.className !== 'string' && menu.className !== undefined) {
    return false;
  }

  return true;
}

/**
 * Validates Strapi menu item attributes
 */
export function validateStrapiMenuItemAttributes(attributes: unknown): attributes is StrapiMenuItemAttributes {
  if (typeof attributes !== 'object' || attributes === null) {
    return false;
  }

  const attrs = attributes as Record<string, unknown>;

  // Check required properties
  if (typeof attrs.label !== 'string' ||
      typeof attrs.url !== 'string' ||
      typeof attrs.order !== 'number' ||
      typeof attrs.createdAt !== 'string' ||
      typeof attrs.updatedAt !== 'string') {
    return false;
  }

  // Check optional properties
  if ('icon' in attrs && typeof attrs.icon !== 'string' && attrs.icon !== undefined) {
    return false;
  }
  if ('openInNewTab' in attrs && typeof attrs.openInNewTab !== 'boolean' && attrs.openInNewTab !== undefined) {
    return false;
  }
  if ('highlight' in attrs && typeof attrs.highlight !== 'boolean' && attrs.highlight !== undefined) {
    return false;
  }
  if ('publishedAt' in attrs && typeof attrs.publishedAt !== 'string' && attrs.publishedAt !== undefined) {
    return false;
  }

  return true;
}

/**
 * Validates Strapi menu attributes
 */
export function validateStrapiMenuAttributes(attributes: unknown): attributes is StrapiMenuAttributes {
  if (typeof attributes !== 'object' || attributes === null) {
    return false;
  }

  const attrs = attributes as Record<string, unknown>;

  // Check required properties
  if (typeof attrs.handle !== 'string' ||
      typeof attrs.title !== 'string' ||
      !isMenuPosition(attrs.position) ||
      !isMenuType(attrs.type) ||
      typeof attrs.createdAt !== 'string' ||
      typeof attrs.updatedAt !== 'string') {
    return false;
  }

  // Check optional properties
  if ('publishedAt' in attrs && typeof attrs.publishedAt !== 'string' && attrs.publishedAt !== undefined) {
    return false;
  }

  // Check items structure
  if (!('items' in attrs) || 
      typeof attrs.items !== 'object' || 
      attrs.items === null ||
      !('data' in attrs.items) || 
      !Array.isArray(attrs.items.data)) {
    return false;
  }

  return true;
}

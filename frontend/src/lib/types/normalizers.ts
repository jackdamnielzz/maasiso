import type { MenuItem, MenuItemSettings, Menu } from './index';
import { MenuPosition, MenuItemType, isValidMenuPosition } from './index';
import type { StrapiMenuItem } from './api';
import type { StrapiMenuAttributes } from './menu/types';

/**
 * Normalizes and validates a menu position object
 * @param position - The raw position value
 * @returns Normalized and validated MenuPosition
 * @throws Error if position is invalid
 */
export function normalizeMenuPosition(position: unknown): MenuPosition {
  if (!isValidMenuPosition(position)) {
    throw new Error('Invalid menu position');
  }
  return position as MenuPosition;
}

/**
 * Normalizes a Strapi menu item to our frontend MenuItem type
 * @param item - The raw Strapi menu item
 * @returns Normalized MenuItem
 * @throws Error if required fields are missing
 */
export function normalizeMenuItem(item: StrapiMenuItem): MenuItem {
  if (!item.label || !item.url) {
    throw new Error('Invalid menu item: missing required fields');
  }

  const menuData = item.menu?.data?.attributes as StrapiMenuAttributes | undefined;
  const menu: Menu = {
    id: item.menu?.data?.id.toString() || '0',
    handle: menuData?.handle || 'default',
    title: menuData?.title || 'Default Menu',
    position: normalizeMenuPosition(menuData?.position || 'header'),
    type: menuData?.type || 'header',
    items: [],
    createdAt: menuData?.createdAt || item.createdAt,
    updatedAt: menuData?.updatedAt || item.updatedAt,
    publishedAt: menuData?.publishedAt
  };

  const normalizedItem: MenuItem = {
    id: item.id.toString(),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    title: item.label,
    path: item.url,
    type: MenuItemType.LINK,
    menuHandle: menu.handle,
    menu,
    settings: {
      openInNewTab: item.openInNewTab || false,
      highlight: item.highlight || false,
      order: item.order || 0
    } as MenuItemSettings,
    label: item.label,
    url: item.url,
    icon: item.icon,
    order: item.order,
    children: item.children?.data?.map(child => normalizeMenuItem(child.attributes))
  };

  return normalizedItem;
}

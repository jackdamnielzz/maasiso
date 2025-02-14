import {
  MenuItemType,
  MenuPosition
} from './types';

import type {
  StrapiMenuItemAttributes,
  StrapiMenuAttributes,
  MenuItem,
  Menu,
  MenuItemSettings,
  MenuType
} from './types';

/**
 * Converts a Strapi menu item to our frontend MenuItem type
 * @param id - The ID of the menu item
 * @param attributes - The Strapi menu item attributes
 * @param parentMenu - The parent menu object (optional)
 * @returns Converted MenuItem
 */
export function convertStrapiMenuItem(
  id: number,
  attributes: StrapiMenuItemAttributes,
  parentMenu?: Menu
): MenuItem {
  const settings: MenuItemSettings = {
    order: attributes.order,
    openInNewTab: attributes.openInNewTab || false,
    highlight: attributes.highlight || false,
    icon: attributes.icon
  };

  const menuItem: MenuItem = {
    id: id.toString(),
    title: attributes.label,
    type: MenuItemType.LINK, // Default to LINK type
    path: attributes.url,
    menuHandle: parentMenu?.handle || attributes.menu?.data?.attributes?.handle || '',
    menu: parentMenu || {
      id: attributes.menu?.data?.id.toString() || '',
      handle: attributes.menu?.data?.attributes?.handle || '',
      title: attributes.menu?.data?.attributes?.title || '',
      position: attributes.menu?.data?.attributes?.position || MenuPosition.HEADER,
      type: (attributes.menu?.data?.attributes?.type || 'header') as MenuType,
      items: [],
      createdAt: attributes.menu?.data?.attributes?.createdAt || attributes.createdAt,
      updatedAt: attributes.menu?.data?.attributes?.updatedAt || attributes.updatedAt,
      publishedAt: attributes.menu?.data?.attributes?.publishedAt
    },
    settings,
    label: attributes.label,
    url: attributes.url,
    icon: attributes.icon,
    order: attributes.order,
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
    publishedAt: attributes.publishedAt,
    children: attributes.children?.data.map(child => 
      convertStrapiMenuItem(child.id, child.attributes, parentMenu)
    )
  };

  return menuItem;
}

/**
 * Converts a Strapi menu to our frontend Menu type
 * @param id - The ID of the menu
 * @param attributes - The Strapi menu attributes
 * @returns Converted Menu
 */
export function convertStrapiMenu(
  id: number,
  attributes: StrapiMenuAttributes
): Menu {
  const menu: Menu = {
    id: id.toString(),
    handle: attributes.handle,
    title: attributes.title,
    position: attributes.position,
    type: attributes.type,
    items: [],
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
    publishedAt: attributes.publishedAt
  };

  // Convert menu items after menu object is created so they can reference their parent
  menu.items = attributes.items.data.map(item =>
    convertStrapiMenuItem(item.id, item.attributes, menu)
  );

  return menu;
}

/**
 * Validates and ensures menu position is one of the allowed values
 * @param position - The position string to validate
 * @returns MenuPosition enum value
 */
export function validateMenuPosition(position: string): MenuPosition {
  const normalizedPosition = position.toLowerCase();
  switch (normalizedPosition) {
    case 'header':
      return MenuPosition.HEADER;
    case 'footer':
      return MenuPosition.FOOTER;
    case 'sidebar':
      return MenuPosition.SIDEBAR;
    default:
      throw new Error(`Invalid menu position: ${position}`);
  }
}

/**
 * Validates and ensures menu type is one of the allowed values
 * @param type - The type string to validate
 * @returns MenuType
 */
export function validateMenuType(type: string): MenuType {
  const normalizedType = type.toLowerCase();
  if (['header', 'footer', 'sidebar'].includes(normalizedType)) {
    return normalizedType as MenuType;
  }
  throw new Error(`Invalid menu type: ${type}`);
}

import type { BaseModel } from '../index';

// Menu Position Types
export enum MenuPosition {
  HEADER = 'header',
  FOOTER = 'footer',
  SIDEBAR = 'sidebar'
}

export enum MenuItemType {
  LINK = 'link',
  BUTTON = 'button',
  DROPDOWN = 'dropdown',
  PAGE = 'page'
}

export type MenuType = 'header' | 'footer' | 'sidebar';

// Strapi API Types
export interface StrapiMenuItemAttributes {
  label: string;
  url: string;
  icon?: string;
  order: number;
  openInNewTab?: boolean;
  highlight?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  menu?: {
    data: {
      id: number;
      attributes: StrapiMenuAttributes;
    };
  };
  children?: {
    data: Array<{
      id: number;
      attributes: StrapiMenuItemAttributes;
    }>;
  };
}

export interface StrapiMenuAttributes {
  handle: string;
  title: string;
  position: MenuPosition;
  type: MenuType;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  items: {
    data: Array<{
      id: number;
      attributes: StrapiMenuItemAttributes;
    }>;
  };
}

// Frontend Types
export interface MenuItemSettings {
  icon?: string;
  order: number;
  openInNewTab?: boolean;
  highlight?: boolean;
  [key: string]: unknown;
}

export interface MenuItem extends BaseModel {
  title: string;
  type: MenuItemType;
  path: string;
  menuHandle: string;
  menu: Menu;
  settings: MenuItemSettings;
  label: string;
  url: string;
  icon?: string;
  order: number;
  children?: MenuItem[];
}

export interface Menu extends BaseModel {
  handle: string;
  title: string;
  position: MenuPosition;
  type: MenuType;
  items: MenuItem[];
  style?: string;
  className?: string;
}

// Type Guards
export function isValidMenuPosition(position: unknown): position is MenuPosition {
  return typeof position === 'string' && Object.values(MenuPosition).includes(position as MenuPosition);
}

export function isValidMenuType(type: unknown): type is MenuType {
  return typeof type === 'string' && ['header', 'footer', 'sidebar'].includes(type);
}

export function isValidMenuItemType(type: unknown): type is MenuItemType {
  return typeof type === 'string' && Object.values(MenuItemType).includes(type as MenuItemType);
}

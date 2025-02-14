import { PageComponent } from '../types';

export interface ButtonComponent extends PageComponent {
  __component: 'page-blocks.button';
  text: string;
  link: string;
  style: 'primary' | 'secondary';
}

export interface StrapiRawButtonComponent {
  id: string;
  __component: 'page-blocks.button';
  text: string;
  link: string;
  style: 'primary' | 'secondary';
}
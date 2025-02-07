import React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

// Component Props Types
export interface ComponentRegistryProps {
  component: any
  className?: string
}

export interface FooterSectionProps {
  title: string;
  items: Array<{
    text: string;
    href?: string;
  }>;
}

export interface FooterMenuItem {
  text: string;
  href?: string;
}

export interface HeroComponent {
  type: 'hero'
  title: string
  subtitle?: string
  image?: string
}

export interface TextBlockComponent {
  type: 'text-block'
  content: string
}

export interface ImageGalleryComponent {
  type: 'image-gallery'
  images: string[]
}

export interface FeatureGridComponent {
  type: 'feature-grid'
  features: Array<{
    title: string
    description: string
    icon?: string
  }>
}

import { 
  RawStrapiComponent,
  RawHeroComponent,
  RawTextBlockComponent,
  RawButtonComponent,
  RawGalleryComponent,
  RawFeatureGridComponent
} from '../types';
import { mapImage } from './image';

export function validatePageComponent(component: RawStrapiComponent, index: number): boolean {
  if (!component || !component.__component) {
    console.warn(`[API Validation] Invalid component at index ${index}: Missing __component property`);
    return false;
  }

  let isValid = true;
  const componentType = component.__component.split('.')[1];
  
  switch (componentType) {
    case 'hero':
      const heroComponent = component as RawHeroComponent;
      if (!heroComponent.title) {
        console.warn(`[API Validation] Hero component missing title at index ${index}`);
        isValid = false;
      }
      if (heroComponent.ctaButton && (!heroComponent.ctaButton.text || !heroComponent.ctaButton.link)) {
        console.warn(`[API Validation] Hero component has incomplete ctaButton at index ${index}`);
        isValid = false;
      }
      break;
      
    case 'feature-grid':
      console.log('[API Validation] Feature grid component found, considering valid for frontend fallback rendering');
      return true;
      
    case 'text-block':
      const textBlockComponent = component as RawTextBlockComponent;
      if (!textBlockComponent.content) {
        console.warn(`[API Validation] Text block missing content at index ${index}`);
        isValid = false;
      }
      break;
      
    case 'button':
      const buttonComponent = component as RawButtonComponent;
      if (!buttonComponent.text || !buttonComponent.link) {
        console.warn(`[API Validation] Button component missing text or link at index ${index}`);
        isValid = false;
      }
      break;
      
    case 'gallery':
      const galleryComponent = component as RawGalleryComponent;
      if (!galleryComponent.images?.data || galleryComponent.images.data.length === 0) {
        console.warn(`[API Validation] Gallery component missing images at index ${index}`);
        isValid = false;
      }
      break;
  }
  
  return isValid;
}

export function mapComponent(component: RawStrapiComponent) {
  const baseComponent = {
    id: component.id,
    __component: component.__component
  };

  switch (component.__component) {
    case 'page-blocks.hero':
      const heroComponent = component as RawHeroComponent;
      return {
        ...baseComponent,
        title: heroComponent.title || '',
        subtitle: heroComponent.subtitle || '',
        backgroundImage: heroComponent.backgroundImage ? mapImage(heroComponent.backgroundImage) : undefined,
        ctaButton: heroComponent.ctaButton
      };

    case 'page-blocks.text-block':
      const textBlockComponent = component as RawTextBlockComponent;
      return {
        ...baseComponent,
        content: textBlockComponent.content || '',
        alignment: textBlockComponent.alignment || 'left'
      };

    case 'page-blocks.gallery':
      const galleryComponent = component as RawGalleryComponent;
      return {
        ...baseComponent,
        images: galleryComponent.images?.data?.map(img => mapImage(img)).filter(Boolean) || [],
        layout: galleryComponent.layout || 'grid'
      };

    case 'page-blocks.feature-grid':
      const featureGridComponent = component as RawFeatureGridComponent;
      console.log('Feature grid component found:', {
        id: featureGridComponent.id,
        hasFeatures: Array.isArray(featureGridComponent.features),
        featureCount: featureGridComponent.features?.length || 0,
        firstFeature: featureGridComponent.features?.[0]
      });
      
      return {
        ...baseComponent,
        features: Array.isArray(featureGridComponent.features) ? featureGridComponent.features.map(feature => ({
          id: String(feature.id),
          title: feature.title || '',
          description: feature.description || '',
          link: feature.link || null,
          icon: feature.icon ? mapImage(feature.icon) : undefined
        })) : []
      };

    case 'page-blocks.button':
      const buttonComponent = component as RawButtonComponent;
      return {
        ...baseComponent,
        text: buttonComponent.text || '',
        link: buttonComponent.link || '',
        style: buttonComponent.style || 'primary'
      };

    default:
      return baseComponent;
  }
}
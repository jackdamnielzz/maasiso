"use client";

import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { 
  HeroComponent as HeroComponentType,
  TextBlockComponent,
  ImageGalleryComponent,
  FeatureGridComponent,
  ButtonComponent
} from '@/lib/types';
import { ImageGallerySkeleton } from './ImageGallerySkeleton';
import { HeroComponentSkeleton } from './HeroComponentSkeleton';
import { TextBlockSkeleton } from './TextBlockSkeleton';
import { FeatureGridSkeleton } from './FeatureGridSkeleton';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { monitoringService } from '@/lib/monitoring/service';

// Base component type that all components extend
interface BaseComponent {
  id: string;
  __component: string;
}

type UnknownComponent = BaseComponent & {
  [key: string]: unknown;
};

// Type guard to check if a component is a BaseComponent
function isBaseComponent(component: unknown): component is BaseComponent {
  return (
    typeof component === 'object' &&
    component !== null &&
    'id' in component &&
    '__component' in component &&
    typeof (component as any).__component === 'string'
  );
}

// Error handler for components
const handleComponentError = (componentName: string, componentType: string) => (error: Error, errorInfo: React.ErrorInfo) => {
  monitoringService.trackError(error, {
    componentStack: errorInfo.componentStack || undefined,
    componentType,
    errorMessage: error.message,
    errorName: error.name,
    severity: 'error',
    handled: true,
    componentName
  });
};

// Dynamically import components with error boundaries
const ImageGallery = dynamic(() => import('./ImageGallery').then(mod => mod.ImageGallery), {
  loading: () => <ImageGallerySkeleton />,
  ssr: true
});

const HeroComponent = dynamic(() => import('./HeroComponent').then(mod => mod.HeroComponent), {
  loading: () => <HeroComponentSkeleton />,
  ssr: true
});

const TextBlock = dynamic(() => import('./TextBlock').then(mod => mod.TextBlock), {
  loading: () => <TextBlockSkeleton />,
  ssr: true
});

const FeatureGrid = dynamic(() => import('./FeatureGrid').then(mod => mod.FeatureGrid), {
  loading: () => <FeatureGridSkeleton />,
  ssr: true
});

interface ComponentRegistryProps {
  component: HeroComponentType | TextBlockComponent | ImageGalleryComponent | FeatureGridComponent | ButtonComponent;
  className?: string;
}

// Track component load times and performance
const useComponentMetrics = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      
      // Log performance metrics
      monitoringService.updateWebVital(
        `${componentName}_load`,
        duration
      );

      if (process.env.NODE_ENV === 'development') {
        console.debug(`Component ${componentName} loaded in ${duration}ms`);
      }
    };
  }, [componentName]);
};

export function ComponentRegistry({ component, className }: ComponentRegistryProps) {
  useComponentMetrics(component.__component);

  // Get component type, handling both namespaced and non-namespaced components
  const componentType = component.__component.replace('page-blocks.', '');

  // Log the component type for debugging
  console.log('Component:', { type: componentType, full: component.__component });

  switch (componentType) {
    case 'hero':
      return (
        <ErrorBoundary 
          fallback={<HeroComponentSkeleton />}
          onError={handleComponentError('HeroComponent', 'hero')}
        >
          <HeroComponent data={component as HeroComponentType} className={className} />
        </ErrorBoundary>
      );
    case 'text-block':
      return (
        <ErrorBoundary 
          fallback={<TextBlockSkeleton />}
          onError={handleComponentError('TextBlockComponent', 'text')}
        >
          <TextBlock data={component as TextBlockComponent} className={className} />
        </ErrorBoundary>
      );
    case 'button': {
      const buttonData = component as ButtonComponent;
      return (
        <button 
          className={`${className} px-4 py-2 ${
            buttonData.style === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
          } rounded hover:opacity-90 transition-opacity`}
          onClick={() => buttonData.link && window.location.assign(buttonData.link)}
        >
          {buttonData.text || 'Click Me'}
        </button>
      );
    }
    case 'feature-grid':
      return (
        <ErrorBoundary 
          fallback={<FeatureGridSkeleton />}
          onError={handleComponentError('FeatureGridComponent', 'feature-grid')}
        >
          <FeatureGrid data={component as FeatureGridComponent} className={className} />
        </ErrorBoundary>
      );
    default:
      if (isBaseComponent(component)) {
        const message = `Unknown component type: ${component.__component}`;
        console.warn(message);
        monitoringService.trackError(new Error(message), {
          componentName: 'ComponentRegistry',
          errorMessage: message,
          errorName: 'UnknownComponentError',
          severity: 'warning',
          handled: true,
          context: {
            componentType: component.__component,
            componentId: component.id
          }
        });
      } else {
        const message = 'Invalid component structure';
        console.error(message);
        monitoringService.trackError(new Error(message), {
          componentName: 'ComponentRegistry',
          errorMessage: message,
          errorName: 'InvalidComponentError',
          severity: 'error',
          handled: true
        });
      }
      return null;
  }
}

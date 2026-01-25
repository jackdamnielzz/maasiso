# MaasISO Next.js Application - AI Agent Guidelines

## Architecture Overview
This is a Next.js 16+ application with Strapi CMS backend, featuring:
- **Frontend**: Next.js App Router with TypeScript, Tailwind CSS
- **Backend**: Strapi CMS (hosted externally)
- **Deployment**: SFTP-based to VPS (no traditional CI/CD)
- **Key Features**: Network monitoring, extensive error handling, no caching

## Critical Patterns & Conventions

### API Layer (`src/lib/api.ts`, `src/lib/monitoredFetch.ts`)
- **Always use `monitoredFetch`** for API calls - provides logging, monitoring, and retry logic
- **No caching**: All requests use `cache: 'no-store'` (see `src/lib/cache.ts`)
- **Authentication**: Bearer token from `NEXT_PUBLIC_STRAPI_TOKEN`
- **Error handling**: Custom `APIError` class with status codes
- **URL resolution**: `getBaseUrl()` uses `NEXT_PUBLIC_BACKEND_URL`

### Component Architecture
- **Core components** in `src/components/core/` with individual READMEs
- **Design system** uses tokens from `src/design-system/tokens/`
- **Path aliases**: `@/*` maps to `src/*` (configured in `tsconfig.json`)
- **Error boundaries**: Extensive error handling components

### Network & Monitoring (`src/lib/monitoring/`)
- **NetworkMonitor**: Real-time connection quality monitoring
- **Performance tracking**: All API calls are monitored
- **Debug logging**: Extensive console logging (controlled by `DEBUG` flag)

### Configuration Management
- **Environment variables**: `.env.local`, `.env.production`, `.env.vercel`
- **Navigation**: Centralized in `src/config/navigation.ts`
- **Build settings**: `next.config.js` with standalone output for containers

## Development Workflows

### Building & Running
```bash
npm run dev          # Development with debugging
npm run build        # Production build
npm run start        # Start production server
npm run build:prod   # Clean build without linting
```

### Testing
```bash
npm run test         # Jest tests
npm run test:watch   # Watch mode
npm run lint         # ESLint
npm run lint:fix     # Auto-fix linting issues
```

### Deployment
- **SFTP-based**: Use VS Code SFTP extension (not Git-based CI/CD)
- **Scripts**: `scripts/direct-deploy.ps1` for PowerShell deployment
- **PM2**: Process management via `ecosystem.config.js`
- **Health checks**: Built into deployment scripts

## Code Patterns

### API Calls
```typescript
// Always use monitoredFetch
import { monitoredFetch } from '@/lib/monitoredFetch';

const response = await monitoredFetch('endpoint', '/api/content', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${API_TOKEN}` }
});
```

### Component Structure
```typescript
// Core components follow this pattern
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  // ... other props
}

export default function Button({ variant = 'primary', ...props }: ButtonProps) {
  // Implementation
}
```

### Error Handling
```typescript
// Custom error classes
class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Extensive try/catch with monitoring
try {
  const result = await monitoredFetch(...);
} catch (error) {
  monitoringService.trackError(error);
  throw new APIError('Failed to fetch', 500);
}
```

## Key Files to Reference
- `src/lib/api.ts` - Main API client
- `src/lib/monitoredFetch.ts` - Network monitoring wrapper
- `src/config/navigation.ts` - Site navigation structure
- `next.config.js` - Next.js configuration
- `ecosystem.config.js` - PM2 production config
- `tailwind.config.js` - Styling configuration

## Important Notes
- **No caching**: All data fetched fresh from Strapi on every request
- **Network-aware**: App adapts behavior based on connection quality
- **Logging-heavy**: Extensive debug logging for troubleshooting
- **SFTP deployment**: Manual file sync via VS Code extension
- **Standalone builds**: Configured for containerized deployment</content>
<parameter name="filePath">d:\Programmeren\MaasISO\New without errors\maasiso - Copy\.github\copilot-instructions.md
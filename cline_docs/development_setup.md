# Development Setup Guide

## Prerequisites

### Required Software
- Node.js (v18 or higher)
- npm (v9 or higher)
- Git
- Visual Studio Code (recommended)

### VSCode Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

## Initial Setup

### 1. Clone the Repository
```bash
git clone [repository-url]
cd maasiso
```

### 2. Environment Configuration

Create a `.env.development` file in the frontend directory:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://153.92.223.23:1337
STRAPI_API_TOKEN=your_strapi_token

# Image Configuration
NEXT_PUBLIC_ASSET_PREFIX=http://153.92.223.23:1337
```

### 3. Install Dependencies
```bash
# Install frontend dependencies
cd frontend
npm install
```

## Development Environment

### Starting the Development Server
```bash
# In the frontend directory
npm run dev
```
This will start the Next.js development server at http://localhost:3000

### Building for Production
```bash
# In the frontend directory
npm run build
```

### Running Type Checks
```bash
# In the frontend directory
npm run type-check
```

## Project Structure

### Key Directories
- `/frontend/src/app` - Next.js pages and routes
- `/frontend/src/components` - React components
- `/frontend/src/lib` - Utilities and core functionality

### Important Files
- `frontend/next.config.ts` - Next.js configuration
- `frontend/tailwind.config.ts` - Tailwind CSS configuration
- `frontend/src/lib/env.ts` - Environment variable validation
- `frontend/src/lib/api.ts` - API integration

## Working with the API

### Strapi CMS
- Admin Panel: http://153.92.223.23:1337/admin
- API Documentation: http://153.92.223.23:1337/documentation

### Content Types
1. Blog Posts
   - Endpoint: `/api/blog-posts`
   - Fields: title, content, categories, etc.

2. News Articles
   - Endpoint: `/api/news-articles`
   - Fields: title, content, categories, etc.

3. Categories
   - Endpoint: `/api/categories`
   - Fields: name, description, slug

## Development Workflow

### 1. Feature Development
1. Create a new branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Implement changes following the project patterns:
   - Use TypeScript with proper types
   - Follow component patterns
   - Implement error handling
   - Add appropriate tests
   - Update documentation

3. Run type checks and tests
   ```bash
   npm run type-check
   npm run test
   ```

### 2. Code Quality
- Follow ESLint rules
- Use Prettier for formatting
- Maintain type safety
- Write meaningful commit messages

### 3. Testing
- Test in development environment
- Verify error handling
- Check responsive design
- Validate type safety

## Common Tasks

### Adding a New Page
1. Create page in `/frontend/src/app`
2. Add error.tsx for error handling
3. Add loading.tsx for loading state
4. Update types if needed
5. Add API integration if required

### Creating a New Component
1. Create component file in appropriate directory
2. Define TypeScript interfaces
3. Implement error handling
4. Add documentation
5. Update tests

### Modifying API Integration
1. Update types in `types.ts`
2. Modify API functions in `api.ts`
3. Update normalizers if needed
4. Test changes
5. Update documentation

## Troubleshooting

### Common Issues

#### 1. Environment Variables
**Issue**: Missing or incorrect environment variables
**Solution**: 
- Check `.env.development` file
- Verify values match Strapi configuration
- Restart development server

#### 2. Type Errors
**Issue**: TypeScript compilation errors
**Solution**:
- Check interface definitions
- Verify API response types
- Use proper type guards

#### 3. API Connection
**Issue**: Cannot connect to Strapi API
**Solution**:
- Verify API URL
- Check Strapi token
- Confirm VPS is running

### Development Tips
1. Use VSCode debugging
2. Monitor Network tab in DevTools
3. Check console for errors
4. Use React DevTools for component inspection

## Additional Resources

### Documentation
- [API Documentation](api_documentation.md)
- [Technical Guide](technical_guide.md)
- [Knowledge Base](knowledgeBase.md)

### External Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Strapi Documentation](https://docs.strapi.io)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For additional help:
1. Check existing documentation
2. Review technical guides
3. Consult team lead
4. Check version control history

Last Updated: 2025-01-20

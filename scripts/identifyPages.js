/**
 * Parses a recursive file listing of the Next.js app directory to identify and extract page and API routes.
 * Handles static pages, dynamic pages, route groups, and API routes based on file and directory naming conventions.
 *
 * @param {string} fileListString - A string containing the recursive file listing, one path per line.
 * @returns {Array<{ path: string, type: 'static-page' | 'dynamic-page' | 'api-route' }>} An array of identified route objects.
 */
function identifyNextjsRoutes(fileListString) {
  const lines = fileListString.split(/\r?\n/).filter(line => line.trim() !== '');
  const routes = [];

  const routeFiles = lines.filter(line =>
    line.startsWith('app/') && // Ensure it's within the app directory
    /\/(page|route)\.(tsx|jsx|js|ts|mjs|cjs)$/.test(line)
  );

  for (const filePath of routeFiles) {
    // Normalize path separators
    const normalizedFilePath = filePath.replace(/\\/g, '/');

    // Determine if it's an API route before removing suffix
    const isApiRoute = /\/route\.(tsx|jsx|js|ts|mjs|cjs)$/.test(normalizedFilePath);

    // Remove 'app/' prefix and '/page.*' or '/route.*' suffix
    let routePath = normalizedFilePath.replace(/^app\//, '').replace(/\/(page|route)\.(tsx|jsx|js|ts|mjs|cjs)$/, '');

    // Handle the root route case where removing suffix results in empty string
    if (routePath === '') {
        routePath = '/';
    } else {
        // Prepend '/' for non-root paths
        routePath = '/' + routePath;
    }

    // Determine the type
    let type;
    if (isApiRoute) {
      type = 'api-route';
    } else {
      // For page routes, determine if dynamic
      const isDynamic = routePath.includes('[') && routePath.includes(']');
      type = isDynamic ? 'dynamic-page' : 'static-page';
    }

    routes.push({
      path: routePath,
      type: type,
    });
  }

  return routes;
}

// Export the function for potential use in other scripts or tests
module.exports = identifyNextjsRoutes;

// If the script is run directly, read from stdin and print the result
if (require.main === module) {
  // Read file list from scripts/filelist.txt
  const fs = require('fs');
  const path = require('path');
  const fileListPath = path.join(__dirname, 'filelist.txt');

  try {
    const fileListString = fs.readFileSync(fileListPath, 'utf8');
    const routes = identifyNextjsRoutes(fileListString);
    console.log(JSON.stringify(routes, null, 2));
  } catch (err) {
    console.error('Error reading filelist.txt:', err);
    process.exit(1);
  }
}
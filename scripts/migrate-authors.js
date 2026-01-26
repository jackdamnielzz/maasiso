/**
 * Author Migration Script for MaasISO Blog Posts
 * 
 * Since the Strapi schema doesn't have an 'authors' content type (only a string field),
 * this script updates the existing 'Author' string field on all blog posts.
 * 
 * Usage: node scripts/migrate-authors.js
 */

const API_BASE_URL = "https://peaceful-insight-production.up.railway.app";
const API_TOKEN =
  "9ff727d730447da883cad384524bc2e9891de14e526d0273c0785710762dc0ef2aa6900a855948e3fa6ed72a1927178b6c725fa34605959aac8cb69794463c1484cd0325548fc3a5c88898cb9099ac114e40c19bb6755c8d2f7d9110330be97031587152e34f6e37992eb31faef66c92f60df20b32b80b95029744047504f9f9";

const DEFAULT_AUTHOR_NAME = "Niels Maas";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_TOKEN}`,
};

const AUTH_HEADERS = {
  Authorization: `Bearer ${API_TOKEN}`,
};

const toAbsoluteUrl = (path) => `${API_BASE_URL}${path}`;

const logInfo = (message) => {
  process.stdout.write(`${message}\n`);
};

const logError = (message) => {
  process.stderr.write(`${message}\n`);
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const errorDetails = data?.error || data || text;
    throw new Error(
      `Request failed (${response.status} ${response.statusText}): ${JSON.stringify(
        errorDetails
      )}`
    );
  }
  return data;
};

const fetchAllBlogPosts = async () => {
  // Fetch with pagination to get all posts
  let allPosts = [];
  let page = 1;
  const pageSize = 25;
  
  while (true) {
    const url = toAbsoluteUrl(`/api/blog-posts?pagination[page]=${page}&pagination[pageSize]=${pageSize}&status=draft`);
    logInfo(`Fetching blog posts page ${page}...`);
    
    const payload = await fetchJson(url, {
      headers: AUTH_HEADERS,
    });
    
    const posts = payload?.data ?? [];
    allPosts = allPosts.concat(posts);
    
    const pagination = payload?.meta?.pagination;
    if (!pagination || page >= pagination.pageCount) {
      break;
    }
    page++;
  }
  
  return allPosts;
};

// Helper to get field value - Strapi v5 has flat structure, v4 uses attributes
const getField = (post, fieldName) => {
  // Strapi v5: fields are at root level
  if (post[fieldName] !== undefined) {
    return post[fieldName];
  }
  // Strapi v4: fields are under attributes
  return post?.attributes?.[fieldName];
};

const hasAuthorSet = (blogPost) => {
  // Check if Author field is already set to our default author
  const author = getField(blogPost, 'Author');
  return author === DEFAULT_AUTHOR_NAME;
};

const updateBlogPostAuthor = async (blogPostId, documentId) => {
  // Strapi v5 uses documentId for updates
  const url = toAbsoluteUrl(`/api/blog-posts/${documentId || blogPostId}`);
  
  await fetchJson(url, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      data: {
        Author: DEFAULT_AUTHOR_NAME
      }
    }),
  });
};

const migrate = async () => {
  logInfo("=".repeat(50));
  logInfo("MaasISO Blog Author Migration");
  logInfo("=".repeat(50));
  logInfo(`Setting all blog posts to author: "${DEFAULT_AUTHOR_NAME}"`);
  logInfo("");

  const posts = await fetchAllBlogPosts();
  
  if (posts.length === 0) {
    logInfo("No blog posts found. Nothing to update.");
    return;
  }

  logInfo(`Found ${posts.length} blog posts.`);
  logInfo("");

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const [index, post] of posts.entries()) {
    const postId = post.id;
    const documentId = post.documentId;
    const title = getField(post, 'title') ?? "(untitled)";
    const currentAuthor = getField(post, 'Author') ?? "(none)";
    const position = `${index + 1}/${posts.length}`;

    if (hasAuthorSet(post)) {
      logInfo(`[${position}] ✓ Skipped "${title}" (author already set)`);
      skippedCount += 1;
      continue;
    }

    try {
      logInfo(`[${position}] Updating "${title}" (current: "${currentAuthor}")...`);
      await updateBlogPostAuthor(postId, documentId);
      logInfo(`[${position}] ✓ Updated "${title}"`);
      updatedCount += 1;
    } catch (error) {
      logError(`[${position}] ✗ Failed to update "${title}": ${error.message}`);
      errorCount += 1;
    }
  }

  logInfo("");
  logInfo("=".repeat(50));
  logInfo("Migration Summary");
  logInfo("=".repeat(50));
  logInfo(`Total posts:   ${posts.length}`);
  logInfo(`Updated:       ${updatedCount}`);
  logInfo(`Skipped:       ${skippedCount}`);
  logInfo(`Errors:        ${errorCount}`);
  logInfo("=".repeat(50));
  
  if (errorCount > 0) {
    logInfo("");
    logInfo("⚠ Some posts failed to update. Check the errors above.");
  } else {
    logInfo("");
    logInfo("✓ Migration completed successfully!");
  }
};

const run = async () => {
  try {
    await migrate();
  } catch (error) {
    logError(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  }
};

run();

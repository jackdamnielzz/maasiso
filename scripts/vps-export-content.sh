#!/bin/bash
# VPS Content Export Script
# Run this on the VPS (153.92.223.23) to export Strapi content
# Usage: ssh root@153.92.223.23 'bash -s' < vps-export-content.sh

echo "=== Strapi Content Export ==="
echo "Date: $(date)"

cd /tmp

# Export content tables as JSON using PostgreSQL
sudo -u postgres psql strapi_db << 'EOF'
\t on
\pset format unaligned

-- Export blog_posts
\o /tmp/export_blog_posts.json
SELECT json_agg(t) FROM blog_posts t;
\o

-- Export news_articles
\o /tmp/export_news_articles.json
SELECT json_agg(t) FROM news_articles t;
\o

-- Export pages
\o /tmp/export_pages.json
SELECT json_agg(t) FROM pages t;
\o

-- Export categories
\o /tmp/export_categories.json
SELECT json_agg(t) FROM categories t;
\o

-- Export tags
\o /tmp/export_tags.json
SELECT json_agg(t) FROM tags t;
\o

-- Export services
\o /tmp/export_services.json
SELECT json_agg(t) FROM services t;
\o

-- Export testimonials
\o /tmp/export_testimonials.json
SELECT json_agg(t) FROM testimonials t;
\o

-- Export tools
\o /tmp/export_tools.json
SELECT json_agg(t) FROM tools t;
\o

-- Export whitepapers
\o /tmp/export_whitepapers.json
SELECT json_agg(t) FROM whitepapers t;
\o

-- Export link tables
\o /tmp/export_blog_posts_categories_lnk.json
SELECT json_agg(t) FROM blog_posts_categories_lnk t;
\o

\o /tmp/export_blog_posts_tags_lnk.json
SELECT json_agg(t) FROM blog_posts_tags_lnk t;
\o

\o /tmp/export_news_articles_categories_lnk.json
SELECT json_agg(t) FROM news_articles_categories_lnk t;
\o

\o /tmp/export_news_articles_tags_lnk.json
SELECT json_agg(t) FROM news_articles_tags_lnk t;
\o
EOF

echo ""
echo "Files created in /tmp:"
ls -la /tmp/export_*.json

# Combine all exports into one JSON file
echo ""
echo "Creating combined export file..."

sudo -u postgres psql strapi_db << 'EOF' > /tmp/strapi-content-export-combined.json
\t on
\pset format unaligned

SELECT json_build_object(
    'blog_posts', (SELECT COALESCE(json_agg(t), '[]'::json) FROM blog_posts t),
    'news_articles', (SELECT COALESCE(json_agg(t), '[]'::json) FROM news_articles t),
    'pages', (SELECT COALESCE(json_agg(t), '[]'::json) FROM pages t),
    'categories', (SELECT COALESCE(json_agg(t), '[]'::json) FROM categories t),
    'tags', (SELECT COALESCE(json_agg(t), '[]'::json) FROM tags t),
    'services', (SELECT COALESCE(json_agg(t), '[]'::json) FROM services t),
    'testimonials', (SELECT COALESCE(json_agg(t), '[]'::json) FROM testimonials t),
    'tools', (SELECT COALESCE(json_agg(t), '[]'::json) FROM tools t),
    'whitepapers', (SELECT COALESCE(json_agg(t), '[]'::json) FROM whitepapers t),
    'blog_posts_categories_lnk', (SELECT COALESCE(json_agg(t), '[]'::json) FROM blog_posts_categories_lnk t),
    'blog_posts_tags_lnk', (SELECT COALESCE(json_agg(t), '[]'::json) FROM blog_posts_tags_lnk t),
    'news_articles_categories_lnk', (SELECT COALESCE(json_agg(t), '[]'::json) FROM news_articles_categories_lnk t),
    'news_articles_tags_lnk', (SELECT COALESCE(json_agg(t), '[]'::json) FROM news_articles_tags_lnk t)
);
EOF

echo ""
echo "Combined export created: /tmp/strapi-content-export-combined.json"
echo "Size: $(ls -lh /tmp/strapi-content-export-combined.json | awk '{print $5}')"

echo ""
echo "=== Content Counts ==="
sudo -u postgres psql strapi_db -c "
SELECT 
    (SELECT COUNT(*) FROM blog_posts) as blog_posts,
    (SELECT COUNT(*) FROM news_articles) as news_articles,
    (SELECT COUNT(*) FROM pages) as pages,
    (SELECT COUNT(*) FROM categories) as categories,
    (SELECT COUNT(*) FROM tags) as tags;
"

echo ""
echo "=== Export Complete ==="
echo "Download with: scp root@153.92.223.23:/tmp/strapi-content-export-combined.json ./backups/"
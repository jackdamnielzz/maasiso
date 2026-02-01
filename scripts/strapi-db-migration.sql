-- Strapi DB Migration - SEO/GEO Enhancement (MaasISO)
-- Safe, idempotent migration script for Railway PostgreSQL
-- Notes:
-- - Uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- - Follows Strapi 5 naming conventions (snake_case)

-- =========================
-- 1) AUTHORS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS authors (
  id SERIAL PRIMARY KEY,
  document_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  bio TEXT,
  credentials VARCHAR(255),
  expertise JSONB,
  linked_in VARCHAR(255),
  email VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  published_at TIMESTAMP,
  created_by_id INTEGER,
  updated_by_id INTEGER,
  locale VARCHAR(255) DEFAULT 'en'
);

-- Foreign keys to admin_users (Strapi admins)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'authors_created_by_fk'
  ) THEN
    ALTER TABLE authors
      ADD CONSTRAINT authors_created_by_fk
      FOREIGN KEY (created_by_id) REFERENCES admin_users(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'authors_updated_by_fk'
  ) THEN
    ALTER TABLE authors
      ADD CONSTRAINT authors_updated_by_fk
      FOREIGN KEY (updated_by_id) REFERENCES admin_users(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- =========================
-- 2) COMPONENT TABLES
-- =========================
CREATE TABLE IF NOT EXISTS components_blog_tldr_items (
  id SERIAL PRIMARY KEY,
  point TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS components_blog_faq_items (
  id SERIAL PRIMARY KEY,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL
);

-- =========================
-- 3) RELATION / LINK TABLES
-- =========================

-- Author <-> Blog Posts (many-to-many)
CREATE TABLE IF NOT EXISTS authors_blog_posts_lnk (
  author_id INTEGER NOT NULL,
  blog_post_id INTEGER NOT NULL,
  PRIMARY KEY (author_id, blog_post_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'authors_blog_posts_lnk_author_fk'
  ) THEN
    ALTER TABLE authors_blog_posts_lnk
      ADD CONSTRAINT authors_blog_posts_lnk_author_fk
      FOREIGN KEY (author_id) REFERENCES authors(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'authors_blog_posts_lnk_post_fk'
  ) THEN
    ALTER TABLE authors_blog_posts_lnk
      ADD CONSTRAINT authors_blog_posts_lnk_post_fk
      FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Related posts (self-referencing many-to-many)
CREATE TABLE IF NOT EXISTS blog_posts_related_posts_lnk (
  blog_post_id INTEGER NOT NULL,
  inv_blog_post_id INTEGER NOT NULL,
  PRIMARY KEY (blog_post_id, inv_blog_post_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_related_posts_lnk_post_fk'
  ) THEN
    ALTER TABLE blog_posts_related_posts_lnk
      ADD CONSTRAINT blog_posts_related_posts_lnk_post_fk
      FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_related_posts_lnk_inv_post_fk'
  ) THEN
    ALTER TABLE blog_posts_related_posts_lnk
      ADD CONSTRAINT blog_posts_related_posts_lnk_inv_post_fk
      FOREIGN KEY (inv_blog_post_id) REFERENCES blog_posts(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- TL;DR components relation
CREATE TABLE IF NOT EXISTS blog_posts_tldr_lnk (
  blog_post_id INTEGER NOT NULL,
  component_id INTEGER NOT NULL,
  component_type VARCHAR(255) NOT NULL,
  field VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL,
  PRIMARY KEY (blog_post_id, component_id, field, "order")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_tldr_lnk_post_fk'
  ) THEN
    ALTER TABLE blog_posts_tldr_lnk
      ADD CONSTRAINT blog_posts_tldr_lnk_post_fk
      FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_tldr_lnk_component_fk'
  ) THEN
    ALTER TABLE blog_posts_tldr_lnk
      ADD CONSTRAINT blog_posts_tldr_lnk_component_fk
      FOREIGN KEY (component_id) REFERENCES components_blog_tldr_items(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- FAQ components relation
CREATE TABLE IF NOT EXISTS blog_posts_faq_lnk (
  blog_post_id INTEGER NOT NULL,
  component_id INTEGER NOT NULL,
  component_type VARCHAR(255) NOT NULL,
  field VARCHAR(255) NOT NULL,
  "order" INTEGER NOT NULL,
  PRIMARY KEY (blog_post_id, component_id, field, "order")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_faq_lnk_post_fk'
  ) THEN
    ALTER TABLE blog_posts_faq_lnk
      ADD CONSTRAINT blog_posts_faq_lnk_post_fk
      FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_faq_lnk_component_fk'
  ) THEN
    ALTER TABLE blog_posts_faq_lnk
      ADD CONSTRAINT blog_posts_faq_lnk_component_fk
      FOREIGN KEY (component_id) REFERENCES components_blog_faq_items(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- OG Image relation (media file)
CREATE TABLE IF NOT EXISTS blog_posts_og_image_lnk (
  blog_post_id INTEGER NOT NULL,
  file_id INTEGER NOT NULL,
  PRIMARY KEY (blog_post_id, file_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_og_image_lnk_post_fk'
  ) THEN
    ALTER TABLE blog_posts_og_image_lnk
      ADD CONSTRAINT blog_posts_og_image_lnk_post_fk
      FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_og_image_lnk_file_fk'
  ) THEN
    ALTER TABLE blog_posts_og_image_lnk
      ADD CONSTRAINT blog_posts_og_image_lnk_file_fk
      FOREIGN KEY (file_id) REFERENCES files(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- =========================
-- 4) BLOG_POSTS NEW COLUMNS
-- =========================
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS excerpt TEXT,
  ADD COLUMN IF NOT EXISTS schema_type VARCHAR(255),
  ADD COLUMN IF NOT EXISTS primary_keyword VARCHAR(255),
  ADD COLUMN IF NOT EXISTS search_intent VARCHAR(255),
  ADD COLUMN IF NOT EXISTS cta_variant VARCHAR(255),
  ADD COLUMN IF NOT EXISTS robots_index BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS robots_follow BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS video_url VARCHAR(255),
  ADD COLUMN IF NOT EXISTS video_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS video_duration INTEGER;

-- Optional: author_id on blog_posts for direct FK (if schema uses one-to-many)
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS author_id INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_author_fk'
  ) THEN
    ALTER TABLE blog_posts
      ADD CONSTRAINT blog_posts_author_fk
      FOREIGN KEY (author_id) REFERENCES authors(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- =========================
-- 5) INDEXES (HELPFUL)
-- =========================
CREATE INDEX IF NOT EXISTS authors_slug_idx ON authors(slug);
CREATE INDEX IF NOT EXISTS blog_posts_schema_type_idx ON blog_posts(schema_type);
CREATE INDEX IF NOT EXISTS blog_posts_search_intent_idx ON blog_posts(search_intent);
CREATE INDEX IF NOT EXISTS blog_posts_cta_variant_idx ON blog_posts(cta_variant);
CREATE INDEX IF NOT EXISTS blog_posts_author_id_idx ON blog_posts(author_id);

-- =========================
-- 6) PAGE COMPONENTS + FIELDS
-- =========================

-- FAQ items
CREATE TABLE IF NOT EXISTS components_page_blocks_faq_items (
  id SERIAL PRIMARY KEY,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL
);

-- FAQ section (container for items)
CREATE TABLE IF NOT EXISTS components_page_blocks_faq_sections (
  id SERIAL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS components_page_blocks_faq_sections_cmps (
  id SERIAL PRIMARY KEY,
  entity_id INTEGER NOT NULL,
  cmp_id INTEGER NOT NULL,
  component_type VARCHAR(255) NOT NULL,
  field VARCHAR(255) NOT NULL,
  "order" DOUBLE PRECISION NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'components_page_blocks_faq_sections_entity_fk'
  ) THEN
    ALTER TABLE components_page_blocks_faq_sections_cmps
      ADD CONSTRAINT components_page_blocks_faq_sections_entity_fk
      FOREIGN KEY (entity_id) REFERENCES components_page_blocks_faq_sections(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'components_page_blocks_faq_sections_uq'
  ) THEN
    ALTER TABLE components_page_blocks_faq_sections_cmps
      ADD CONSTRAINT components_page_blocks_faq_sections_uq
      UNIQUE (entity_id, cmp_id, field, component_type);
  END IF;
END $$;

-- Key takeaway items
CREATE TABLE IF NOT EXISTS components_page_blocks_key_takeaway_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL
);

-- Key takeaways (container for items)
CREATE TABLE IF NOT EXISTS components_page_blocks_key_takeaways (
  id SERIAL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS components_page_blocks_key_takeaways_cmps (
  id SERIAL PRIMARY KEY,
  entity_id INTEGER NOT NULL,
  cmp_id INTEGER NOT NULL,
  component_type VARCHAR(255) NOT NULL,
  field VARCHAR(255) NOT NULL,
  "order" DOUBLE PRECISION NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'components_page_blocks_key_takeaways_entity_fk'
  ) THEN
    ALTER TABLE components_page_blocks_key_takeaways_cmps
      ADD CONSTRAINT components_page_blocks_key_takeaways_entity_fk
      FOREIGN KEY (entity_id) REFERENCES components_page_blocks_key_takeaways(id)
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'components_page_blocks_key_takeaways_uq'
  ) THEN
    ALTER TABLE components_page_blocks_key_takeaways_cmps
      ADD CONSTRAINT components_page_blocks_key_takeaways_uq
      UNIQUE (entity_id, cmp_id, field, component_type);
  END IF;
END $$;

-- Fact block (repeatable on page layout)
CREATE TABLE IF NOT EXISTS components_page_blocks_fact_blocks (
  id SERIAL PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  source VARCHAR(255)
);

-- Page fields
ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS primary_keyword VARCHAR(255),
  ADD COLUMN IF NOT EXISTS schema_type VARCHAR(255);

/**
 * Blog Post Lifecycle Hooks
 * 
 * This file protects relatedPosts from being wiped by the Strapi v5 Admin UI bug.
 * 
 * Problem: When publishing a blog post in Strapi Admin UI, the relatedPosts
 * self-referential manyToMany relation gets wiped due to a known Strapi v5 bug.
 * 
 * Solution: Before any update/publish, we save the current relatedPosts IDs.
 * After the update, we restore them directly in the database.
 * 
 * Installation:
 * 1. Copy this file to your Strapi project:
 *    src/api/blog-post/content-types/blog-post/lifecycles.js
 * 2. Restart Strapi
 * 
 * @see https://github.com/strapi/strapi/issues/22050
 */

'use strict';

// Store for preserving relatedPosts during updates
const relatedPostsCache = new Map();

module.exports = {
  /**
   * Before update: Save current relatedPosts to cache
   */
  async beforeUpdate(event) {
    const { params } = event;
    const documentId = params?.where?.documentId || params?.data?.documentId;
    
    if (!documentId) return;
    
    try {
      // Get current relatedPosts from database before Strapi wipes them
      const knex = strapi.db.connection;
      
      // Find all blog_post IDs for this documentId (draft + published)
      const blogPostIds = await knex('blog_posts')
        .select('id')
        .where('document_id', documentId);
      
      if (blogPostIds.length === 0) return;
      
      const ids = blogPostIds.map(row => row.id);
      
      // Get current related posts from link table
      const relatedLinks = await knex('blog_posts_related_posts_lnk')
        .select('blog_post_id', 'inv_blog_post_id')
        .whereIn('blog_post_id', ids);
      
      if (relatedLinks.length > 0) {
        // Cache the related post IDs (inv_blog_post_id = the related post)
        const relatedIds = [...new Set(relatedLinks.map(link => link.inv_blog_post_id))];
        relatedPostsCache.set(documentId, {
          blogPostIds: ids,
          relatedIds: relatedIds,
          timestamp: Date.now()
        });
        
        strapi.log.info(`[RelatedPosts Protection] Cached ${relatedIds.length} related posts for ${documentId}`);
      }
    } catch (error) {
      strapi.log.error(`[RelatedPosts Protection] Error in beforeUpdate: ${error.message}`);
    }
  },

  /**
   * After update: Restore relatedPosts from cache
   */
  async afterUpdate(event) {
    const { params, result } = event;
    const documentId = params?.where?.documentId || result?.documentId;
    
    if (!documentId) return;
    
    const cached = relatedPostsCache.get(documentId);
    if (!cached) return;
    
    // Only restore if cache is recent (within 30 seconds)
    if (Date.now() - cached.timestamp > 30000) {
      relatedPostsCache.delete(documentId);
      return;
    }
    
    try {
      const knex = strapi.db.connection;
      
      // Get current blog_post IDs (may have changed after publish)
      const blogPostIds = await knex('blog_posts')
        .select('id')
        .where('document_id', documentId);
      
      if (blogPostIds.length === 0) {
        relatedPostsCache.delete(documentId);
        return;
      }
      
      const currentIds = blogPostIds.map(row => row.id);
      
      // Check if relatedPosts were wiped
      const currentLinks = await knex('blog_posts_related_posts_lnk')
        .select('id')
        .whereIn('blog_post_id', currentIds);
      
      if (currentLinks.length === 0 && cached.relatedIds.length > 0) {
        // RelatedPosts were wiped! Restore them.
        strapi.log.warn(`[RelatedPosts Protection] Detected wipe for ${documentId}, restoring ${cached.relatedIds.length} relations...`);
        
        // Build insert data for all versions
        const insertData = [];
        for (const blogPostId of currentIds) {
          let order = 1;
          for (const relatedId of cached.relatedIds) {
            insertData.push({
              blog_post_id: blogPostId,
              inv_blog_post_id: relatedId,
              blog_post_ord: order++
            });
          }
        }
        
        // Insert restored relations
        if (insertData.length > 0) {
          await knex('blog_posts_related_posts_lnk').insert(insertData);
          strapi.log.info(`[RelatedPosts Protection] Restored ${cached.relatedIds.length} related posts for ${documentId}`);
        }
      }
      
      // Clean up cache
      relatedPostsCache.delete(documentId);
      
    } catch (error) {
      strapi.log.error(`[RelatedPosts Protection] Error in afterUpdate: ${error.message}`);
      relatedPostsCache.delete(documentId);
    }
  },

  /**
   * Before delete: Clean up cache
   */
  async beforeDelete(event) {
    const { params } = event;
    const documentId = params?.where?.documentId;
    if (documentId) {
      relatedPostsCache.delete(documentId);
    }
  }
};

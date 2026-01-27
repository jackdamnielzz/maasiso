# Strapi v5 Self-Referential ManyToMany Relation Bug Report

## Environment
- **Strapi Version**: 5.x (latest)
- **Database**: PostgreSQL (hosted on Railway)
- **Node.js**: 20.x
- **Deployment**: Railway (automatic deploys from GitHub)

## Problem Description

I have a `blog-post` content type with a self-referential manyToMany relation called `relatedPosts`. When I try to save a blog post with related posts selected in the Admin UI, I get the following error:

```
Document with id "vp0zjkchbozwnhpm9uvr3522", locale "null" not found
```

### Console Error
```
PUT https://[my-strapi-url]/content-manager/collection-types/api::blog-post.blog-post/vp0zjkchbozwnhpm9uvr3522?status=draft 400 (Bad Request)
```

## Schema Configuration

I've tried both **bidirectional** and **unidirectional** configurations:

### Attempt 1: Bidirectional (with inversedBy/mappedBy)
```json
{
  "relatedPosts": {
    "type": "relation",
    "relation": "manyToMany",
    "target": "api::blog-post.blog-post",
    "inversedBy": "relatedFrom"
  },
  "relatedFrom": {
    "type": "relation",
    "relation": "manyToMany",
    "target": "api::blog-post.blog-post",
    "mappedBy": "relatedPosts"
  }
}
```

### Attempt 2: Unidirectional (no inversedBy)
```json
{
  "relatedPosts": {
    "type": "relation",
    "relation": "manyToMany",
    "target": "api::blog-post.blog-post"
  }
}
```

**Both configurations produce the same error.**

## Steps to Reproduce

1. Create a `blog-post` content type with `draftAndPublish: true`
2. Add a self-referential manyToMany relation field called `relatedPosts`
3. Create at least 2 blog posts
4. Open one blog post in the Admin UI (draft mode)
5. In the `relatedPosts` field, select another blog post
6. Click **Save**
7. Error appears: `Document with id "...", locale "null" not found`

## What I've Tried

1. **Bidirectional relation** with `inversedBy`/`mappedBy` - Same error
2. **Unidirectional relation** without inverse - Same error
3. **Custom lifecycle hooks** to preserve relations - Doesn't help with the save error
4. **Custom controller** to intercept and handle relatedPosts - Doesn't help
5. **Document Service middleware** - Doesn't help

## Analysis

The error message `locale "null" not found` suggests the Admin UI is sending an incorrect payload when dealing with self-referential relations. The `locale` should not be `null` - it should either be a valid locale or not included at all.

This appears to be a bug in how Strapi v5's Admin UI handles self-referential manyToMany relations, specifically:
- The Admin UI sends `locale: null` in the relation payload
- The backend validation fails because it can't find a document with `locale: null`

## Expected Behavior

I should be able to:
1. Select related blog posts in the Admin UI
2. Save the blog post
3. Publish the blog post
4. Have the relatedPosts persist through all operations

## Actual Behavior

- Saving fails with `Document with id "...", locale "null" not found`
- The relation is never persisted

## Questions for the Community

1. Is this a known bug in Strapi v5?
2. Is there a workaround that allows setting self-referential relations from the Admin UI?
3. Is there a specific schema configuration that works for self-referential manyToMany relations in Strapi v5?
4. Should I file this as a bug report on GitHub?

## Related Issues (if any)

- GitHub Issue #22050: Self-referencing manyToMany relations broken in v5
- GitHub Issue #22051: Admin UI sends incorrect payload for self-relations

## Additional Context

- The content type has `draftAndPublish: true` enabled
- I'm not using i18n/localization
- The same schema worked in Strapi v4
- Direct database manipulation (bypassing Admin UI) works fine, but I need the Admin UI to work for content editors

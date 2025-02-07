# Creating Content Types

This guide provides step-by-step instructions for creating new content types in the MaasISO CMS.

## Prerequisites

Before creating a content type, ensure you have:
* Access to the Strapi admin panel
* Appropriate permissions
* Development environment access
* Content structure planned out

## Procedure

### 1. Access Content Type Builder

1. Log in to Strapi admin panel (http://153.92.223.23/admin)
2. Click "Content-Type Builder" in the left sidebar
3. Ensure you're in development mode

### 2. Create New Content Type

1. Click "Create new collection type" (or "single type")
2. Enter display name
   - Use PascalCase (e.g., BlogPost, NewsArticle)
   - Be descriptive and clear
3. Click "Continue"

### 3. Add Basic Fields

For each field:
1. Click "Add another field"
2. Select field type
3. Configure field settings:
   - Name (use camelCase)
   - Advanced settings if needed
   - Validation rules
4. Click "Add field"

Example fields:
```json
{
  "title": {
    "type": "string",
    "required": true,
    "unique": true
  },
  "content": {
    "type": "richtext"
  },
  "publishDate": {
    "type": "datetime"
  }
}
```

### 4. Configure Relations

1. Click "Add another field"
2. Select "Relation" type
3. Choose target content type
4. Select relation type:
   - One-to-One
   - One-to-Many
   - Many-to-Many
5. Configure relation settings
6. Click "Add field"

Example relation:
```json
{
  "author": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "api::user.user",
    "inversedBy": "posts"
  }
}
```

### 5. Add Components

1. Click "Add another field"
2. Select "Component" type
3. Either:
   - Create new component
   - Select existing component
4. Configure component settings:
   - Required/Optional
   - Repeatable/Single
5. Click "Add field"

### 6. Configure Advanced Settings

1. Click "Advanced Settings" tab
2. Configure:
   - Draft/Publish system
   - Timestamps
   - Lifecycle hooks
3. Save settings

### 7. Save and Build

1. Review all fields and settings
2. Click "Save" button
3. Wait for API rebuild
4. Verify in Content Manager

## Validation

After creation, verify:
1. Content type appears in Content Manager
2. All fields work as expected
3. Relations function correctly
4. API endpoints are generated
5. Permissions are set correctly

## Common Issues

| Issue | Solution |
|-------|----------|
| API build fails | Check field names and types |
| Relations not working | Verify relation configurations |
| Fields not appearing | Clear cache and rebuild |
| Permission errors | Check role settings |

## Examples

### Blog Post Type
```json
{
  "title": {
    "type": "string",
    "required": true
  },
  "slug": {
    "type": "uid",
    "targetField": "title"
  },
  "content": {
    "type": "richtext"
  },
  "author": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "api::user.user"
  },
  "categories": {
    "type": "relation",
    "relation": "manyToMany",
    "target": "api::category.category"
  }
}
```

### Product Type
```json
{
  "name": {
    "type": "string",
    "required": true
  },
  "price": {
    "type": "decimal",
    "required": true
  },
  "description": {
    "type": "richtext"
  },
  "images": {
    "type": "media",
    "multiple": true,
    "required": true
  }
}
```

## Related Documentation
- [Content Type System](../index.md)
- [Field Types Reference](./field_types_reference.md)
- [Content Relations](./content_relations.md)

---

Last Updated: 2025-01-19  
Version: 1.0  
Status: Draft

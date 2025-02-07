# Content Type System

## Introduction

This chapter explains the content type system in MaasISO CMS, including how to create, manage, and organize different types of content. It covers collection types, single types, components, and their relationships.

## Content Types Overview

### Collection Types vs Single Types

Collection Types:
- Multiple entries (e.g., Blog Posts, Articles)
- Managed as a collection
- Usually displayed in lists or grids

Single Types:
- Single entry (e.g., Homepage, About page)
- Managed as individual items
- Typically represent unique pages or settings

### Components and Dynamic Zones

Components:
- Reusable content blocks
- Consistent structure across content types
- Modular design approach

Dynamic Zones:
- Flexible content areas
- Mix different components
- Customizable layouts

## Field Types

### Basic Fields
- Text (short text, long text)
- Number (integer, decimal)
- Boolean (true/false)
- Date (date, time, datetime)
- Email
- Password
- Enumeration

### Rich Content Fields
- Rich Text (Markdown)
- Media (images, videos, files)
- JSON
- Dynamic Zone

### Relation Fields
- One-to-One
- One-to-Many
- Many-to-Many
- Polymorphic relations

## Content Type Builder

See [Creating Content Types](./procedures/creating_content_types.md) for step-by-step instructions.

### Best Practices
- Plan your content structure
- Use meaningful names
- Consider relationships early
- Document field purposes
- Test with sample content

## Content Organization

### Categories and Tags
- Content categorization
- Hierarchical organization
- Flexible tagging system
- Search and filter support

### Relations and Dependencies
- Content relationships
- Cross-references
- Dependency tracking
- Impact analysis

## Advanced Features

### Lifecycle Hooks
- beforeCreate
- afterCreate
- beforeUpdate
- afterUpdate
- beforeDelete
- afterDelete

### Validation
- Required fields
- Unique constraints
- Custom validation rules
- Error handling

### Permissions
- Field-level permissions
- Role-based access
- API access control
- Content workflow

## API Integration

### REST API
- Automatic API generation
- CRUD operations
- Filters and pagination
- Authentication

### GraphQL
- Schema generation
- Query optimization
- Type definitions
- Resolvers

## Related Documentation
- [System Overview](../01_system_overview/index.md)
- [Template System](../03_template_system/index.md)
- [Content Management](../04_content_management/index.md)

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Field type mismatch | Review field configuration and data types |
| Relation errors | Check relation definitions and constraints |
| API access issues | Verify permissions and authentication |

---

Last Updated: 2025-01-19  
Version: 1.0  
Status: Draft

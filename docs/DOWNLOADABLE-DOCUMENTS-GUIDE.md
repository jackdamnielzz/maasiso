# Downloadable Documents Guide for MaasISO

## Overview

This guide explains how to handle downloadable documents (PDF, Excel, Word, etc.) in blog posts on MaasISO.

## Recommended Approach: Use Strapi Media Library

The **best approach** is to upload documents directly to Strapi's Media Library. Here's why:

### Advantages

1. **Centralized Management**: All documents are managed in one place (Strapi CMS)
2. **Easy Updates**: Replace/update documents without changing blog post content
3. **Access Control**: Strapi can control who can access what (if needed)
4. **Automatic URLs**: Strapi generates proper URLs for each uploaded file
5. **File Organization**: Use folders in Media Library to organize documents
6. **No Duplicate Storage**: Documents aren't stored twice (CMS + website)

### How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    Strapi CMS                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Media Library                        │  │
│  │  📄 ISO-27001-checklist.pdf                       │  │
│  │  📊 ROI-calculator.xlsx                           │  │
│  │  📝 AVG-compliance-template.docx                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Blog Post                            │  │
│  │  Title: "ISO 27001 Certificering"                 │  │
│  │  Content: ... (with download button)              │  │
│  │  Downloadable File: → ISO-27001-checklist.pdf     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Website (maasiso.nl)                  │
│                                                         │
│  Blog Post Page:                                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ISO 27001 Certificering                          │  │
│  │  ...content...                                    │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  📥 Download ISO 27001 Checklist            │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Add Field to Blog Post Content Type in Strapi

Add a new field to your blog post schema:

```json
{
  "downloadableFile": {
    "type": "media",
    "multiple": false,
    "required": false,
    "allowedTypes": ["files"],
    "pluginOptions": {
      "i18n": {
        "localized": false
      }
    }
  },
  "downloadButtonText": {
    "type": "string",
    "required": false,
    "default": "Download"
  }
}
```

### Step 2: Upload Document in Strapi

1. Go to Strapi Admin → Media Library
2. Click "Add new assets"
3. Upload your document (PDF, Excel, Word, etc.)
4. Optionally create folders to organize: `/downloads/whitepapers/`, `/downloads/templates/`

### Step 3: Link Document to Blog Post

1. Edit the blog post in Strapi
2. In the "Downloadable File" field, select your uploaded document
3. Optionally set custom button text like "Download ISO Checklist"

### Step 4: Display Download Button in Frontend

The download button component will automatically render when a blog post has a downloadable file attached.

## Security Considerations

### URL Obscurity

Documents uploaded to Strapi get URLs like:
```
https://api.maasiso.nl/uploads/ISO_27001_checklist_a3b2c1d4e5.pdf
```

The random string makes URLs hard to guess, but **not truly private**.

### For Truly Private Documents

If documents must be protected:

1. **Option A**: Require users to fill a form (lead capture) before download
2. **Option B**: Use Strapi's authentication to protect the upload folder
3. **Option C**: Implement a download API route that checks conditions

### Recommended: Lead Capture for Valuable Content

For whitepapers and valuable content, consider requiring email submission:

```
User clicks "Download" → Form appears → User enters email → Document downloads
```

This provides value in exchange for the document while collecting leads.

## File Types Supported

| Type | Extension | Use Case |
|------|-----------|----------|
| PDF | .pdf | Whitepapers, guides, certificates |
| Excel | .xlsx | Templates, calculators, checklists |
| Word | .docx | Templates, contracts |
| PowerPoint | .pptx | Presentations |
| ZIP | .zip | Multiple files packaged |

## Best Practices

1. **Naming Convention**: Use descriptive names
   - ✅ `ISO-27001-implementatie-checklist-2024.pdf`
   - ❌ `checklist.pdf`

2. **File Size**: Keep under 10MB when possible
   - Large files slow down downloads
   - Consider compressing PDFs

3. **Version Control**: Include version/date in filename
   - `AVG-template-v2-jan2024.docx`

4. **Alt Text**: Always add description in Strapi for accessibility

5. **Track Downloads**: Use Google Analytics events to track downloads

## Related Files

- [`src/components/features/BlogPostContent.tsx`](../src/components/features/BlogPostContent.tsx) - Download button rendering
- [`src/lib/api.ts`](../src/lib/api.ts) - API fetching including file URLs
- [`strapi-schemas/api/blog-post/content-types/blog-post/schema.json`](../strapi-schemas/api/blog-post/content-types/blog-post/schema.json) - Schema definition

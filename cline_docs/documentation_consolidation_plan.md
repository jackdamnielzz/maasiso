# Documentation Consolidation Plan
Last Updated: 2025-01-19

## Identified Redundancies

### 1. Template System Documentation
Current Locations:
- technical/frontend/templates/
- manuals/template_system_manual.md
- complete_manual/chapters/03_template_system/

Recommendation:
- Move all template technical documentation to technical/frontend/templates/
- Move user guides to user_manuals/developer/
- Remove redundant files after consolidation

### 2. System Overview Documentation
Current Locations:
- system/architecture/
- complete_manual/chapters/01_system_overview/

Recommendation:
- Consolidate all system architecture documentation in system/architecture/
- Move development environment setup to user_manuals/developer/
- Remove duplicate content from complete_manual

### 3. Content Type Documentation
Current Locations:
- technical/backend/cms_content_strategy.md
- complete_manual/chapters/02_content_type_system/

Recommendation:
- Merge technical content into technical/backend/
- Move user guides to user_manuals/admin/
- Remove redundant documentation

### 4. Manual Structure
Current Locations:
- manuals/
- complete_manual/
- Various README files

Recommendation:
- Remove manuals/ directory after content consolidation
- Integrate complete_manual content into new structure
- Keep only the new three-part structure:
  - technical/
  - system/
  - user_manuals/

## Files to Remove (After Content Migration)

### Redundant Directories
1. cline_docs/manuals/
2. cline_docs/manuals/complete_manual/

### Redundant Files
1. template_system_manual.md (after content is merged into technical/frontend/templates/)
2. template_quickstart_guide.md (after content is moved to user_manuals/developer/)
3. template_technical_reference.md (after content is merged into technical/frontend/templates/)

## Content Migration Steps

### 1. Template Documentation
1. Review all template-related content
2. Extract unique information from each source
3. Organize into:
   - Technical documentation (technical/frontend/templates/)
   - Developer guides (user_manuals/developer/)
   - Admin guides (user_manuals/admin/)

### 2. System Documentation
1. Consolidate system architecture information
2. Move environment setup guides to developer documentation
3. Update cross-references in all files

### 3. Content Type Documentation
1. Merge technical specifications
2. Create separate user guides
3. Update related documentation

## Implementation Plan

1. Content Migration
   - Review each source document
   - Extract unique content
   - Merge into new structure
   - Update cross-references

2. Validation
   - Verify all content is preserved
   - Check cross-references
   - Test documentation navigation

3. Cleanup
   - Archive old directories
   - Remove redundant files
   - Update main README

## Required Approvals

Before removing any content:
1. Verify content has been properly migrated
2. Get explicit approval ("YES") for each removal
3. Keep backup of removed content

## Revision History
- [2025-01-19] Created consolidation plan
- [2025-01-19] Identified redundancies
- [2025-01-19] Outlined migration steps

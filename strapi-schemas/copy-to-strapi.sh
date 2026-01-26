#!/bin/bash
# Strapi Schema Deployment Script
# This script copies all schema files to your Strapi backend repository

set -e

# Check if path argument provided
if [ -z "$1" ]; then
    echo "ERROR: Please provide the path to your Strapi backend repository"
    echo ""
    echo "Usage: ./copy-to-strapi.sh /path/to/strapi-backend"
    echo "Example: ./copy-to-strapi.sh ~/Projects/maasiso-strapi"
    exit 1
fi

STRAPI_PATH="$1"

echo "=================================================================="
echo "STRAPI SCHEMA DEPLOYMENT"
echo "=================================================================="
echo ""

# Validate Strapi path
if [ ! -d "$STRAPI_PATH" ]; then
    echo "ERROR: Strapi path does not exist: $STRAPI_PATH"
    echo ""
    echo "Please provide the correct path to your Strapi backend repository."
    exit 1
fi

# Verify it looks like a Strapi project
if [ ! -f "$STRAPI_PATH/package.json" ]; then
    echo "WARNING: No package.json found in $STRAPI_PATH"
    echo "Are you sure this is a Strapi project?"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Source: $SCRIPT_DIR"
echo "Target: $STRAPI_PATH"
echo ""

# Function to copy with logging
copy_with_log() {
    local source="$1"
    local destination="$2"
    local description="$3"

    echo -e "\033[36mCopying $description...\033[0m"

    # Create destination directory if it doesn't exist
    local dest_dir=$(dirname "$destination")
    if [ ! -d "$dest_dir" ]; then
        mkdir -p "$dest_dir"
        echo "  Created directory: $dest_dir"
    fi

    # Copy file or directory
    if [ -e "$source" ]; then
        cp -r "$source" "$destination"
        echo -e "  \033[32mOK: $description\033[0m"
        return 0
    else
        echo -e "  \033[33mSKIP: Source not found: $source\033[0m"
        return 1
    fi
}

echo "Starting file copy..."
echo ""

copied=0
skipped=0

# Copy Author schema
if copy_with_log "$SCRIPT_DIR/api/author" "$STRAPI_PATH/src/api/author" "Author collection schema"; then
    ((copied++))
else
    ((skipped++))
fi

# Copy Blog Post schema (only the schema.json)
if copy_with_log "$SCRIPT_DIR/api/blog-post/content-types/blog-post/schema.json" "$STRAPI_PATH/src/api/blog-post/content-types/blog-post/schema.json" "Blog Post schema"; then
    ((copied++))
else
    ((skipped++))
fi

# Copy components
if copy_with_log "$SCRIPT_DIR/components/blog" "$STRAPI_PATH/src/components/blog" "Blog components (tldr-item, faq-item)"; then
    ((copied++))
else
    ((skipped++))
fi

# Copy migration script
mkdir -p "$STRAPI_PATH/scripts"
if copy_with_log "$SCRIPT_DIR/scripts/migrate-authors.js" "$STRAPI_PATH/scripts/migrate-authors.js" "Migration script"; then
    ((copied++))
else
    ((skipped++))
fi

echo ""
echo "=================================================================="
echo "COPY SUMMARY"
echo "=================================================================="
echo -e "\033[32mFiles copied: $copied\033[0m"
echo -e "\033[33mFiles skipped: $skipped\033[0m"
echo ""

if [ $copied -gt 0 ]; then
    echo -e "\033[32mSUCCESS! Schema files copied to Strapi repository.\033[0m"
    echo ""
    echo -e "\033[36mNEXT STEPS:\033[0m"
    echo -e "\033[37m1. Review changes:\033[0m"
    echo "   cd \"$STRAPI_PATH\""
    echo "   git status"
    echo "   git diff src/api/blog-post/content-types/blog-post/schema.json"
    echo ""
    echo -e "\033[37m2. Commit changes:\033[0m"
    echo "   git add src/api/ src/components/ scripts/"
    echo "   git commit -m \"feat: add SEO/GEO enhanced schemas with Authors collection\""
    echo ""
    echo -e "\033[37m3. Deploy to Railway:\033[0m"
    echo "   git push origin main"
    echo ""
    echo -e "\033[37m4. Run migration script (after deployment):\033[0m"
    echo "   cd \"$STRAPI_PATH\""
    echo "   STRAPI_URL=https://peaceful-insight-production.up.railway.app \\"
    echo "   STRAPI_TOKEN=your-token \\"
    echo "   node scripts/migrate-authors.js"
    echo ""
    echo -e "\033[33mSee DEPLOY.md for detailed instructions.\033[0m"
else
    echo -e "\033[33mWARNING: No files were copied. Check source paths.\033[0m"
fi

echo ""

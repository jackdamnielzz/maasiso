#!/bin/bash
#############################################
# File Metadata Stripping Script
# Purpose: Remove EXIF, GPS, and metadata from uploaded files
# Protects against location leaks and privacy exposure
# Run as: sudo bash 17-metadata-stripping.sh
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  File Metadata Stripping Setup${NC}"
echo -e "${YELLOW}  (EXIF, GPS, Document Metadata)${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Run as root: sudo bash $0${NC}"
    exit 1
fi

# Step 1: Install required tools
echo -e "${BLUE}[1/4] Installing metadata tools...${NC}"
apt-get update -qq
apt-get install -y exiftool mat2 qpdf imagemagick
echo -e "${GREEN}✓ Tools installed (exiftool, mat2, qpdf, imagemagick)${NC}"

# Step 2: Create metadata stripping scripts
echo ""
echo -e "${BLUE}[2/4] Creating metadata stripping scripts...${NC}"

mkdir -p /opt/security-tools/metadata
mkdir -p /var/log/security/metadata

# Main metadata stripping script
cat > /usr/local/bin/strip-metadata << 'EOF'
#!/bin/bash
#############################################
# Strip Metadata from Files
# Usage: strip-metadata <file or directory>
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo "Usage: strip-metadata <file or directory>"
    echo ""
    echo "Strips EXIF, GPS, and other metadata from:"
    echo "  - Images (JPG, PNG, TIFF, GIF, WebP)"
    echo "  - Documents (PDF, DOCX, ODT)"
    echo "  - Audio/Video (MP3, MP4, AVI)"
    echo ""
    echo "Options:"
    echo "  -v, --verbose  Show detailed output"
    echo "  -r, --recursive  Process directories recursively"
    exit 1
fi

TARGET="$1"
VERBOSE=false
RECURSIVE=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        -v|--verbose)
            VERBOSE=true
            ;;
        -r|--recursive)
            RECURSIVE=true
            ;;
    esac
done

strip_image() {
    local file="$1"
    
    if $VERBOSE; then
        echo "Processing image: $file"
        echo "Before:"
        exiftool -gps:all -DateTimeOriginal -Model -Make "$file" 2>/dev/null | head -10
    fi
    
    # Remove all metadata while preserving image quality
    exiftool -all= -overwrite_original "$file" 2>/dev/null
    
    if $VERBOSE; then
        echo "After: Metadata stripped"
        echo ""
    fi
}

strip_pdf() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    if $VERBOSE; then
        echo "Processing PDF: $file"
    fi
    
    # Use mat2 for comprehensive metadata removal
    mat2 --inplace "$file" 2>/dev/null || {
        # Fallback to qpdf
        qpdf --linearize --replace-input "$file" 2>/dev/null || true
    }
}

strip_document() {
    local file="$1"
    
    if $VERBOSE; then
        echo "Processing document: $file"
    fi
    
    # Use mat2 for Office documents
    mat2 --inplace "$file" 2>/dev/null || {
        echo -e "${YELLOW}Warning: Could not strip metadata from $file${NC}"
    }
}

strip_media() {
    local file="$1"
    
    if $VERBOSE; then
        echo "Processing media: $file"
    fi
    
    # Remove metadata from audio/video
    exiftool -all= -overwrite_original "$file" 2>/dev/null || {
        mat2 --inplace "$file" 2>/dev/null || true
    }
}

process_file() {
    local file="$1"
    local ext="${file##*.}"
    ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
    
    case "$ext" in
        jpg|jpeg|png|gif|tiff|tif|webp|bmp)
            strip_image "$file"
            ;;
        pdf)
            strip_pdf "$file"
            ;;
        doc|docx|odt|xlsx|xls|pptx|ppt)
            strip_document "$file"
            ;;
        mp3|mp4|avi|mov|mkv|flac|wav)
            strip_media "$file"
            ;;
        *)
            if $VERBOSE; then
                echo "Skipping unsupported file type: $file"
            fi
            ;;
    esac
}

# Process target
if [ -f "$TARGET" ]; then
    process_file "$TARGET"
    echo -e "${GREEN}✓ Metadata stripped from: $TARGET${NC}"
elif [ -d "$TARGET" ]; then
    if $RECURSIVE; then
        find "$TARGET" -type f \( \
            -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o \
            -iname "*.gif" -o -iname "*.pdf" -o -iname "*.docx" -o \
            -iname "*.mp4" -o -iname "*.mp3" \
        \) | while read -r file; do
            process_file "$file"
        done
    else
        for file in "$TARGET"/*; do
            if [ -f "$file" ]; then
                process_file "$file"
            fi
        done
    fi
    echo -e "${GREEN}✓ Metadata stripped from files in: $TARGET${NC}"
else
    echo -e "${RED}Error: Target not found: $TARGET${NC}"
    exit 1
fi
EOF
chmod +x /usr/local/bin/strip-metadata

# Script to view metadata without stripping
cat > /usr/local/bin/view-metadata << 'EOF'
#!/bin/bash
#############################################
# View File Metadata
# Usage: view-metadata <file>
#############################################

if [ -z "$1" ]; then
    echo "Usage: view-metadata <file>"
    exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
    echo "Error: File not found: $FILE"
    exit 1
fi

echo "=========================================="
echo "Metadata for: $FILE"
echo "=========================================="
echo ""

# Full EXIF data
echo "=== EXIF Data ==="
exiftool "$FILE" 2>/dev/null

echo ""
echo "=== Potentially Sensitive ==="
echo "GPS Location:"
exiftool -gps:all "$FILE" 2>/dev/null || echo "  No GPS data"
echo ""
echo "Camera/Device Info:"
exiftool -Make -Model -Software "$FILE" 2>/dev/null || echo "  No device info"
echo ""
echo "Date/Time Info:"
exiftool -DateTimeOriginal -CreateDate -ModifyDate "$FILE" 2>/dev/null || echo "  No date info"
echo ""
echo "Author/Creator Info:"
exiftool -Author -Creator -Artist -Copyright "$FILE" 2>/dev/null || echo "  No author info"
EOF
chmod +x /usr/local/bin/view-metadata

echo -e "${GREEN}✓ Metadata scripts created${NC}"

# Step 3: Create upload directory watcher (inotify)
echo ""
echo -e "${BLUE}[3/4] Creating upload directory watcher...${NC}"

apt-get install -y inotify-tools

# Create the watcher service
cat > /opt/security-tools/metadata/watch-uploads.sh << 'EOF'
#!/bin/bash
#############################################
# Watch Upload Directories and Strip Metadata
# Automatically removes metadata from new uploads
#############################################

LOG_FILE="/var/log/security/metadata/watcher.log"
WATCH_DIRS="${WATCH_DIRS:-/var/www/uploads /var/www/frontend/public/uploads}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "Starting metadata watcher..."
log "Watching directories: $WATCH_DIRS"

# Create directories if they don't exist
for dir in $WATCH_DIRS; do
    mkdir -p "$dir" 2>/dev/null || true
done

# Watch for new files
inotifywait -m -r -e close_write,moved_to --format '%w%f' $WATCH_DIRS 2>/dev/null | while read FILE; do
    if [ -f "$FILE" ]; then
        ext="${FILE##*.}"
        ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
        
        case "$ext" in
            jpg|jpeg|png|gif|pdf|docx|mp4|mp3)
                log "New file detected: $FILE"
                /usr/local/bin/strip-metadata "$FILE" >> "$LOG_FILE" 2>&1
                log "Metadata stripped from: $FILE"
                ;;
        esac
    fi
done
EOF
chmod +x /opt/security-tools/metadata/watch-uploads.sh

# Create systemd service
cat > /etc/systemd/system/metadata-watcher.service << 'EOF'
[Unit]
Description=Automatic Metadata Stripping for Uploads
After=network.target

[Service]
Type=simple
ExecStart=/opt/security-tools/metadata/watch-uploads.sh
Restart=always
RestartSec=5
Environment="WATCH_DIRS=/var/www/uploads /var/www/frontend/public/uploads"

[Install]
WantedBy=multi-user.target
EOF

# Enable but don't start (needs configuration)
systemctl daemon-reload
systemctl enable metadata-watcher.service

echo -e "${GREEN}✓ Upload watcher service created${NC}"
echo -e "${YELLOW}  Configure WATCH_DIRS in service file, then start:${NC}"
echo -e "${YELLOW}  systemctl start metadata-watcher${NC}"

# Step 4: Create bulk processing script
echo ""
echo -e "${BLUE}[4/4] Creating bulk processing tools...${NC}"

cat > /usr/local/bin/strip-all-uploads << 'EOF'
#!/bin/bash
#############################################
# Strip Metadata from All Existing Uploads
# One-time bulk processing
#############################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

UPLOAD_DIRS="${1:-/var/www/uploads /var/www/frontend/public}"

echo -e "${YELLOW}This will strip metadata from all files in:${NC}"
echo "$UPLOAD_DIRS"
echo ""
read -p "Continue? (y/N) " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

TOTAL=0
PROCESSED=0

for dir in $UPLOAD_DIRS; do
    if [ -d "$dir" ]; then
        echo ""
        echo "Processing: $dir"
        
        find "$dir" -type f \( \
            -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o \
            -iname "*.gif" -o -iname "*.pdf" -o -iname "*.docx" \
        \) | while read -r file; do
            TOTAL=$((TOTAL + 1))
            echo -n "."
            strip-metadata "$file" > /dev/null 2>&1 && PROCESSED=$((PROCESSED + 1))
        done
        
        echo ""
    fi
done

echo ""
echo -e "${GREEN}Complete! Processed files in specified directories.${NC}"
EOF
chmod +x /usr/local/bin/strip-all-uploads

echo -e "${GREEN}✓ Bulk processing tools created${NC}"

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  Metadata Stripping Setup Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${BLUE}Why this matters:${NC}"
echo "  - Photos contain GPS coordinates (location leak)"
echo "  - Documents contain author names, edit history"
echo "  - Camera info can identify device/person"
echo ""
echo -e "${BLUE}Commands:${NC}"
echo "  strip-metadata <file>    - Strip metadata from file"
echo "  strip-metadata -r <dir>  - Strip recursively"
echo "  view-metadata <file>     - View file metadata"
echo "  strip-all-uploads        - Bulk process all uploads"
echo ""
echo -e "${BLUE}Automatic Processing:${NC}"
echo "  1. Edit /etc/systemd/system/metadata-watcher.service"
echo "  2. Set WATCH_DIRS to your upload directories"
echo "  3. Run: systemctl start metadata-watcher"
echo ""
echo -e "${YELLOW}Recommendation:${NC}"
echo "  Run 'strip-all-uploads' once to clean existing files"
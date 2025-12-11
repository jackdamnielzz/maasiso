#!/bin/bash
#############################################
# Encrypted Backup System (3-2-1 Rule)
# Purpose: Secure, encrypted backups with offsite copy
# Run as: sudo bash 15-encrypted-backups.sh
#############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Encrypted Backup System Setup${NC}"
echo -e "${YELLOW}  (3-2-1 Backup Rule Implementation)${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Run as root: sudo bash $0${NC}"
    exit 1
fi

# Step 1: Install required tools
echo -e "${BLUE}[1/5] Installing backup tools...${NC}"
apt-get update -qq
apt-get install -y gnupg2 restic rclone pigz
echo -e "${GREEN}✓ Tools installed (gpg, restic, rclone)${NC}"

# Step 2: Create backup directories
echo ""
echo -e "${BLUE}[2/5] Creating backup directories...${NC}"

mkdir -p /var/backups/maasiso/{daily,weekly,monthly}
mkdir -p /var/backups/maasiso/encrypted
mkdir -p /var/log/backups
chmod 700 /var/backups/maasiso

echo -e "${GREEN}✓ Backup directories created${NC}"

# Step 3: Generate encryption key
echo ""
echo -e "${BLUE}[3/5] Setting up encryption...${NC}"

BACKUP_KEY_FILE="/root/.backup-encryption-key"
if [ ! -f "$BACKUP_KEY_FILE" ]; then
    # Generate a strong random key
    openssl rand -base64 32 > "$BACKUP_KEY_FILE"
    chmod 600 "$BACKUP_KEY_FILE"
    echo -e "${GREEN}✓ Encryption key generated${NC}"
    echo -e "${RED}IMPORTANT: Backup this key securely: $BACKUP_KEY_FILE${NC}"
    echo -e "${RED}Without it, you CANNOT restore your backups!${NC}"
else
    echo -e "${YELLOW}Encryption key already exists${NC}"
fi

# Step 4: Create backup scripts
echo ""
echo -e "${BLUE}[4/5] Creating backup scripts...${NC}"

# Main backup script
cat > /usr/local/bin/backup-maasiso << 'BACKUP_SCRIPT'
#!/bin/bash
#############################################
# MaasISO Encrypted Backup Script
# Usage: backup-maasiso [full|db|files|config]
#############################################

set -e

# Configuration
BACKUP_DIR="/var/backups/maasiso"
ENCRYPTION_KEY=$(cat /root/.backup-encryption-key)
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/backups/backup-${DATE}.log"
RETENTION_DAYS=30

# Directories to backup
WEB_DIRS="/var/www"
CONFIG_DIRS="/etc/nginx /etc/ssh /etc/systemd/system"
DATA_DIRS="/var/lib/strapi /var/lib/postgresql"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

encrypt_file() {
    local input="$1"
    local output="$2"
    openssl enc -aes-256-cbc -salt -pbkdf2 -in "$input" -out "$output" -pass pass:"$ENCRYPTION_KEY"
}

backup_database() {
    log "Starting database backup..."
    
    # PostgreSQL (Strapi)
    if command -v pg_dump &> /dev/null; then
        PGDUMP_FILE="${BACKUP_DIR}/daily/strapi_db_${DATE}.sql"
        sudo -u postgres pg_dumpall > "$PGDUMP_FILE" 2>/dev/null || {
            log "PostgreSQL dump skipped (not available)"
        }
        if [ -f "$PGDUMP_FILE" ]; then
            pigz "$PGDUMP_FILE"
            encrypt_file "${PGDUMP_FILE}.gz" "${BACKUP_DIR}/encrypted/strapi_db_${DATE}.sql.gz.enc"
            rm -f "${PGDUMP_FILE}.gz"
            log "Database backup completed and encrypted"
        fi
    else
        log "PostgreSQL not found, skipping database backup"
    fi
}

backup_files() {
    log "Starting file backup..."
    
    # Web files
    ARCHIVE_FILE="${BACKUP_DIR}/daily/web_files_${DATE}.tar.gz"
    tar -czf "$ARCHIVE_FILE" $WEB_DIRS 2>/dev/null || {
        log "Some files could not be included in backup"
    }
    encrypt_file "$ARCHIVE_FILE" "${BACKUP_DIR}/encrypted/web_files_${DATE}.tar.gz.enc"
    rm -f "$ARCHIVE_FILE"
    
    log "File backup completed and encrypted"
}

backup_config() {
    log "Starting config backup..."
    
    CONFIG_ARCHIVE="${BACKUP_DIR}/daily/configs_${DATE}.tar.gz"
    tar -czf "$CONFIG_ARCHIVE" $CONFIG_DIRS 2>/dev/null || true
    encrypt_file "$CONFIG_ARCHIVE" "${BACKUP_DIR}/encrypted/configs_${DATE}.tar.gz.enc"
    rm -f "$CONFIG_ARCHIVE"
    
    log "Config backup completed and encrypted"
}

cleanup_old() {
    log "Cleaning up old backups (keeping $RETENTION_DAYS days)..."
    find "${BACKUP_DIR}/encrypted" -type f -mtime +${RETENTION_DAYS} -delete
    find "${BACKUP_DIR}/daily" -type f -mtime +7 -delete
    log "Cleanup completed"
}

verify_backup() {
    local backup_file="$1"
    log "Verifying backup integrity: $backup_file"
    
    # Test decryption
    openssl enc -aes-256-cbc -d -pbkdf2 -in "$backup_file" -pass pass:"$ENCRYPTION_KEY" | pigz -t 2>/dev/null
    if [ $? -eq 0 ]; then
        log "✓ Backup verified successfully"
        return 0
    else
        log "✗ Backup verification FAILED"
        return 1
    fi
}

case "$1" in
    full)
        log "=== Starting FULL backup ==="
        backup_database
        backup_files
        backup_config
        cleanup_old
        log "=== FULL backup completed ==="
        ;;
    db)
        log "=== Starting database backup ==="
        backup_database
        log "=== Database backup completed ==="
        ;;
    files)
        log "=== Starting file backup ==="
        backup_files
        log "=== File backup completed ==="
        ;;
    config)
        log "=== Starting config backup ==="
        backup_config
        log "=== Config backup completed ==="
        ;;
    verify)
        if [ -z "$2" ]; then
            echo "Usage: backup-maasiso verify <backup_file>"
            exit 1
        fi
        verify_backup "$2"
        ;;
    list)
        echo "=== Encrypted Backups ==="
        ls -lh ${BACKUP_DIR}/encrypted/ 2>/dev/null || echo "No backups found"
        ;;
    *)
        echo "MaasISO Backup System"
        echo ""
        echo "Usage: backup-maasiso [command]"
        echo ""
        echo "Commands:"
        echo "  full    - Full backup (database + files + config)"
        echo "  db      - Database backup only"
        echo "  files   - Web files backup only"
        echo "  config  - Configuration files backup only"
        echo "  verify  - Verify a backup file"
        echo "  list    - List existing backups"
        echo ""
        ;;
esac
BACKUP_SCRIPT
chmod +x /usr/local/bin/backup-maasiso

# Restore script
cat > /usr/local/bin/restore-maasiso << 'RESTORE_SCRIPT'
#!/bin/bash
#############################################
# MaasISO Backup Restore Script
# Usage: restore-maasiso <backup_file> <destination>
#############################################

set -e

ENCRYPTION_KEY=$(cat /root/.backup-encryption-key)

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: restore-maasiso <encrypted_backup_file> <destination_dir>"
    echo ""
    echo "Example:"
    echo "  restore-maasiso /var/backups/maasiso/encrypted/web_files_20251209.tar.gz.enc /tmp/restore/"
    exit 1
fi

BACKUP_FILE="$1"
DEST_DIR="$2"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

mkdir -p "$DEST_DIR"

echo "Decrypting and extracting backup..."
echo "From: $BACKUP_FILE"
echo "To: $DEST_DIR"

# Decrypt and extract
openssl enc -aes-256-cbc -d -pbkdf2 -in "$BACKUP_FILE" -pass pass:"$ENCRYPTION_KEY" | tar -xzf - -C "$DEST_DIR"

echo ""
echo "Restore completed to: $DEST_DIR"
echo "Review the contents before moving to production locations."
RESTORE_SCRIPT
chmod +x /usr/local/bin/restore-maasiso

echo -e "${GREEN}✓ Backup scripts created${NC}"

# Step 5: Schedule automatic backups
echo ""
echo -e "${BLUE}[5/5] Setting up scheduled backups...${NC}"

# Daily backup cron
cat > /etc/cron.d/maasiso-backup << 'EOF'
# MaasISO Automated Backups
# Daily full backup at 3 AM
0 3 * * * root /usr/local/bin/backup-maasiso full >> /var/log/backups/cron.log 2>&1

# Hourly config backup (lightweight)
0 * * * * root /usr/local/bin/backup-maasiso config >> /var/log/backups/cron-hourly.log 2>&1
EOF

echo -e "${GREEN}✓ Scheduled backups configured${NC}"

# Run initial backup
echo ""
echo -e "${YELLOW}Running initial backup...${NC}"
/usr/local/bin/backup-maasiso config

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}  Encrypted Backup System Complete!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo -e "${BLUE}3-2-1 Rule Implementation:${NC}"
echo "  3 copies: Original + local encrypted + (configure offsite)"
echo "  2 media types: Server disk + encrypted archive"
echo "  1 offsite: Configure rclone for cloud backup"
echo ""
echo -e "${BLUE}Commands:${NC}"
echo "  backup-maasiso full     - Run full backup"
echo "  backup-maasiso list     - List backups"
echo "  backup-maasiso verify   - Verify backup integrity"
echo "  restore-maasiso <file> <dir> - Restore backup"
echo ""
echo -e "${BLUE}Schedule:${NC}"
echo "  Daily at 3 AM: Full backup"
echo "  Hourly: Config backup"
echo ""
echo -e "${RED}CRITICAL: Save the encryption key!${NC}"
echo "  Location: /root/.backup-encryption-key"
echo "  Copy this key to a secure offline location!"
echo ""
echo -e "${YELLOW}For offsite backup (3-2-1 rule), configure rclone:${NC}"
echo "  rclone config  # Set up cloud storage"
echo "  Then add to cron: rclone sync /var/backups/maasiso/encrypted remote:backups/"
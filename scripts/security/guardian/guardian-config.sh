#!/bin/bash
#
# Guardian Security System - Central Configuration
# ================================================
# All Guardian scripts source this file for configuration
#
# Created: December 10, 2025
# Version: 2.0
#

# =============================================================================
# EMAIL ALERTING - AGGRESSIVE MODE
# =============================================================================

# Primary alert recipients - BOTH receive ALL alerts
ALERT_EMAIL_PRIMARY="niels.maas@maasiso.nl"
ALERT_EMAIL_SECONDARY="niels_maas@hotmail.com"

# Hourly/Daily digest email
DIGEST_EMAIL="niels.maas@maasiso.nl"

# =============================================================================
# SMS/PUSHOVER - FOR CRITICAL ALERTS
# =============================================================================
# Get your keys from https://pushover.net/

PUSHOVER_TOKEN=""           # Your Pushover Application Token
PUSHOVER_USER=""            # Your Pushover User Key
SMS_PHONE="+31623578344"    # Your phone number

# =============================================================================
# SLACK WEBHOOK (Optional)
# =============================================================================

SLACK_WEBHOOK=""

# =============================================================================
# SERVER IDENTIFICATION
# =============================================================================

FRONTEND_IP="147.93.62.188"
BACKEND_IP="153.92.223.23"
FRONTEND_DOMAIN="maasiso.nl"
BACKEND_DOMAIN="api.maasiso.nl"

# Auto-detect which server we're on
detect_server() {
    local current_ip
    current_ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    
    case "$current_ip" in
        147.93.62.188*)
            SERVER_ROLE="frontend"
            SERVER_NAME="Frontend VPS"
            ;;
        153.92.223.23*)
            SERVER_ROLE="backend"
            SERVER_NAME="Backend VPS (Strapi)"
            ;;
        *)
            if hostname | grep -qi "strapi\|backend\|cms"; then
                SERVER_ROLE="backend"
                SERVER_NAME="Backend VPS (Strapi)"
            else
                SERVER_ROLE="frontend"
                SERVER_NAME="Frontend VPS"
            fi
            ;;
    esac
}

detect_server
HOSTNAME=$(hostname)
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}')

# =============================================================================
# ALERTING THRESHOLDS
# =============================================================================

# CPU Thresholds
CPU_INFO=30         # Info alert
CPU_WARNING=50      # Warning alert
CPU_ALERT=70        # Alert level
CPU_CRITICAL=90     # Critical - possible attack

# Memory Thresholds
MEM_WARNING=70
MEM_CRITICAL=90

# Disk Thresholds
DISK_WARNING=70
DISK_CRITICAL=85

# Website Response Thresholds (seconds)
RESPONSE_INFO=1
RESPONSE_WARNING=3
RESPONSE_ALERT=5
RESPONSE_CRITICAL=10

# SSH Thresholds
SSH_FAILED_WARNING=5
SSH_FAILED_CRITICAL=20

# =============================================================================
# EMAIL THROTTLING (Anti-spam)
# =============================================================================

# Minimum seconds between same alert type
THROTTLE_INFO=300       # 5 minutes
THROTTLE_WARNING=60     # 1 minute
THROTTLE_CRITICAL=0     # No throttle - always send

# Maximum emails per hour per level
MAX_INFO_PER_HOUR=30
MAX_WARNING_PER_HOUR=100
MAX_CRITICAL_PER_HOUR=999  # Unlimited

# =============================================================================
# MONITORING TARGETS
# =============================================================================

# Websites to check (from backend server)
WEBSITES=(
    "https://maasiso.nl"
    "https://www.maasiso.nl"
    "https://api.maasiso.nl"
)

# Expected content on homepage (to detect defacement)
HOMEPAGE_EXPECTED_CONTENT="MaasISO"

# =============================================================================
# MALWARE DETECTION
# =============================================================================

# Known malware directories to check
MALWARE_DIRECTORIES=(
    "/etc/de"
    "/root/.sshds"
    "/root/.local/share/.05bf0e9b"
    "/lib/systemd/system-next"
    "/tmp/.X11-unix/.X0"
    "/var/tmp/.hidden"
    "/dev/shm/.X"
    "/tmp/.ICE-unix"
    "/tmp/.font-unix"
)

# Known C2 IPs
C2_IPS=(
    "35.173.69.207"
)

# Malicious domains
MALICIOUS_DOMAINS=(
    "c3pool.org"
    "pool.hashvault.pro"
    "pub-dc84e32afcfa417fa04d36454032549b.r2.dev"
    "xss.pro"
    "xss.is"
)

# Known malware wallet addresses
MALWARE_WALLETS=(
    "46d2vayVr8k8yH6YKLBsDsY8PNo2oqK7xeCiuECsLAsiTBiqNt6nkMPHQfi1vHTRzmAQyS9spDsnHcBnoeyxgVD1HLNNsLB"
)

# Suspicious process names
SUSPICIOUS_PROCESSES=(
    "xmrig"
    "minerd"
    "cpuminer"
    "cryptonight"
    "stratum"
    "kworkerds"
    "kthreaddi"
    "cX86"
    "cARM"
    "\.sshd"
)

# Whitelisted high-CPU processes
WHITELIST_PROCESSES=(
    "node"
    "npm"
    "next-server"
    "strapi"
    "postgres"
    "nginx"
    "clamscan"
    "freshclam"
)

# =============================================================================
# SSH WHITELIST
# =============================================================================

FRONTEND_SSH_WHITELIST=(
    "niels_maas@hotmail.com"
    "#hostinger-managed-key"
)

BACKEND_SSH_WHITELIST=(
    "niels@PCNiels"
    "maasiso@vps1.hostinger.com MaasISO Deploy Key"
    "maasiso_vps"
    "niels_maas@hotmail.com"
)

# =============================================================================
# SERVICE MONITORING
# =============================================================================

# Services to monitor on Frontend
FRONTEND_SERVICES=(
    "nginx"
    "fail2ban"
    "clamav-freshclam"
)

FRONTEND_PM2_APPS=(
    "frontend"
    "iso-selector"
)

# Services to monitor on Backend
BACKEND_SERVICES=(
    "nginx"
    "postgresql"
    "fail2ban"
    "clamav-freshclam"
)

BACKEND_PM2_APPS=(
    "strapi"
)

# =============================================================================
# FILE INTEGRITY
# =============================================================================

# Critical files to hash-check
CRITICAL_FILES=(
    "/etc/nginx/nginx.conf"
    "/etc/passwd"
    "/etc/shadow"
    "/etc/sudoers"
    "/root/.ssh/authorized_keys"
)

# Directories to watch for new files
WATCH_DIRECTORIES=(
    "/tmp"
    "/dev/shm"
    "/var/tmp"
    "/etc/cron.d"
    "/etc/systemd/system"
)

# Allowed hidden directories in /root
ALLOWED_HIDDEN_DIRS=(
    ".ssh"
    ".cache"
    ".config"
    ".local"
    ".npm"
    ".pm2"
    ".gnupg"
    ".bashrc"
    ".profile"
    ".bash_history"
    ".viminfo"
    ".wget-hsts"
    ".lesshst"
)

# =============================================================================
# LOG PATHS
# =============================================================================

GUARDIAN_DIR="/opt/guardian"
LOG_DIR="/var/log/guardian"
STATE_DIR="/var/lib/guardian"

# Log files
MAIN_LOG="${LOG_DIR}/guardian.log"
ALERT_LOG="${LOG_DIR}/alerts.log"
PROCESS_LOG="${LOG_DIR}/process.log"
NETWORK_LOG="${LOG_DIR}/network.log"
FILES_LOG="${LOG_DIR}/files.log"
AUTH_LOG="${LOG_DIR}/auth.log"
WEBSITE_LOG="${LOG_DIR}/website.log"
DIGEST_LOG="${LOG_DIR}/digest.log"

# State files
THROTTLE_STATE="${STATE_DIR}/throttle"
BASELINE_DIR="${STATE_DIR}/baselines"
HASH_DIR="${STATE_DIR}/hashes"

# =============================================================================
# CRON PATTERNS (Malicious)
# =============================================================================

CRON_MALWARE_PATTERNS=(
    'wget.*\|.*bash'
    'curl.*\|.*bash'
    'wget.*\|.*sh'
    'curl.*\|.*sh'
    '/dev/null.*2>&1.*&'
    'base64.*-d'
    'xmrig'
    'minerd'
    'cpuminer'
    'stratum'
    'c3pool'
    'hashvault'
)

# =============================================================================
# AUTO-REMEDIATION SETTINGS
# =============================================================================

# Enable automatic actions
AUTO_KILL_SUSPICIOUS=true
AUTO_BLOCK_IPS=true
AUTO_REMOVE_MALWARE=true
AUTO_RESTORE_CRON=true
AUTO_RESTART_SERVICES=true

# =============================================================================
# EXPORT ALL VARIABLES
# =============================================================================

export ALERT_EMAIL_PRIMARY ALERT_EMAIL_SECONDARY DIGEST_EMAIL
export PUSHOVER_TOKEN PUSHOVER_USER SMS_PHONE SLACK_WEBHOOK
export SERVER_ROLE SERVER_NAME HOSTNAME SERVER_IP
export FRONTEND_IP BACKEND_IP FRONTEND_DOMAIN BACKEND_DOMAIN
export GUARDIAN_DIR LOG_DIR STATE_DIR
#!/bin/bash
#
# Security Monitor Configuration File
# ====================================
# This file contains all configuration for the enhanced security monitoring system.
# Source this file in 20-enhanced-security-monitor.sh
#
# Created: December 9, 2025
# Purpose: Post-incident monitoring after cryptominer/redirect attack
#

# =============================================================================
# ALERT RECIPIENTS
# =============================================================================

# Problem/Critical Alerts - Both emails receive alerts
ALERT_EMAIL_PRIMARY="niels.maas@maasiso.nl"
ALERT_EMAIL_SECONDARY="niels_maas@hotmail.com"

# Hourly Status Reports - Single email only
HOURLY_REPORT_EMAIL="niels.maas@maasiso.nl"

# =============================================================================
# SMS ALERTING VIA PUSHOVER
# =============================================================================
# To enable SMS alerts:
# 1. Create account at https://pushover.net/
# 2. Create an Application to get PUSHOVER_TOKEN
# 3. Copy your User Key as PUSHOVER_USER
# 4. Optionally configure SMS delivery in Pushover settings

PUSHOVER_TOKEN=""      # Your Pushover Application Token
PUSHOVER_USER=""       # Your Pushover User Key
SMS_PHONE="+31623578344"

# =============================================================================
# OPTIONAL SLACK INTEGRATION
# =============================================================================
# Create an Incoming Webhook in Slack and paste URL here
SLACK_WEBHOOK=""

# =============================================================================
# SERVER IDENTIFICATION
# =============================================================================

# Detect which server we're on (frontend vs backend)
detect_server_role() {
    local current_ip
    current_ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    
    case "$current_ip" in
        147.93.62.188*)
            echo "frontend"
            ;;
        153.92.223.23*)
            echo "backend"
            ;;
        *)
            # Fallback: check hostname
            if hostname | grep -qi "strapi\|backend\|cms"; then
                echo "backend"
            else
                echo "frontend"
            fi
            ;;
    esac
}

SERVER_ROLE=$(detect_server_role)
HOSTNAME=$(hostname)
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}')

# =============================================================================
# SSH KEY WHITELISTS
# =============================================================================
# These are the ONLY allowed SSH key comments in authorized_keys
# Any other keys will trigger a CRITICAL alert

# Frontend VPS (147.93.62.188) authorized keys
FRONTEND_SSH_WHITELIST=(
    "niels_maas@hotmail.com"
    "#hostinger-managed-key"
)

# Backend VPS (153.92.223.23) authorized keys
BACKEND_SSH_WHITELIST=(
    "niels@PCNiels"
    "maasiso@vps1.hostinger.com MaasISO Deploy Key"
    "maasiso_vps"
    "niels_maas@hotmail.com"
)

# =============================================================================
# KNOWN-GOOD NGINX CONFIG HASHES
# =============================================================================
# Generate with: sha256sum /etc/nginx/nginx.conf | awk '{print $1}'
# Update these after any legitimate nginx config change

# Frontend nginx config hash (main config)
FRONTEND_NGINX_HASH=""

# Frontend sites-enabled hash
FRONTEND_SITES_HASH=""

# Backend nginx config hash  
BACKEND_NGINX_HASH=""

# =============================================================================
# KNOWN MALWARE DIRECTORIES (from Dec 9, 2025 incident)
# =============================================================================

MALWARE_DIRECTORIES=(
    "/root/.sshds"
    "/root/.local/share/.05bf0e9b"
    "/lib/systemd/system-next"
    "/tmp/.X11-unix/.X0"
    "/var/tmp/.hidden"
    "/dev/shm/.X"
)

# =============================================================================
# INDICATORS OF COMPROMISE (IOCs)
# =============================================================================

# Known bad C2 IPs
C2_IPS=(
    "35.173.69.207"
)

# Known malicious domains
MALICIOUS_DOMAINS=(
    "c3pool.org"
    "pool.hashvault.pro"
    "pub-dc84e32afcfa417fa04d36454032549b.r2.dev"
    "whale-corps-dev"
    "xss.pro"
    "xss.is"
)

# Known Monero wallet used by attacker
MALICIOUS_WALLETS=(
    "46d2vayVr8k8yH6YKLBsDsY8PNo2oqK7xeCiuECsLAsiTBiqNt6nkMPHQfi1vHTRzmAQyS9spDsnHcBnoeyxgVD1HLNNsLB"
)

# =============================================================================
# SUSPICIOUS PATTERNS
# =============================================================================

# Patterns in cron jobs that indicate malware
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

# Patterns in .bashrc/.profile that indicate infection
PROFILE_MALWARE_PATTERNS=(
    'wget.*\|.*bash'
    'curl.*\|.*bash'
    'nohup.*&'
    '/tmp/.*&'
    'hidden'
    '.sshd'
    'base64.*-d'
)

# Suspicious systemd service names
SUSPICIOUS_SERVICE_PATTERNS=(
    'sshds'
    'system-next'
    'kworker'
    'kthreadd'
    'migration'
    'crypto'
    'miner'
    'xmr'
)

# =============================================================================
# WHITELISTED HIDDEN DIRECTORIES IN /root
# =============================================================================
# These dot-directories are normal and should NOT trigger alerts

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
# MONITORING THRESHOLDS
# =============================================================================

# CPU threshold for crypto miner detection (percentage)
CPU_THRESHOLD=80

# Maximum allowed SSH keys (alert if exceeded)
MAX_SSH_KEYS=5

# =============================================================================
# LOG PATHS
# =============================================================================

LOG_DIR="/var/log/security-monitor"
MAIN_LOG="${LOG_DIR}/monitor.log"
ALERT_LOG="${LOG_DIR}/alerts.log"
HOURLY_REPORT_LOG="${LOG_DIR}/hourly-reports.log"

# State files for tracking
STATE_DIR="/var/lib/security-monitor"
LAST_ALERT_FILE="${STATE_DIR}/last_alert"
ALERT_HISTORY="${STATE_DIR}/alert_history"

# =============================================================================
# HELPER: GET SSH WHITELIST FOR CURRENT SERVER
# =============================================================================

get_ssh_whitelist() {
    if [[ "$SERVER_ROLE" == "backend" ]]; then
        echo "${BACKEND_SSH_WHITELIST[@]}"
    else
        echo "${FRONTEND_SSH_WHITELIST[@]}"
    fi
}

# =============================================================================
# HELPER: GET NGINX HASH FOR CURRENT SERVER
# =============================================================================

get_expected_nginx_hash() {
    if [[ "$SERVER_ROLE" == "backend" ]]; then
        echo "$BACKEND_NGINX_HASH"
    else
        echo "$FRONTEND_NGINX_HASH"
    fi
}

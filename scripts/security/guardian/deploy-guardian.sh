#!/bin/bash
#
# Guardian Security System - Deployment Script
# =============================================
# Deploys all Guardian scripts to a VPS server
#
# Usage:
#   ./deploy-guardian.sh                    # Deploy locally
#   ./deploy-guardian.sh --remote <host>    # Deploy to remote host
#
# Created: December 10, 2025
# Version: 2.0
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE_HOST=""
GUARDIAN_INSTALL_DIR="/opt/guardian"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --remote)
            REMOTE_HOST="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# =============================================================================
# LOCAL DEPLOYMENT
# =============================================================================

deploy_local() {
    echo "=========================================="
    echo "  Guardian Security System - Local Deploy"
    echo "=========================================="
    echo ""
    
    # Create directories
    echo "[1/7] Creating directories..."
    mkdir -p "$GUARDIAN_INSTALL_DIR"
    mkdir -p /var/log/guardian
    mkdir -p /var/lib/guardian
    mkdir -p /var/lib/guardian/throttle
    mkdir -p /var/lib/guardian/baselines
    mkdir -p /var/lib/guardian/hashes
    
    chmod 700 /var/log/guardian /var/lib/guardian
    
    # Copy scripts
    echo "[2/7] Copying Guardian scripts..."
    cp "${SCRIPT_DIR}/guardian-config.sh" "$GUARDIAN_INSTALL_DIR/"
    cp "${SCRIPT_DIR}/guardian-alert-lib.sh" "$GUARDIAN_INSTALL_DIR/"
    cp "${SCRIPT_DIR}/guardian-process.sh" "$GUARDIAN_INSTALL_DIR/"
    cp "${SCRIPT_DIR}/guardian-network.sh" "$GUARDIAN_INSTALL_DIR/"
    cp "${SCRIPT_DIR}/guardian-files.sh" "$GUARDIAN_INSTALL_DIR/"
    cp "${SCRIPT_DIR}/guardian-cron.sh" "$GUARDIAN_INSTALL_DIR/"
    cp "${SCRIPT_DIR}/guardian-services.sh" "$GUARDIAN_INSTALL_DIR/"
    cp "${SCRIPT_DIR}/guardian-website.sh" "$GUARDIAN_INSTALL_DIR/"
    cp "${SCRIPT_DIR}/guardian-auth.sh" "$GUARDIAN_INSTALL_DIR/"
    cp "${SCRIPT_DIR}/guardian-deep-scan.sh" "$GUARDIAN_INSTALL_DIR/"
    
    chmod +x "$GUARDIAN_INSTALL_DIR"/*.sh
    
    # Install systemd services and timers
    echo "[3/7] Installing systemd services..."
    
    # Guardian Process Monitor (every 10 seconds)
    cat > /etc/systemd/system/guardian-process.service << 'EOF'
[Unit]
Description=Guardian Process Monitor
After=network.target

[Service]
Type=oneshot
ExecStart=/opt/guardian/guardian-process.sh
StandardOutput=append:/var/log/guardian/process.log
StandardError=append:/var/log/guardian/process.log
EOF

    cat > /etc/systemd/system/guardian-process.timer << 'EOF'
[Unit]
Description=Run Guardian Process Monitor every 10 seconds

[Timer]
OnBootSec=30
OnUnitActiveSec=10
AccuracySec=1s

[Install]
WantedBy=timers.target
EOF

    # Guardian Network Monitor (every 30 seconds)
    cat > /etc/systemd/system/guardian-network.service << 'EOF'
[Unit]
Description=Guardian Network Monitor
After=network.target

[Service]
Type=oneshot
ExecStart=/opt/guardian/guardian-network.sh
StandardOutput=append:/var/log/guardian/network.log
StandardError=append:/var/log/guardian/network.log
EOF

    cat > /etc/systemd/system/guardian-network.timer << 'EOF'
[Unit]
Description=Run Guardian Network Monitor every 30 seconds

[Timer]
OnBootSec=45
OnUnitActiveSec=30
AccuracySec=1s

[Install]
WantedBy=timers.target
EOF

    # Guardian Website Monitor (every 30 seconds) - Backend only
    cat > /etc/systemd/system/guardian-website.service << 'EOF'
[Unit]
Description=Guardian Website Monitor
After=network.target

[Service]
Type=oneshot
ExecStart=/opt/guardian/guardian-website.sh
StandardOutput=append:/var/log/guardian/website.log
StandardError=append:/var/log/guardian/website.log
EOF

    cat > /etc/systemd/system/guardian-website.timer << 'EOF'
[Unit]
Description=Run Guardian Website Monitor every 30 seconds

[Timer]
OnBootSec=60
OnUnitActiveSec=30
AccuracySec=1s

[Install]
WantedBy=timers.target
EOF

    # Setup cron jobs
    echo "[4/7] Setting up cron jobs..."
    
    # Remove existing guardian cron entries
    crontab -l 2>/dev/null | grep -v "guardian-" > /tmp/crontab.tmp || true
    
    # Add new entries
    cat >> /tmp/crontab.tmp << 'EOF'
# Guardian Security System
* * * * * /opt/guardian/guardian-services.sh >> /var/log/guardian/services.log 2>&1
* * * * * /opt/guardian/guardian-files.sh >> /var/log/guardian/files.log 2>&1
*/2 * * * * /opt/guardian/guardian-cron.sh >> /var/log/guardian/cron.log 2>&1
*/5 * * * * /opt/guardian/guardian-auth.sh >> /var/log/guardian/auth.log 2>&1
*/15 * * * * /opt/guardian/guardian-deep-scan.sh >> /var/log/guardian/deep-scan.log 2>&1
EOF
    
    crontab /tmp/crontab.tmp
    rm /tmp/crontab.tmp
    
    # Enable and start timers
    echo "[5/7] Enabling systemd timers..."
    systemctl daemon-reload
    
    systemctl enable guardian-process.timer
    systemctl enable guardian-network.timer
    
    # Detect server role and enable website monitoring only on backend
    local server_ip=$(hostname -I | awk '{print $1}')
    if [[ "$server_ip" == "153.92.223.23"* ]]; then
        echo "Backend server detected - enabling website monitoring"
        systemctl enable guardian-website.timer
        systemctl start guardian-website.timer
    else
        echo "Frontend server detected - website monitoring disabled (runs on backend)"
    fi
    
    systemctl start guardian-process.timer
    systemctl start guardian-network.timer
    
    # Setup log rotation
    echo "[6/7] Setting up log rotation..."
    cat > /etc/logrotate.d/guardian << 'EOF'
/var/log/guardian/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
}
EOF

    # Verify installation
    echo "[7/7] Verifying installation..."
    echo ""
    echo "Guardian scripts installed:"
    ls -la "$GUARDIAN_INSTALL_DIR"
    echo ""
    echo "Systemd timers:"
    systemctl list-timers | grep guardian
    echo ""
    echo "Cron jobs:"
    crontab -l | grep guardian
    echo ""
    
    echo "=========================================="
    echo "  Guardian Security System Deployed!"
    echo "=========================================="
    echo ""
    echo "Directories:"
    echo "  Scripts: $GUARDIAN_INSTALL_DIR"
    echo "  Logs:    /var/log/guardian/"
    echo "  State:   /var/lib/guardian/"
    echo ""
    echo "Monitoring Schedule:"
    echo "  Process:  Every 10 seconds (systemd timer)"
    echo "  Network:  Every 30 seconds (systemd timer)"
    echo "  Website:  Every 30 seconds (backend only)"
    echo "  Services: Every minute (cron)"
    echo "  Files:    Every minute (cron)"
    echo "  Cron:     Every 2 minutes (cron)"
    echo "  Auth:     Every 5 minutes (cron)"
    echo "  Deep:     Every 15 minutes (cron)"
    echo ""
    echo "Test commands:"
    echo "  /opt/guardian/guardian-process.sh"
    echo "  /opt/guardian/guardian-services.sh"
    echo ""
    echo "View logs:"
    echo "  tail -f /var/log/guardian/guardian.log"
    echo ""
}

# =============================================================================
# REMOTE DEPLOYMENT
# =============================================================================

deploy_remote() {
    local host="$1"
    
    echo "=========================================="
    echo "  Guardian Security System - Remote Deploy"
    echo "  Target: $host"
    echo "=========================================="
    echo ""
    
    # Create temp directory for files
    local temp_dir=$(mktemp -d)
    
    # Copy all guardian files to temp
    cp "${SCRIPT_DIR}/"guardian-*.sh "$temp_dir/"
    cp "${SCRIPT_DIR}/deploy-guardian.sh" "$temp_dir/"
    
    # Transfer files
    echo "Transferring files to $host..."
    scp -r "$temp_dir"/* "root@$host:/tmp/guardian-deploy/"
    
    # Run deployment on remote
    echo "Running deployment on $host..."
    ssh "root@$host" "chmod +x /tmp/guardian-deploy/*.sh && /tmp/guardian-deploy/deploy-guardian.sh && rm -rf /tmp/guardian-deploy"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    echo ""
    echo "Remote deployment complete!"
}

# =============================================================================
# MAIN
# =============================================================================

if [[ -n "$REMOTE_HOST" ]]; then
    deploy_remote "$REMOTE_HOST"
else
    deploy_local
fi
#!/bin/bash
# ==============================================================================
# MAASISO SECURITY TEST TEMPLATE
# Template: fake-sex.sh (Safe simulation of malware installer)
# 
# This is a TEMPLATE file for attack simulation testing.
# Based on the December 2025 cryptocurrency mining incident.
# 
# The original "sex.sh" was the initial malware installer found in:
# /var/www/frontend/.next/standalone/sex.sh
# 
# WARNING: This file is for EDUCATIONAL and TESTING purposes ONLY.
#          It contains NO actual malicious code.
# ==============================================================================

# ============================================================================
# MAASISO SECURITY TEST - NOT REAL MALWARE
# This script simulates the behavior of the original malware installer
# for security testing purposes. All actions are logged and safe.
# ============================================================================

set -e

echo "============================================================"
echo "MAASISO SECURITY SIMULATION - FAKE MALWARE INSTALLER"
echo "============================================================"
echo ""
echo "This is a SIMULATION of the malware installer (sex.sh)"
echo "discovered during the December 2025 security incident."
echo ""
echo "Original malware behavior that would have occurred:"
echo "------------------------------------------------------------"

# Simulate original malware behavior (SAFE - only prints)
simulate_original_behavior() {
    echo "[SIMULATION] Step 1: Check system architecture..."
    echo "  - Original: Detected x86_64 or ARM architecture"
    echo "  - Original: Selected appropriate miner binary (cX86 or cARM)"
    
    echo ""
    echo "[SIMULATION] Step 2: Download XMRig miner..."
    echo "  - Original: wget/curl from malicious server"
    echo "  - Original: Downloaded to /tmp/kamd64 or similar"
    echo "  - Mining pool: pool.hashvault.pro:443"
    
    echo ""
    echo "[SIMULATION] Step 3: Create persistence directories..."
    echo "  - Original: mkdir -p /etc/de/"
    echo "  - Original: mkdir -p /root/.sshds/"
    echo "  - Original: mkdir -p /root/.local/share/.05bf0e9b/"
    
    echo ""
    echo "[SIMULATION] Step 4: Install miner binaries..."
    echo "  - Original: cp miner /etc/de/cX86"
    echo "  - Original: cp miner /root/.sshds/sshds"
    echo "  - Original: chmod +x /etc/de/cX86"
    
    echo ""
    echo "[SIMULATION] Step 5: Create systemd persistence..."
    echo "  - Original: Created system-update-service.service"
    echo "  - Original: Created sshds_miner.service"
    echo "  - Original: systemctl enable --now services"
    
    echo ""
    echo "[SIMULATION] Step 6: Create cron persistence..."
    echo "  - Original: Added @reboot /etc/de/./cX86"
    echo "  - Original: Added */5 check to restart if killed"
    
    echo ""
    echo "[SIMULATION] Step 7: Start mining..."
    echo "  - Original: Executed miner binary"
    echo "  - Original: Connected to pool.hashvault.pro:443"
    echo "  - Original: Used 80-100% CPU for Monero mining"
    
    echo ""
    echo "[SIMULATION] Step 8: Clean up traces..."
    echo "  - Original: rm /tmp/sex.sh (self-delete)"
    echo "  - Original: rm /tmp/kamd64 (staging cleanup)"
    echo "  - Original: Clear bash history"
}

# Print what the simulation does
echo ""
echo "SAFE SIMULATION ACTIONS:"
echo "------------------------------------------------------------"
echo "1. Print this informational message"
echo "2. Exit without making any system changes"
echo ""

# Run simulation info
simulate_original_behavior

echo ""
echo "============================================================"
echo "SIMULATION COMPLETE - NO ACTUAL CHANGES MADE"
echo "============================================================"
echo ""
echo "To test Guardian detection, use the main simulation script:"
echo "  ./advanced-attack-simulation.sh --full --execute"
echo ""
echo "This template file demonstrates the attack pattern for:"
echo "  - Security awareness training"
echo "  - Incident response documentation"
echo "  - Guardian monitoring configuration"
echo ""

# Exit safely
exit 0

# ==============================================================================
# INDICATORS OF COMPROMISE (IOC) - ORIGINAL MALWARE:
# 
# Files:
#   - /var/www/frontend/.next/standalone/sex.sh
#   - /var/www/frontend/.next/standalone/xmrig-6.24.0/
#   - /etc/de/cX86, /etc/de/cARM
#   - /root/.sshds/sshds
#   - /tmp/kamd64, /tmp/s.sh
# 
# Network:
#   - pool.hashvault.pro:443 (Mining pool)
#   - c3pool.org (Backup pool)
#   - 35.173.69.207 (C2 server)
# 
# Processes:
#   - cX86, cARM (miner binaries)
#   - sshds (disguised miner)
#   - xmrig (if not renamed)
# 
# Services:
#   - system-update-service.service
#   - sshds_miner.service
#   - supdate.service
# 
# Cron:
#   - @reboot entries running /etc/de/cX86
#   - Periodic check/restart entries
# ==============================================================================
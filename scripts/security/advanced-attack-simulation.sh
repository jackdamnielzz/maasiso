#!/bin/bash
#===============================================================================
#
#          FILE: advanced-attack-simulation.sh
#
#         USAGE: ./advanced-attack-simulation.sh [OPTIONS]
#
#   DESCRIPTION: Advanced Attack Simulation Script for MaasISO Security Testing
#                Based on December 2025 cryptocurrency mining incidents
#                
#                This script simulates the EXACT attack patterns observed during
#                the December 5-10, 2025 malware incidents for testing the
#                Guardian monitoring suite detection capabilities.
#
#       OPTIONS: --help, --phase1, --phase2, --phase3, --phase4, --phase5,
#                --phase6, --full, --cleanup, --status, --verify, --execute
#
#  REQUIREMENTS: Root privileges for full simulation
#                Guardian monitoring suite should be running
#
#        AUTHOR: MaasISO Security Team
#       CREATED: 2025-12-10
#       VERSION: 1.0.0
#
#      SECURITY: ALL components are SAFE test versions
#                - All files contain safety markers
#                - Services are created but NOT enabled
#                - Cron entries are commented out
#                - Network activity is DNS lookup only
#                - Processes have timeouts
#
#===============================================================================

set -euo pipefail

#===============================================================================
# CONFIGURATION
#===============================================================================

# Safety marker - unique identifier for all test artifacts
SIMULATION_MARKER="MAASISO-ATTACK-SIMULATION-TEST-$(date +%s)"
SAFETY_TEXT="MAASISO SECURITY TEST - NOT REAL MALWARE - SIMULATION ID: ${SIMULATION_MARKER}"

# Logging
LOG_FILE="/var/log/attack-simulation.log"
LOG_ENABLED=true

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="${SCRIPT_DIR}/templates"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Execution control
EXECUTE_MODE=false
SIMULATE_CPU=false
AUTO_CLEANUP_TIMEOUT=0  # 0 = disabled, otherwise seconds

# Attack simulation paths (based on actual incident)
declare -A MALWARE_PATHS=(
    ["sex_sh"]="/var/www/frontend/.next/standalone/sex.sh"
    ["xmrig_dir"]="/var/www/frontend/.next/standalone/xmrig-6.24.0"
    ["miner_x86"]="/etc/de/cX86"
    ["miner_arm"]="/etc/de/cARM"
    ["staging_bin"]="/tmp/kamd64"
    ["install_script"]="/tmp/s.sh"
)

declare -A HIDDEN_DIRS=(
    ["sshds"]="/root/.sshds"
    ["hash_dir"]="/root/.local/share/.05bf0e9b"
    ["test_marker"]="/root/.test-maasiso-hidden"
)

declare -A SYSTEMD_SERVICES=(
    ["system_update"]="system-update-service.service"
    ["sshds_miner"]="sshds_miner.service"
    ["supdate"]="supdate.service"
)

declare -A NETWORK_IOCS=(
    ["pool1"]="pool.hashvault.pro"
    ["pool2"]="c3pool.org"
    ["c2_server"]="35.173.69.207"
    ["redirect"]="xss.pro"
)

# PID tracking file
PID_FILE="/tmp/attack-simulation-pids"

#===============================================================================
# UTILITY FUNCTIONS
#===============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    if [[ "$LOG_ENABLED" == "true" ]]; then
        echo "[$timestamp] [$level] $message" >> "$LOG_FILE" 2>/dev/null || true
    fi
    
    case "$level" in
        "INFO")    echo -e "${CYAN}[ℹ]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[✓]${NC} $message" ;;
        "WARNING") echo -e "${YELLOW}[!]${NC} $message" ;;
        "ERROR")   echo -e "${RED}[✗]${NC} $message" ;;
        "DEBUG")   echo -e "${PURPLE}[D]${NC} $message" ;;
        "PHASE")   echo -e "${WHITE}[▶]${NC} $message" ;;
    esac
}

print_banner() {
    echo -e "${CYAN}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║     ███╗   ███╗ █████╗  █████╗ ███████╗██╗███████╗ ██████╗                    ║
║     ████╗ ████║██╔══██╗██╔══██╗██╔════╝██║██╔════╝██╔═══██╗                   ║
║     ██╔████╔██║███████║███████║███████╗██║███████╗██║   ██║                   ║
║     ██║╚██╔╝██║██╔══██║██╔══██║╚════██║██║╚════██║██║   ██║                   ║
║     ██║ ╚═╝ ██║██║  ██║██║  ██║███████║██║███████║╚██████╔╝                   ║
║     ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝ ╚═════╝                    ║
║                                                                               ║
║     ADVANCED ATTACK SIMULATION                                                ║
║     Based on December 2025 Cryptocurrency Mining Incidents                    ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

print_warning() {
    echo -e "${YELLOW}"
    cat << 'EOF'
┌───────────────────────────────────────────────────────────────────────────────┐
│  ⚠️  WARNING: This script simulates attack patterns for security testing      │
│                                                                               │
│  • All artifacts are clearly marked as tests                                  │
│  • No actual malware is created or executed                                   │
│  • Systemd services are disabled, not started                                 │
│  • Network activity is DNS lookup only                                        │
│  • Processes have automatic timeouts                                          │
│                                                                               │
│  Use --execute flag to actually run the simulation                            │
└───────────────────────────────────────────────────────────────────────────────┘
EOF
    echo -e "${NC}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log "ERROR" "This script must be run as root for full simulation"
        log "INFO" "Some features may not work without root privileges"
        return 1
    fi
    return 0
}

check_execute_mode() {
    if [[ "$EXECUTE_MODE" != "true" ]]; then
        log "WARNING" "Dry-run mode: Use --execute flag to actually create artifacts"
        return 1
    fi
    return 0
}

create_directory() {
    local dir="$1"
    if check_execute_mode; then
        mkdir -p "$dir" 2>/dev/null || true
        log "SUCCESS" "Created directory: $dir"
    else
        log "INFO" "[DRY-RUN] Would create directory: $dir"
    fi
}

create_file_with_marker() {
    local file="$1"
    local content="$2"
    local dir=$(dirname "$file")
    
    if check_execute_mode; then
        mkdir -p "$dir" 2>/dev/null || true
        cat > "$file" << EOF
# ============================================================================
# ${SAFETY_TEXT}
# Created: $(date '+%Y-%m-%d %H:%M:%S')
# ============================================================================

${content}

# ============================================================================
# END OF SIMULATION FILE
# This file was created by advanced-attack-simulation.sh
# Safe to delete - run: ./advanced-attack-simulation.sh --cleanup
# ============================================================================
EOF
        chmod 644 "$file" 2>/dev/null || true
        log "SUCCESS" "Created test file: $file"
    else
        log "INFO" "[DRY-RUN] Would create file: $file"
    fi
}

track_pid() {
    local pid="$1"
    echo "$pid" >> "$PID_FILE" 2>/dev/null || true
}

#===============================================================================
# PHASE 1: INITIAL ACCESS SIMULATION
#===============================================================================

simulate_phase1_initial_access() {
    echo ""
    echo -e "${WHITE}Phase 1: Initial Access Simulation${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "PHASE" "Starting Phase 1: Initial Access Simulation"
    
    # Simulate SSH brute force indicators in auth.log
    local auth_log_entry="Dec 10 21:00:00 vps sshd[12345]: ${SAFETY_TEXT} - Failed password for invalid user admin from 192.168.1.100 port 22 ssh2"
    
    if check_execute_mode; then
        # Create a simulation log file instead of modifying real auth.log
        local sim_auth_log="/tmp/attack-sim-auth.log"
        echo "# ${SAFETY_TEXT}" > "$sim_auth_log"
        for i in {1..10}; do
            echo "Dec 10 21:0$i:00 vps sshd[1234$i]: ${SAFETY_TEXT} - Failed password for invalid user admin from 192.168.1.10$i port 22 ssh2" >> "$sim_auth_log"
        done
        log "SUCCESS" "Created fake failed SSH login entries in $sim_auth_log"
        
        # Create initial access timestamp marker
        local marker_file="/tmp/attack-sim-initial-access-marker"
        echo "${SAFETY_TEXT}" > "$marker_file"
        echo "Initial access simulated at: $(date '+%Y-%m-%d %H:%M:%S')" >> "$marker_file"
        log "SUCCESS" "Created initial access timestamp marker"
    else
        log "INFO" "[DRY-RUN] Would create fake SSH login entries"
        log "INFO" "[DRY-RUN] Would create initial access marker"
    fi
    
    log "PHASE" "Phase 1 completed"
}

#===============================================================================
# PHASE 2: MALWARE INSTALLATION SIMULATION
#===============================================================================

simulate_phase2_malware_install() {
    echo ""
    echo -e "${WHITE}Phase 2: Malware Installation Simulation${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "PHASE" "Starting Phase 2: Malware Installation Simulation"
    
    # Create sex.sh (safe version)
    local sex_sh_content='#!/bin/bash
# SIMULATION: Original malware installer
# This is what the real sex.sh did:
# 1. Downloaded XMRig miner
# 2. Created persistence mechanisms
# 3. Started mining operations

echo "SIMULATION: This is a test malware installer"
echo "In a real attack, this would download and install crypto mining malware"
exit 0
'
    create_file_with_marker "${MALWARE_PATHS["sex_sh"]}" "$sex_sh_content"
    
    # Create XMRig directory structure
    if check_execute_mode; then
        local xmrig_dir="${MALWARE_PATHS["xmrig_dir"]}"
        mkdir -p "$xmrig_dir" 2>/dev/null || true
        
        # Create fake xmrig binary
        create_file_with_marker "$xmrig_dir/xmrig" "# Fake XMRig binary - ${SAFETY_TEXT}"
        
        # Create fake config
        create_file_with_marker "$xmrig_dir/config.json" '{
    "SIMULATION": "'"${SAFETY_TEXT}"'",
    "pools": [
        {
            "url": "pool.hashvault.pro:443",
            "user": "FAKE_WALLET_ADDRESS",
            "pass": "x",
            "NOTE": "This is a SIMULATION config - no mining occurs"
        }
    ]
}'
        log "SUCCESS" "Created fake XMRig directory structure"
    fi
    
    # Create /etc/de directory and miner binaries
    if check_execute_mode; then
        mkdir -p "/etc/de" 2>/dev/null || true
        
        # Create fake cX86 binary
        create_file_with_marker "${MALWARE_PATHS["miner_x86"]}" "#!/bin/bash
# FAKE MINER BINARY - ${SAFETY_TEXT}
# Original: This was the x86 Monero miner binary
echo 'SIMULATION: Fake miner - no actual mining'
exit 0
"
        
        # Create fake cARM binary  
        create_file_with_marker "${MALWARE_PATHS["miner_arm"]}" "#!/bin/bash
# FAKE MINER BINARY - ${SAFETY_TEXT}
# Original: This was the ARM Monero miner binary
echo 'SIMULATION: Fake ARM miner - no actual mining'
exit 0
"
        log "SUCCESS" "Created fake miner binaries in /etc/de/"
    fi
    
    # Create staging files in /tmp
    create_file_with_marker "${MALWARE_PATHS["staging_bin"]}" "# Fake staging binary - ${SAFETY_TEXT}"
    
    local install_script_content='#!/bin/bash
# SIMULATION: Malware installation script
# This simulates what /tmp/s.sh did during the attack

echo "SIMULATION: This would install the miner"
echo "Steps that would occur:"
echo "1. Download miner from remote server"
echo "2. Create /etc/de directory"
echo "3. Install miner binaries"
echo "4. Create systemd services"
echo "5. Add cron persistence"
echo ""
echo "THIS IS A SIMULATION - NO ACTUAL MALWARE INSTALLED"
exit 0
'
    create_file_with_marker "${MALWARE_PATHS["install_script"]}" "$install_script_content"
    
    log "PHASE" "Phase 2 completed"
}

#===============================================================================
# PHASE 3: PERSISTENCE MECHANISM SIMULATION
#===============================================================================

simulate_phase3_persistence() {
    echo ""
    echo -e "${WHITE}Phase 3: Persistence Mechanism Simulation${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "PHASE" "Starting Phase 3: Persistence Simulation"
    
    # Create hidden directories
    for key in "${!HIDDEN_DIRS[@]}"; do
        local dir="${HIDDEN_DIRS[$key]}"
        if check_execute_mode; then
            mkdir -p "$dir" 2>/dev/null || true
            create_file_with_marker "$dir/.marker" "Hidden directory marker for attack simulation"
            log "SUCCESS" "Created hidden directory: $dir"
        else
            log "INFO" "[DRY-RUN] Would create hidden directory: $dir"
        fi
    done
    
    # Create sshds fake binary in hidden directory
    if check_execute_mode && [[ -d "${HIDDEN_DIRS["sshds"]}" ]]; then
        create_file_with_marker "${HIDDEN_DIRS["sshds"]}/sshds" "#!/bin/bash
# FAKE SSHDS - ${SAFETY_TEXT}
# Original: This was a disguised Monero miner
echo 'SIMULATION: Fake sshds process'
exit 0
"
    fi
    
    # Create systemd services (DISABLED)
    local systemd_dir="/etc/systemd/system"
    
    # system-update-service.service
    if check_execute_mode; then
        local service_content="[Unit]
Description=${SAFETY_TEXT} - Simulated System Update Service
# NOTE: This is a SECURITY TEST - Not a real malicious service
# Original malware disguised itself as a system update service

[Service]
Type=simple
ExecStart=/bin/echo 'SIMULATION: This would run the miner'
# Original: ExecStart=/etc/de/cX86
Restart=no
# Original: Restart=always

[Install]
# DISABLED FOR SAFETY - Do not enable
# WantedBy=multi-user.target
"
        echo "$service_content" > "$systemd_dir/${SYSTEMD_SERVICES["system_update"]}" 2>/dev/null || true
        log "SUCCESS" "Created systemd service: ${SYSTEMD_SERVICES["system_update"]} (DISABLED)"
    fi
    
    # sshds_miner.service
    if check_execute_mode; then
        local sshds_service="[Unit]
Description=${SAFETY_TEXT} - Simulated SSHDS Miner Service
# NOTE: This is a SECURITY TEST - Not a real malicious service
# Original malware ran a Monero miner disguised as SSH daemon

[Service]
Type=simple
ExecStart=/bin/echo 'SIMULATION: This would run sshds miner'
# Original: ExecStart=/root/.sshds/sshds --config=/root/.sshds/config.json
Restart=no
# Original: Restart=always
# Original: RestartSec=10

[Install]
# DISABLED FOR SAFETY - Do not enable
# WantedBy=multi-user.target
"
        echo "$sshds_service" > "$systemd_dir/${SYSTEMD_SERVICES["sshds_miner"]}" 2>/dev/null || true
        log "SUCCESS" "Created systemd service: ${SYSTEMD_SERVICES["sshds_miner"]} (DISABLED)"
    fi
    
    # supdate.service
    if check_execute_mode; then
        local supdate_service="[Unit]
Description=${SAFETY_TEXT} - Simulated Supdate Service
# NOTE: This is a SECURITY TEST - Not a real malicious service
# Original malware had auto-restart wrapper for cX86

[Service]
Type=simple
ExecStart=/bin/echo 'SIMULATION: This would restart the miner'
# Original: ExecStart=/etc/de/./cX86
Restart=no
# Original: Restart=always

[Install]
# DISABLED FOR SAFETY - Do not enable
# WantedBy=multi-user.target
"
        echo "$supdate_service" > "$systemd_dir/${SYSTEMD_SERVICES["supdate"]}" 2>/dev/null || true
        log "SUCCESS" "Created systemd service: ${SYSTEMD_SERVICES["supdate"]} (DISABLED)"
    fi
    
    # Create cron persistence (COMMENTED OUT)
    if check_execute_mode; then
        local cron_file="/etc/cron.d/attack-simulation-test"
        cat > "$cron_file" << EOF
# ${SAFETY_TEXT}
# This is a SECURITY TEST cron file - NOT real malware persistence
# Original attack used: @reboot /etc/de/./cX86

# COMMENTED OUT FOR SAFETY - These entries are NOT active
# @reboot root /etc/de/./cX86
# */5 * * * * root /etc/de/./cX86 >/dev/null 2>&1

# Marker entry to test detection (does nothing harmful)
# @reboot root /bin/echo "SIMULATION: Cron persistence test"
EOF
        chmod 644 "$cron_file"
        log "SUCCESS" "Created test cron file: $cron_file (all entries commented)"
    fi
    
    log "PHASE" "Phase 3 completed"
}

#===============================================================================
# PHASE 4: NETWORK IOC SIMULATION
#===============================================================================

simulate_phase4_network_ioc() {
    echo ""
    echo -e "${WHITE}Phase 4: Network IOC Simulation${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "PHASE" "Starting Phase 4: Network IOC Simulation"
    
    log "INFO" "Performing DNS lookups for mining pool IOCs (no actual connections)..."
    
    if check_execute_mode; then
        # DNS lookup only - no actual connections
        for key in "${!NETWORK_IOCS[@]}"; do
            local target="${NETWORK_IOCS[$key]}"
            log "INFO" "DNS lookup for: $target"
            
            # Perform DNS lookup (safe - no connection)
            if command -v nslookup &> /dev/null; then
                nslookup "$target" 2>/dev/null | head -5 || true
            elif command -v host &> /dev/null; then
                host "$target" 2>/dev/null | head -3 || true
            elif command -v dig &> /dev/null; then
                dig +short "$target" 2>/dev/null || true
            fi
            
            log "SUCCESS" "Completed DNS lookup for: $target"
        done
        
        # Create a network IOC log file
        local ioc_log="/tmp/attack-sim-network-iocs.log"
        cat > "$ioc_log" << EOF
# ${SAFETY_TEXT}
# Network IOC Simulation Log
# Generated: $(date '+%Y-%m-%d %H:%M:%S')

Mining Pools (DNS lookup only):
- pool.hashvault.pro:443 (Primary mining pool)
- c3pool.org (Backup mining pool)

C2 Servers:
- 35.173.69.207 (Command & Control)

Redirect Targets:
- xss.pro (Malicious redirect)

NOTE: Only DNS lookups were performed - NO actual connections made
EOF
        log "SUCCESS" "Created network IOC log: $ioc_log"
    else
        for key in "${!NETWORK_IOCS[@]}"; do
            log "INFO" "[DRY-RUN] Would perform DNS lookup for: ${NETWORK_IOCS[$key]}"
        done
    fi
    
    log "PHASE" "Phase 4 completed"
}

#===============================================================================
# PHASE 5: PROCESS EXECUTION SIMULATION
#===============================================================================

simulate_phase5_process_exec() {
    echo ""
    echo -e "${WHITE}Phase 5: Process Execution Simulation${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "PHASE" "Starting Phase 5: Process Execution Simulation"
    
    if check_execute_mode; then
        # Clear previous PIDs
        > "$PID_FILE" 2>/dev/null || true
        
        # Create fake cX86 process
        log "INFO" "Starting fake cX86 process (will auto-terminate in 300s)..."
        (
            exec -a "cX86" sleep 300
        ) &
        local cx86_pid=$!
        track_pid $cx86_pid
        log "SUCCESS" "Started fake cX86 process with PID: $cx86_pid"
        
        # Create fake sshds process
        log "INFO" "Starting fake sshds process (will auto-terminate in 300s)..."
        (
            exec -a "sshds" sleep 300
        ) &
        local sshds_pid=$!
        track_pid $sshds_pid
        log "SUCCESS" "Started fake sshds process with PID: $sshds_pid"
        
        # Create fake xmrig process
        log "INFO" "Starting fake xmrig process (will auto-terminate in 300s)..."
        (
            exec -a "xmrig" sleep 300
        ) &
        local xmrig_pid=$!
        track_pid $xmrig_pid
        log "SUCCESS" "Started fake xmrig process with PID: $xmrig_pid"
        
        # Optional: High CPU simulation
        if [[ "$SIMULATE_CPU" == "true" ]]; then
            log "WARNING" "Starting high CPU simulation (60 second timeout)..."
            timeout 60 yes > /dev/null &
            local cpu_pid=$!
            track_pid $cpu_pid
            log "SUCCESS" "Started CPU stress process with PID: $cpu_pid (60s timeout)"
        fi
        
        log "INFO" "Active simulation processes:"
        cat "$PID_FILE" 2>/dev/null | while read pid; do
            if ps -p "$pid" > /dev/null 2>&1; then
                local pname=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
                echo "  - PID $pid ($pname)"
            fi
        done
    else
        log "INFO" "[DRY-RUN] Would start fake cX86 process"
        log "INFO" "[DRY-RUN] Would start fake sshds process"
        log "INFO" "[DRY-RUN] Would start fake xmrig process"
    fi
    
    log "PHASE" "Phase 5 completed"
}

#===============================================================================
# PHASE 6: NGINX TAMPERING SIMULATION
#===============================================================================

simulate_phase6_nginx_tampering() {
    echo ""
    echo -e "${WHITE}Phase 6: Nginx Configuration Tampering Simulation${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "PHASE" "Starting Phase 6: Nginx Tampering Simulation"
    
    if check_execute_mode; then
        # Create malicious nginx config (test version - in separate location)
        local nginx_test_dir="/tmp/attack-sim-nginx"
        mkdir -p "$nginx_test_dir" 2>/dev/null || true
        
        local malicious_config="$nginx_test_dir/malicious-redirect.conf"
        cat > "$malicious_config" << EOF
# ${SAFETY_TEXT}
# Malicious Nginx Configuration Simulation
# This file demonstrates what an attacker might add to nginx config
# 
# IMPORTANT: This file is NOT loaded by nginx - it's for testing only
# Location: $malicious_config (not in nginx config directory)

# Original attack redirect pattern:
# server {
#     listen 80;
#     server_name _;
#     return 301 https://xss.pro\$request_uri;
# }

# Simulation version (inactive):
server {
    # ${SAFETY_TEXT}
    # This configuration is for SECURITY TESTING ONLY
    # It is NOT loaded by the actual nginx server
    
    listen 65535;  # Non-standard port - will never match real traffic
    server_name attack-simulation-test.local;
    
    # Simulated malicious redirect (inactive)
    # return 301 https://xss.pro\$request_uri;
    
    # Safe alternative for testing
    return 200 "SIMULATION: This would redirect to xss.pro";
}
EOF
        log "SUCCESS" "Created test nginx config: $malicious_config"
        
        # Also create a detection marker file
        local marker_file="/tmp/attack-sim-nginx-tampering-marker"
        cat > "$marker_file" << EOF
# ${SAFETY_TEXT}
# Nginx tampering simulation marker
# Created: $(date '+%Y-%m-%d %H:%M:%S')
# 
# This marker indicates that nginx tampering simulation was run
# Guardian should detect the malicious config file at:
# $malicious_config
EOF
        log "SUCCESS" "Created nginx tampering marker file"
    else
        log "INFO" "[DRY-RUN] Would create malicious nginx config in /tmp/"
    fi
    
    log "PHASE" "Phase 6 completed"
}

#===============================================================================
# FULL ATTACK CHAIN
#===============================================================================

simulate_full_attack_chain() {
    print_banner
    print_warning
    
    echo ""
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║  FULL ATTACK CHAIN SIMULATION                                                 ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log "PHASE" "Starting full attack chain simulation"
    log "INFO" "Simulation ID: $SIMULATION_MARKER"
    
    simulate_phase1_initial_access
    simulate_phase2_malware_install
    simulate_phase3_persistence
    simulate_phase4_network_ioc
    simulate_phase5_process_exec
    simulate_phase6_nginx_tampering
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  SIMULATION COMPLETE                                                          ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log "PHASE" "Full attack chain simulation completed"
    
    # Print summary
    print_summary
}

#===============================================================================
# CLEANUP
#===============================================================================

cleanup_all() {
    echo ""
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  CLEANUP: Removing all simulation artifacts                                   ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log "PHASE" "Starting cleanup"
    
    # Kill simulated processes
    if [[ -f "$PID_FILE" ]]; then
        log "INFO" "Terminating simulation processes..."
        while read pid; do
            if ps -p "$pid" > /dev/null 2>&1; then
                kill "$pid" 2>/dev/null || true
                log "SUCCESS" "Terminated process: $pid"
            fi
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi
    
    # Remove malware simulation files
    log "INFO" "Removing malware simulation files..."
    for key in "${!MALWARE_PATHS[@]}"; do
        local path="${MALWARE_PATHS[$key]}"
        if [[ -e "$path" ]]; then
            rm -rf "$path" 2>/dev/null || true
            log "SUCCESS" "Removed: $path"
        fi
    done
    
    # Remove XMRig directory
    rm -rf "/var/www/frontend/.next/standalone/xmrig-6.24.0" 2>/dev/null || true
    
    # Remove /etc/de directory
    rm -rf "/etc/de" 2>/dev/null || true
    log "SUCCESS" "Removed: /etc/de"
    
    # Remove hidden directories
    log "INFO" "Removing hidden directories..."
    for key in "${!HIDDEN_DIRS[@]}"; do
        local dir="${HIDDEN_DIRS[$key]}"
        if [[ -d "$dir" ]]; then
            rm -rf "$dir" 2>/dev/null || true
            log "SUCCESS" "Removed: $dir"
        fi
    done
    
    # Remove systemd services
    log "INFO" "Removing systemd services..."
    for key in "${!SYSTEMD_SERVICES[@]}"; do
        local service="${SYSTEMD_SERVICES[$key]}"
        local service_path="/etc/systemd/system/$service"
        if [[ -f "$service_path" ]]; then
            rm -f "$service_path" 2>/dev/null || true
            log "SUCCESS" "Removed service: $service"
        fi
    done
    systemctl daemon-reload 2>/dev/null || true
    
    # Remove cron file
    rm -f "/etc/cron.d/attack-simulation-test" 2>/dev/null || true
    log "SUCCESS" "Removed test cron file"
    
    # Remove temp files
    log "INFO" "Removing temporary files..."
    rm -f /tmp/attack-sim-* 2>/dev/null || true
    rm -f /tmp/fake-miner.pid 2>/dev/null || true
    rm -rf /tmp/attack-sim-nginx 2>/dev/null || true
    log "SUCCESS" "Removed temporary files"
    
    echo ""
    log "SUCCESS" "Cleanup completed successfully"
}

#===============================================================================
# STATUS & VERIFICATION
#===============================================================================

status_report() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  SIMULATION STATUS REPORT                                                     ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${WHITE}Malware Files:${NC}"
    for key in "${!MALWARE_PATHS[@]}"; do
        local path="${MALWARE_PATHS[$key]}"
        if [[ -e "$path" ]]; then
            echo -e "  ${GREEN}[EXISTS]${NC} $path"
        else
            echo -e "  ${RED}[ABSENT]${NC} $path"
        fi
    done
    
    echo ""
    echo -e "${WHITE}Hidden Directories:${NC}"
    for key in "${!HIDDEN_DIRS[@]}"; do
        local dir="${HIDDEN_DIRS[$key]}"
        if [[ -d "$dir" ]]; then
            echo -e "  ${GREEN}[EXISTS]${NC} $dir"
        else
            echo -e "  ${RED}[ABSENT]${NC} $dir"
        fi
    done
    
    echo ""
    echo -e "${WHITE}Systemd Services:${NC}"
    for key in "${!SYSTEMD_SERVICES[@]}"; do
        local service="${SYSTEMD_SERVICES[$key]}"
        local service_path="/etc/systemd/system/$service"
        if [[ -f "$service_path" ]]; then
            local status=$(systemctl is-enabled "$service" 2>/dev/null || echo "disabled")
            echo -e "  ${GREEN}[EXISTS]${NC} $service (${YELLOW}$status${NC})"
        else
            echo -e "  ${RED}[ABSENT]${NC} $service"
        fi
    done
    
    echo ""
    echo -e "${WHITE}Cron File:${NC}"
    if [[ -f "/etc/cron.d/attack-simulation-test" ]]; then
        echo -e "  ${GREEN}[EXISTS]${NC} /etc/cron.d/attack-simulation-test"
    else
        echo -e "  ${RED}[ABSENT]${NC} /etc/cron.d/attack-simulation-test"
    fi
    
    echo ""
    echo -e "${WHITE}Simulation Processes:${NC}"
    local process_found=false
    for proc_name in cX86 sshds xmrig; do
        local pids=$(pgrep -x "$proc_name" 2>/dev/null || true)
        if [[ -n "$pids" ]]; then
            process_found=true
            echo -e "  ${GREEN}[RUNNING]${NC} $proc_name (PIDs: $pids)"
        fi
    done
    if [[ "$process_found" == "false" ]]; then
        echo -e "  ${RED}[NONE]${NC} No simulation processes running"
    fi
    
    echo ""
    echo -e "${WHITE}Temp Files:${NC}"
    local temp_files=$(ls /tmp/attack-sim-* 2>/dev/null || true)
    if [[ -n "$temp_files" ]]; then
        echo "$temp_files" | while read f; do
            echo -e "  ${GREEN}[EXISTS]${NC} $f"
        done
    else
        echo -e "  ${RED}[NONE]${NC} No temporary simulation files"
    fi
}

verify_detection() {
    echo ""
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║  GUARDIAN DETECTION VERIFICATION                                              ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log "INFO" "Checking Guardian detection capabilities..."
    
    # Check if Guardian is running
    if pgrep -f "guardian" > /dev/null 2>&1; then
        log "SUCCESS" "Guardian monitoring appears to be running"
    else
        log "WARNING" "Guardian monitoring may not be running"
    fi
    
    # Check Guardian log for detections
    local guardian_log="/var/log/guardian.log"
    if [[ -f "$guardian_log" ]]; then
        log "INFO" "Checking Guardian log for recent detections..."
        
        # Look for simulation-related detections
        local detections=$(grep -i "simulation\|cX86\|sshds\|xmrig\|hashvault\|c3pool" "$guardian_log" 2>/dev/null | tail -20)
        if [[ -n "$detections" ]]; then
            log "SUCCESS" "Guardian detected simulation artifacts!"
            echo ""
            echo -e "${WHITE}Recent detections:${NC}"
            echo "$detections" | while read line; do
                echo "  $line"
            done
        else
            log "WARNING" "No simulation-related detections found in Guardian log"
        fi
    else
        log "WARNING" "Guardian log not found at $guardian_log"
    fi
    
    # Check for alerts
    echo ""
    echo -e "${WHITE}Verification checklist:${NC}"
    echo "  [ ] Check email for Guardian alerts"
    echo "  [ ] Verify Telegram notifications received"
    echo "  [ ] Review /var/log/guardian.log for detection entries"
    echo "  [ ] Check systemd journal: journalctl -u guardian -n 50"
    
    echo ""
    echo -e "${WHITE}Expected detections:${NC}"
    echo "  - Suspicious files in /var/www/frontend/.next/standalone/"
    echo "  - Hidden directories in /root/"
    echo "  - Suspicious systemd services"
    echo "  - Cron file with commented malicious entries"
    echo "  - Processes named cX86, sshds, xmrig"
    echo "  - DNS lookups to mining pools"
}

print_summary() {
    echo ""
    echo -e "${WHITE}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${WHITE}║  SIMULATION SUMMARY                                                           ║${NC}"
    echo -e "${WHITE}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${WHITE}Simulation ID:${NC} $SIMULATION_MARKER"
    echo ""
    
    echo -e "${WHITE}Files Created:${NC}"
    for key in "${!MALWARE_PATHS[@]}"; do
        local path="${MALWARE_PATHS[$key]}"
        if [[ -e "$path" ]]; then
            echo "  - $path"
        fi
    done
    
    echo ""
    echo -e "${WHITE}Hidden Directories Created:${NC}"
    for key in "${!HIDDEN_DIRS[@]}"; do
        local dir="${HIDDEN_DIRS[$key]}"
        if [[ -d "$dir" ]]; then
            echo "  - $dir"
        fi
    done
    
    echo ""
    echo -e "${WHITE}Services Installed (DISABLED):${NC}"
    for key in "${!SYSTEMD_SERVICES[@]}"; do
        local service="${SYSTEMD_SERVICES[$key]}"
        if [[ -f "/etc/systemd/system/$service" ]]; then
            echo "  - $service"
        fi
    done
    
    echo ""
    echo -e "${WHITE}Processes Started:${NC}"
    if [[ -f "$PID_FILE" ]]; then
        cat "$PID_FILE" | while read pid; do
            if ps -p "$pid" > /dev/null 2>&1; then
                local pname=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
                echo "  - PID $pid ($pname)"
            fi
        done
    fi
    
    echo ""
    echo -e "${YELLOW}To verify Guardian detection:${NC}"
    echo "  ./advanced-attack-simulation.sh --verify"
    echo ""
    echo -e "${YELLOW}To clean up all artifacts:${NC}"
    echo "  ./advanced-attack-simulation.sh --cleanup --execute"
}

#===============================================================================
# HELP & USAGE
#===============================================================================

show_help() {
    print_banner
    
    cat << EOF
${WHITE}USAGE:${NC}
    $(basename "$0") [OPTIONS]

${WHITE}DESCRIPTION:${NC}
    Advanced attack simulation script for testing MaasISO Guardian security
    monitoring. Simulates the attack patterns observed during the December 2025
    cryptocurrency mining incidents.

${WHITE}OPTIONS:${NC}
    --help          Show this help message
    --phase1        Run Phase 1: Initial Access simulation only
    --phase2        Run Phase 2: Malware Installation simulation only
    --phase3        Run Phase 3: Persistence Mechanism simulation only
    --phase4        Run Phase 4: Network IOC simulation only
    --phase5        Run Phase 5: Process Execution simulation only
    --phase6        Run Phase 6: Nginx Tampering simulation only
    --full          Run full attack chain (all phases)
    --cleanup       Remove all simulation artifacts
    --status        Show current simulation status
    --verify        Verify Guardian detection
    --execute       Actually execute (required for non-dry-run)
    --cpu           Enable CPU stress simulation in Phase 5
    --auto-cleanup  Set auto-cleanup timeout in seconds

${WHITE}EXAMPLES:${NC}
    # Dry run - see what would happen
    $(basename "$0") --full

    # Actually run full simulation
    $(basename "$0") --full --execute

    # Run specific phase
    $(basename "$0") --phase2 --execute

    # Check status
    $(basename "$0") --status

    # Verify Guardian detected artifacts
    $(basename "$0") --verify

    # Clean up all artifacts
    $(basename "$0") --cleanup --execute

${WHITE}SAFETY:${NC}
    - All files contain safety markers identifying them as tests
    - Systemd services are created but NOT enabled
    - Cron entries are commented out (inactive)
    - Network activity is DNS lookup only (no connections)
    - Processes have automatic timeouts
    - Requires --execute flag to actually run

${WHITE}LOG FILE:${NC}
    $LOG_FILE

EOF
}

#===============================================================================
# MAIN
#===============================================================================

main() {
    local action=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --help|-h)
                show_help
                exit 0
                ;;
            --phase1)
                action="phase1"
                shift
                ;;
            --phase2)
                action="phase2"
                shift
                ;;
            --phase3)
                action="phase3"
                shift
                ;;
            --phase4)
                action="phase4"
                shift
                ;;
            --phase5)
                action="phase5"
                shift
                ;;
            --phase6)
                action="phase6"
                shift
                ;;
            --full)
                action="full"
                shift
                ;;
            --cleanup)
                action="cleanup"
                shift
                ;;
            --status)
                action="status"
                shift
                ;;
            --verify)
                action="verify"
                shift
                ;;
            --execute)
                EXECUTE_MODE=true
                shift
                ;;
            --cpu)
                SIMULATE_CPU=true
                shift
                ;;
            --auto-cleanup)
                shift
                AUTO_CLEANUP_TIMEOUT="${1:-0}"
                shift
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Default action
    if [[ -z "$action" ]]; then
        show_help
        exit 0
    fi
    
    # Check root for most operations
    if [[ "$action" != "status" && "$action" != "verify" ]]; then
        check_root || true
    fi
    
    # Initialize log
    if [[ "$EXECUTE_MODE" == "true" && "$LOG_ENABLED" == "true" ]]; then
        mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
        echo "# Attack Simulation Log - Started $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE" 2>/dev/null || true
        echo "# Simulation ID: $SIMULATION_MARKER" >> "$LOG_FILE" 2>/dev/null || true
    fi
    
    # Execute action
    case "$action" in
        phase1)
            print_banner
            print_warning
            simulate_phase1_initial_access
            ;;
        phase2)
            print_banner
            print_warning
            simulate_phase2_malware_install
            ;;
        phase3)
            print_banner
            print_warning
            simulate_phase3_persistence
            ;;
        phase4)
            print_banner
            print_warning
            simulate_phase4_network_ioc
            ;;
        phase5)
            print_banner
            print_warning
            simulate_phase5_process_exec
            ;;
        phase6)
            print_banner
            print_warning
            simulate_phase6_nginx_tampering
            ;;
        full)
            simulate_full_attack_chain
            ;;
        cleanup)
            cleanup_all
            ;;
        status)
            status_report
            ;;
        verify)
            verify_detection
            ;;
    esac
    
    # Auto-cleanup if enabled
    if [[ "$AUTO_CLEANUP_TIMEOUT" -gt 0 && "$action" != "cleanup" ]]; then
        log "INFO" "Auto-cleanup scheduled in $AUTO_CLEANUP_TIMEOUT seconds"
        (
            sleep "$AUTO_CLEANUP_TIMEOUT"
            cleanup_all
        ) &
    fi
}

# Run main
main "$@"
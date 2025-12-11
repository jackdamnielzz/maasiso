#!/bin/bash
# Guardian Security System v2.0 - Configuration
# Only send CRITICAL alerts - reduce email spam

# Email settings
ALERT_EMAIL_PRIMARY="niels.maas@maasiso.nl"
ALERT_EMAIL_SECONDARY="niels_maas@hotmail.com"

# Alert levels - ONLY send CRITICAL
ALERT_INFO_ENABLED=false       # Disable INFO emails
ALERT_WARNING_ENABLED=false    # Disable WARNING emails  
ALERT_CRITICAL_ENABLED=true    # Keep CRITICAL alerts

# Throttle settings (seconds) - increase dramatically
THROTTLE_INFO=3600            # 1 hour between INFO
THROTTLE_WARNING=1800         # 30 min between WARNING
THROTTLE_CRITICAL=60          # 1 min between CRITICAL (still fast for real emergencies)

# Silent mode - only log, don't email for non-critical
SILENT_MODE=true

# Thresholds for alerts
CPU_THRESHOLD=90               # Only alert if >90% CPU
MEMORY_THRESHOLD=95            # Only alert if >95% memory
DISK_THRESHOLD=95              # Only alert if >95% disk

# Website monitoring - only alert on failures
WEBSITE_ALERT_ON_SUCCESS=false
WEBSITE_CONSECUTIVE_FAILURES=3  # Need 3 failures before alerting

# Services to monitor
MONITOR_NGINX=true
MONITOR_PM2=true
MONITOR_POSTGRES=true

# Pushover (SMS) - disabled
PUSHOVER_ENABLED=false
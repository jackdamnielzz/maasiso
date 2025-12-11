#!/bin/bash
LOG="/var/log/security_monitor.log"
TS=$(date '+%Y-%m-%d %H:%M:%S')

# Check nginx config integrity
STORED=$(cat /root/.nginx_config_hash 2>/dev/null)
CURRENT=$(sha256sum /etc/nginx/sites-available/maasiso.nl 2>/dev/null | cut -d' ' -f1)
if [ "$STORED" != "$CURRENT" ]; then
    echo "$TS: ALERT - Nginx config changed!" >> $LOG
    grep -qE "xss\.(pro|is)" /etc/nginx/sites-available/maasiso.nl && \
    cp /etc/nginx/backups/20251209_132135/sites-available/maasiso.nl /etc/nginx/sites-available/maasiso.nl && \
    systemctl reload nginx && echo "$TS: Auto-restored nginx" >> $LOG
fi

# Check for malware directories
[ -d "/root/.sshds" ] && rm -rf /root/.sshds && echo "$TS: Removed .sshds" >> $LOG
[ -d "/root/.local/share/.05bf0e9b" ] && rm -rf /root/.local/share/.05bf0e9b && echo "$TS: Removed malware dir" >> $LOG

# Kill malware processes
pgrep -f "xmrig|sshds|\.05bf0e9b" >/dev/null && pkill -9 -f "xmrig|sshds|\.05bf0e9b" && echo "$TS: Killed malware" >> $LOG
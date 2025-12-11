# Security Incident Report - December 11, 2025

**Report Date:** December 11, 2025 07:23 UTC  
**Incident Discovery:** December 11, 2025 ~07:17 UTC (user reported website unreachable)  
**Incident Resolution:** December 11, 2025 07:23 UTC  
**Server Affected:** Frontend VPS (147.93.62.188)  
**Incident Type:** Cryptocurrency Miner Malware (4th infection)  

---

## Executive Summary

The MaasISO website (maasiso.nl) was unreachable due to a cryptocurrency mining malware consuming 153% CPU. This is the **4th malware infection** in 3 days on the Frontend VPS, demonstrating a persistent backdoor or compromised attack vector that requires immediate migration to managed hosting.

---

## Timeline

| Time (UTC) | Event |
|------------|-------|
| ~06:49 | Malware process `/tmp/node` started (PID 2800589) |
| 07:15 | Guardian detected hidden process and DNS queries to mining pools |
| 07:17 | User reported website unreachable/very slow |
| 07:17 | Investigation started - discovered load average of 4.02 |
| 07:18 | Malware process identified: `/tmp/node` at 153% CPU |
| 07:18 | Malware killed (PID 2800589) |
| 07:18 | Old crontab entry `@reboot /etc/de/./cX86` removed |
| 07:20 | Server rebooted (possibly triggered by attacker or system) |
| 07:22 | Discovered malicious systemd services: `supdate.service`, `system-next.service` |
| 07:22 | Removed all malicious systemd persistence mechanisms |
| 07:23 | Website confirmed working (HTTP 200) |
| 07:23 | Load average normalized to 0.40 |

---

## Malware Details

### Process Information
```
PID: 2800589
CPU: 153%
Memory: 3524 KB
Command: ./node
Working Directory: /tmp
Executable: /tmp/node (deleted - self-deleting to hide)
Start Time: 06:49 UTC
```

### Network Connections
Guardian detected DNS queries to cryptocurrency mining pools:
- `c3pool.org` - Known Monero mining pool
- `pool.hashvault.pro` - Another cryptocurrency mining pool

### Persistence Mechanisms Found and Removed

1. **Crontab Entry** (carried over from previous infection)
   ```
   @reboot /etc/de/./cX86
   ```
   Status: ✅ REMOVED

2. **Malicious systemd Service: `supdate.service`**
   - Location: `/etc/systemd/system/supdate.service`
   - Created: December 10, 2025 22:24 UTC
   - Payload: `/etc/de/cX86`
   - Status: ✅ REMOVED

3. **Malicious systemd Service: `system-next.service`**
   - Location: `/etc/systemd/system/system-next.service`
   - Created: September 1, 2023 (older backdoor!)
   - Payload: `/lib/systemd/system-next`
   - Status: ✅ REMOVED

4. **Symlink in multi-user.target.wants**
   - Location: `/etc/systemd/system/multi-user.target.wants/supdate.service`
   - Status: ✅ REMOVED

---

## Actions Taken

1. ✅ Killed malware process (PID 2800589)
2. ✅ Removed malicious crontab entry
3. ✅ Removed `supdate.service` systemd unit
4. ✅ Removed `system-next.service` systemd unit  
5. ✅ Removed symlinks in multi-user.target.wants
6. ✅ Reloaded systemd daemon
7. ✅ Verified website is accessible (HTTP 200)
8. ✅ Verified load average normalized (0.40)

---

## Guardian System Detection

The Guardian monitoring system successfully detected the attack:

```
[2025-12-11 07:19:09] [CRITICAL] [process] HIDDEN PROCESS DETECTED
[2025-12-11 07:19:24] [WARNING] [network] DNS query for malicious domain: c3pool.org
[2025-12-11 07:19:24] [WARNING] [network] DNS query for malicious domain: pool.hashvault.pro
```

However, the malware was already running since 06:49 (30 minutes before detection). The Guardian system needs enhancement to detect and auto-kill such processes.

---

## Root Cause Analysis

This is the **4th infection** in 3 days:
1. **Dec 9**: XMRig cryptominer + malicious nginx redirect
2. **Dec 10 morning**: Reinfection after cleanup
3. **Dec 10 evening**: `/etc/de/cX86` crypto miner
4. **Dec 11 morning**: `/tmp/node` crypto miner (this incident)

### Possible Attack Vectors

1. **SSH Key Compromise** - Attacker may have copied SSH private key
2. **Rootkit/Backdoor** - Persistent backdoor not yet discovered
3. **Web Application Vulnerability** - Exploit in Next.js or dependencies
4. **Control Panel Compromise** - Hostinger panel credentials may be leaked
5. **Server-Side Request Forgery** - Application-level vulnerability

### Evidence of Persistent Backdoor
- `system-next.service` was created in September 2023, indicating long-term compromise
- Attackers can redeploy malware within hours of cleanup
- Multiple persistence mechanisms (cron, systemd, tmp execution)

---

## Recommendations

### Immediate (CRITICAL)
1. **⚠️ COMPLETE MIGRATION TO VERCEL/RAILWAY IMMEDIATELY**
   - The server has a persistent backdoor that cannot be cleaned
   - Each cleanup only provides temporary relief
   - Migration deadline: Before December 17 (backend VPS expiration)

### Short-term (if migration delayed)
1. Add Guardian auto-kill for processes in `/tmp` directory
2. Monitor `/tmp` for any executable files
3. Block outbound connections to known mining pools
4. Consider complete server rebuild (but backdoor may persist)

### Long-term
1. Use managed hosting exclusively (Vercel, Railway, Cloudflare)
2. Implement zero-trust security model
3. Never expose SSH directly to internet
4. Use GitHub Actions for deployments instead of SSH

---

## Current Server Status

| Metric | Before | After |
|--------|--------|-------|
| Load Average | 4.02 | 0.40 |
| CPU Usage (malware) | 153% | 0% |
| Website Status | Timeout | HTTP 200 |
| Malicious Processes | 1 | 0 |
| Malicious Services | 2 | 0 |
| Malicious Cron | 1 | 0 |

---

## Conclusion

The frontend VPS is **persistently compromised** and should be treated as untrustworthy. While this incident has been resolved, another infection is likely within hours or days. 

**The only permanent solution is migration to managed hosting (Vercel + Railway).**

---

**Report prepared by:** Automated Security Response System  
**Reviewed by:** System Administrator
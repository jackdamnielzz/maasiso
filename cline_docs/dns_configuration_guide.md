# DNS Configuration Guide for maasiso.nl - Last Updated: 2025-02-07 23:42

## Overview
This guide provides step-by-step instructions for configuring DNS records in Hostinger for the maasiso.nl domain.

## Prerequisites
- Hostinger account credentials
- Access to Hostinger's domain management interface
- Server IP: 147.93.62.188

## Step-by-Step Configuration

### 1. Access DNS Management
1. Open web browser and go to https://hpanel.hostinger.com
2. Log in to your Hostinger account
3. Click on "Domains" in the left sidebar
4. Find maasiso.nl in your domain list
5. Click "Manage" next to maasiso.nl
6. Select "DNS / Nameservers" from the domain management menu

### 2. Remove Existing Records (If Any)
1. Locate the "DNS Records" section
2. Look for any existing A records for:
   - @ (root domain)
   - www (subdomain)
3. If found, click the trash icon next to each to delete them

### 3. Add Root Domain Record
1. Click "Add Record"
2. Select "A Record" from the dropdown
3. Fill in the fields:
   ```
   Type: A
   Host: @ (or leave blank)
   Points to: 147.93.62.188
   TTL: 14400 (or leave default)
   ```
4. Click "Add Record" to save

### 4. Add WWW Subdomain Record
1. Click "Add Record" again
2. Select "A Record" from the dropdown
3. Fill in the fields:
   ```
   Type: A
   Host: www
   Points to: 147.93.62.188
   TTL: 14400 (or leave default)
   ```
4. Click "Add Record" to save

## Verification Steps
1. Wait 5-10 minutes for initial propagation
2. Open terminal and run:
   ```bash
   dig maasiso.nl
   dig www.maasiso.nl
   ```
3. Verify that both commands show:
   - ANSWER SECTION with your IP (147.93.62.188)
   - No CNAME records

## DNS Propagation
- Changes can take up to 48 hours to propagate globally
- You can check propagation status at:
  * https://www.whatsmydns.net/#A/maasiso.nl
  * https://dnschecker.org/

## Next Steps After Propagation
1. Test domain access:
   ```bash
   curl -I http://maasiso.nl
   curl -I http://www.maasiso.nl
   ```
2. Both should return HTTP 200 OK from Nginx

## Troubleshooting
If DNS is not resolving:
1. Verify records in Hostinger panel
2. Check for typos in IP address
3. Wait longer for propagation
4. Clear local DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

## Related Documentation
- deployment_status.md - Overall deployment status
- currentTask.md - Current deployment step
- memory_bank.md - Project context and information

## Support
If you encounter issues:
1. Check Hostinger's DNS documentation
2. Contact Hostinger support
3. Use dig and nslookup for DNS debugging
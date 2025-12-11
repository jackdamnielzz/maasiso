# Cloudflare Setup Guide for MaasISO

This guide covers setting up Cloudflare to protect your servers from DDoS attacks, hide your origin server IP, and add an additional Web Application Firewall layer.

## Why Cloudflare?

Based on the December 9, 2025 security incident:
- Attackers knew your server IP addresses directly
- Direct attacks on nginx were possible
- No DDoS protection in place

Cloudflare provides:
- **Hide Origin IP**: Traffic proxied through Cloudflare
- **Free DDoS Protection**: Automatic attack mitigation
- **Free SSL**: Universal SSL at edge
- **Web Application Firewall**: Basic WAF rules (free tier)
- **Bot Protection**: Block malicious bots
- **CDN Caching**: Faster content delivery

---

## Step 1: Sign Up & Add Domain

1. Go to https://cloudflare.com and create free account
2. Click "Add Site" and enter `maasiso.nl`
3. Choose "Free" plan (sufficient for most needs)
4. Cloudflare will scan your DNS records

---

## Step 2: Configure DNS Records

### Before (current setup - exposed IPs):
```
Type    Name              Content           Proxy Status
A       maasiso.nl        147.93.62.188     DNS only
A       www               147.93.62.188     DNS only
A       strapicms         153.92.223.23     DNS only
```

### After (with Cloudflare protection):
```
Type    Name              Content           Proxy Status
A       maasiso.nl        147.93.62.188     ☁️ Proxied
A       www               147.93.62.188     ☁️ Proxied
A       api               153.92.223.23     ☁️ Proxied (if public)
A       strapicms         153.92.223.23     DNS only (admin-only)
```

**Important:**
- ☁️ Proxied = Traffic goes through Cloudflare (IP hidden)
- DNS only = Direct connection (IP exposed)

For the Strapi CMS admin panel, you might want DNS only so only you can access it directly. Or proxy it but add Access rules (see Step 5).

---

## Step 3: Update Nameservers

Cloudflare will provide two nameservers like:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

Update these at your domain registrar (where you bought maasiso.nl).

**Wait 24-48 hours for DNS propagation.**

---

## Step 4: Configure SSL/TLS Settings

Go to **SSL/TLS** in Cloudflare dashboard:

1. **SSL/TLS Mode**: Set to "Full (strict)"
   - This requires a valid SSL certificate on your origin server
   - You already have Let's Encrypt, so this works

2. **Always Use HTTPS**: Enable
   - Forces all HTTP to HTTPS

3. **Minimum TLS Version**: TLS 1.2
   - Blocks old, insecure protocols

4. **Automatic HTTPS Rewrites**: Enable
   - Fixes mixed content issues

---

## Step 5: Security Settings

### 5.1 Firewall Rules (WAF)

Go to **Security > WAF**:

**Create these rules:**

1. **Block Known Bad Bots**
   - Expression: `(cf.client.bot) and not (cf.verified_bot)`
   - Action: Block

2. **Block Countries (if not serving globally)**
   - Expression: `(ip.geoip.country in {"RU" "CN" "KP"})`
   - Action: Challenge or Block
   - (Adjust based on your legitimate traffic)

3. **Protect Admin Areas**
   - Expression: `(http.request.uri.path contains "/admin") or (http.request.uri.path contains "/strapi")`
   - Action: Challenge (Managed Challenge)

4. **Rate Limiting for Login**
   - Expression: `(http.request.uri.path contains "/auth") or (http.request.uri.path contains "/login")`
   - Action: Rate limit to 10 requests per minute

### 5.2 Bot Fight Mode

Go to **Security > Bots**:
- Enable **Bot Fight Mode** (free)
- This challenges obvious bots

### 5.3 Security Level

Go to **Security > Settings**:
- Set **Security Level** to "Medium" or "High"
- Enable **Browser Integrity Check**
- Enable **Challenge Passage** (30 minutes)

---

## Step 6: Page Rules (Optional)

Go to **Rules > Page Rules**:

1. **Cache Static Assets**
   - URL: `*maasiso.nl/static/*`
   - Setting: Cache Level = Cache Everything, Edge Cache TTL = 1 month

2. **Bypass Cache for API**
   - URL: `*maasiso.nl/api/*`
   - Setting: Cache Level = Bypass

3. **Force HTTPS**
   - URL: `http://*maasiso.nl/*`
   - Setting: Always Use HTTPS

---

## Step 7: Configure Origin Server

### 7.1 Only Allow Cloudflare IPs

Update your UFW rules to only accept HTTP/HTTPS from Cloudflare:

```bash
# Remove old HTTP/HTTPS rules
sudo ufw delete allow 80/tcp
sudo ufw delete allow 443/tcp

# Cloudflare IPv4 ranges (as of 2025, verify at cloudflare.com/ips)
sudo ufw allow from 173.245.48.0/20 to any port 80,443 proto tcp
sudo ufw allow from 103.21.244.0/22 to any port 80,443 proto tcp
sudo ufw allow from 103.22.200.0/22 to any port 80,443 proto tcp
sudo ufw allow from 103.31.4.0/22 to any port 80,443 proto tcp
sudo ufw allow from 141.101.64.0/18 to any port 80,443 proto tcp
sudo ufw allow from 108.162.192.0/18 to any port 80,443 proto tcp
sudo ufw allow from 190.93.240.0/20 to any port 80,443 proto tcp
sudo ufw allow from 188.114.96.0/20 to any port 80,443 proto tcp
sudo ufw allow from 197.234.240.0/22 to any port 80,443 proto tcp
sudo ufw allow from 198.41.128.0/17 to any port 80,443 proto tcp
sudo ufw allow from 162.158.0.0/15 to any port 80,443 proto tcp
sudo ufw allow from 104.16.0.0/13 to any port 80,443 proto tcp
sudo ufw allow from 104.24.0.0/14 to any port 80,443 proto tcp
sudo ufw allow from 172.64.0.0/13 to any port 80,443 proto tcp
sudo ufw allow from 131.0.72.0/22 to any port 80,443 proto tcp

# Reload UFW
sudo ufw reload
```

### 7.2 Get Real Client IPs

Cloudflare sends the real visitor IP in the `CF-Connecting-IP` header.

Update nginx to log real IPs:

```nginx
# Add to /etc/nginx/nginx.conf in http block:
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
real_ip_header CF-Connecting-IP;
```

### 7.3 Verify Cloudflare Requests

Add to nginx to reject non-Cloudflare traffic:

```nginx
# Only allow Cloudflare IPs (backup for UFW)
geo $cloudflare_ip {
    default 0;
    173.245.48.0/20 1;
    103.21.244.0/22 1;
    103.22.200.0/22 1;
    # ... (add all Cloudflare ranges)
}

server {
    # In your server block:
    if ($cloudflare_ip = 0) {
        return 403;
    }
}
```

---

## Step 8: Enable Cloudflare Access (Zero Trust) - Optional

For admin panels and sensitive areas:

1. Go to **Zero Trust** in Cloudflare dashboard
2. Create an **Access Application**
3. Protect `/admin` or the Strapi panel
4. Require authentication (email OTP, SSO, etc.)

This adds an extra login layer before even reaching your server.

---

## Step 9: Monitor & Alerts

1. **Analytics**: Check traffic patterns
2. **Security Events**: Review blocked requests
3. **Notifications**: Set up email alerts for:
   - DDoS attacks
   - High error rates
   - SSL certificate expiry

---

## Verification Checklist

After setup, verify:

- [ ] DNS is proxied through Cloudflare (orange cloud)
- [ ] SSL shows "Cloudflare Inc" in certificate chain
- [ ] Origin server IP no longer visible in DNS lookups
- [ ] Firewall rules are active
- [ ] Real visitor IPs logged in nginx
- [ ] Direct IP access returns 403

### Test Commands:

```bash
# Check if domain resolves to Cloudflare IPs
dig +short maasiso.nl
# Should return Cloudflare IPs (104.x.x.x), not your origin

# Check SSL certificate
echo | openssl s_client -servername maasiso.nl -connect maasiso.nl:443 2>/dev/null | openssl x509 -noout -issuer
# Should show Cloudflare

# Try direct IP access (should fail after UFW update)
curl -I https://147.93.62.188
# Should return 403 or connection refused
```

---

## Cost

- **Free plan**: Sufficient for most sites
  - DDoS protection
  - Basic WAF
  - CDN caching
  - SSL

- **Pro plan ($20/month)**: For more features
  - Enhanced WAF rules
  - Image optimization
  - Mobile optimization

For MaasISO, the **free plan** provides significant security improvements.

---

## Troubleshooting

### Site not loading after Cloudflare
1. Check SSL mode (should match your origin cert)
2. Verify DNS records are correct
3. Check if origin server is up

### Cloudflare showing error 520-526
- 520: Origin returned unexpected response
- 521: Origin is down
- 522: Connection timed out
- 523: Origin unreachable
- 524: Origin took too long
- 526: Invalid SSL certificate on origin

### Rate limiting blocking legitimate users
1. Review Security Events in dashboard
2. Adjust WAF rules
3. Whitelist specific IPs if needed

---

*Guide created: December 9, 2025*
*For MaasISO security hardening*
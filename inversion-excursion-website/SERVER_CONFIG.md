# Server Configuration Guide

## Inversion Excursion Website - Performance Optimization

This guide provides server configuration examples for implementing the performance recommendations.

---

## Nginx Configuration

### Complete Server Block with All Optimizations

```nginx
# /etc/nginx/sites-available/inversion-excursion

server {
    listen 80;
    listen [::]:80;
    server_name inversion-excursion.com www.inversion-excursion.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name inversion-excursion.com www.inversion-excursion.com;
    
    root /var/www/inversion-excursion;
    index index.html;
    
    # SSL Configuration (Let's Encrypt or your certificate)
    ssl_certificate /etc/letsencrypt/live/inversion-excursion.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/inversion-excursion.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # HTTP/3 (QUIC) - Requires Nginx 1.25+ with QUIC patch
    # listen 443 quic reuseport;
    # add_header Alt-Svc 'h3=":443"; ma=86400' always;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # HSTS (uncomment after testing HTTPS)
    # add_header Strict-Transport-Security "max-age=63072000" always;
    
    # Brotli Compression (requires ngx_brotli module)
    brotli on;
    brotli_comp_level 6;
    brotli_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Gzip Compression (fallback)
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Cache Control Headers
    location ~* \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        access_log off;
    }
    
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|avif)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    location ~* \.(woff|woff2|ttf|otf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        access_log off;
    }
    
    # HTML files - shorter cache for updates
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
    
    # Main location block
    location / {
        try_files $uri $uri/ =404;
        
        # Add CORS headers for fonts
        location ~* \.(woff|woff2)$ {
            add_header Access-Control-Allow-Origin "*";
        }
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Optimize logging
    access_log /var/log/nginx/inversion-excursion-access.log combined buffer=512k flush=1m;
    error_log /var/log/nginx/inversion-excursion-error.log warn;
}
```

---

## Apache Configuration

### .htaccess File for Shared Hosting

```apache
# /var/www/inversion-excursion/.htaccess

# Enable rewrite engine
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Redirect HTTP to HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
    
    # Remove trailing slashes
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)/$ /$1 [R=301,L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
    # Compress HTML, CSS, JavaScript, Text, XML and fonts
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/vnd.ms-fontobject
    AddOutputFilterByType DEFLATE application/x-font
    AddOutputFilterByType DEFLATE application/x-font-opentype
    AddOutputFilterByType DEFLATE application/x-font-otf
    AddOutputFilterByType DEFLATE application/x-font-truetype
    AddOutputFilterByType DEFLATE application/x-font-ttf
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE font/opentype
    AddOutputFilterByType DEFLATE font/otf
    AddOutputFilterByType DEFLATE font/ttf
    AddOutputFilterByType DEFLATE image/svg+xml
    AddOutputFilterByType DEFLATE image/x-icon
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/xml
    
    # Remove browser bugs
    BrowserMatch ^Mozilla/4 gzip-only-text/html
    BrowserMatch ^Mozilla/4\.0[678] no-gzip
    BrowserMatch \bMSIE !no-gzip !gzip-only-text/html
    Header append Vary User-Agent
</IfModule>

# Brotli Compression (if mod_brotli is available)
<IfModule mod_brotli.c>
    AddOutputFilterByType BROTLI_COMPRESS text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Images
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/avif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    
    # CSS and JavaScript
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType text/javascript "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    
    # Fonts
    ExpiresByType font/ttf "access plus 1 year"
    ExpiresByType font/otf "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType application/font-woff "access plus 1 year"
    
    # HTML
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Cache Control Headers
<IfModule mod_headers.c>
    # CSS and JS - 1 year
    <filesMatch "\.(css|js)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </filesMatch>
    
    # Images - 1 year
    <filesMatch "\.(jpg|jpeg|png|gif|ico|svg|webp|avif)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </filesMatch>
    
    # Fonts - 1 year
    <filesMatch "\.(woff|woff2|ttf|otf|eot)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
        Header set Access-Control-Allow-Origin "*"
    </filesMatch>
    
    # HTML - 1 hour
    <filesMatch "\.html$">
        Header set Cache-Control "public, max-age=3600, must-revalidate"
    </filesMatch>
    
    # Vary header for compression
    <filesMatch "\.(js|css|xml|gz)$">
        Header append Vary: Accept-Encoding
    </filesMatch>
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Disable server signature
ServerSignature Off

# Disable directory browsing
Options -Indexes

# Protect hidden files
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
```

---

## Caddy Configuration

### Caddyfile (Simple and Modern)

```caddy
# /etc/caddy/Caddyfile

inversion-excursion.com {
    root * /var/www/inversion-excursion
    file_server
    
    # Enable compression (gzip + zstd)
    encode gzip zstd
    
    # Enable HTTP/2 and HTTP/3
    # (Automatic in Caddy 2)
    
    # Security headers
    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
    }
    
    # Cache headers for static assets
    @static {
        path *.css *.js *.jpg *.jpeg *.png *.gif *.svg *.webp *.avif *.woff *.woff2
    }
    header @static {
        Cache-Control "public, max-age=31536000, immutable"
    }
    
    # HTML shorter cache
    @html {
        path *.html
    }
    header @html {
        Cache-Control "public, max-age=3600, must-revalidate"
    }
    
    # CORS for fonts
    @fonts {
        path *.woff *.woff2 *.ttf *.otf
    }
    header @fonts {
        Access-Control-Allow-Origin "*"
        Cache-Control "public, max-age=31536000, immutable"
    }
    
    # Try files
    try_files {path} {path}/ /index.html
    
    # Logging
    log {
        output file /var/log/caddy/inversion-excursion.log
        format json
    }
}
```

---

## Cloudflare Configuration

### Page Rules (Free Plan)

```
Rule 1: Cache Everything
URL: *inversion-excursion.com/css/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 year

Rule 2: Cache JS Files
URL: *inversion-excursion.com/js/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
- Browser Cache TTL: 1 year

Rule 3: HTML Short Cache
URL: *inversion-excursion.com/*.html
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 hour
- Browser Cache TTL: 1 hour
```

### Cloudflare Workers (For Advanced Optimization)

```javascript
// worker.js - Add Brotli support and optimizations

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Clone request to add/modify headers
  const modifiedRequest = new Request(request, {
    headers: {
      ...Object.fromEntries(request.headers),
      'Accept-Encoding': 'br, gzip' // Prefer Brotli
    }
  })
  
  const response = await fetch(modifiedRequest)
  
  // Add security headers
  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  })
  
  modifiedResponse.headers.set('X-Frame-Options', 'SAMEORIGIN')
  modifiedResponse.headers.set('X-Content-Type-Options', 'nosniff')
  modifiedResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return modifiedResponse
}
```

---

## Testing Your Configuration

### 1. Verify Compression

```bash
# Test Gzip
curl -H "Accept-Encoding: gzip" -I https://inversion-excursion.com/css/style.min.css

# Test Brotli
curl -H "Accept-Encoding: br" -I https://inversion-excursion.com/css/style.min.css

# Check response headers for: content-encoding: br or gzip
```

### 2. Verify Caching Headers

```bash
# Check cache headers
curl -I https://inversion-excursion.com/css/style.min.css

# Look for: cache-control: public, max-age=31536000, immutable
```

### 3. Verify HTTP/2

```bash
# Check protocol
curl -I --http2 https://inversion-excursion.com/

# Look for: HTTP/2 200
```

### 4. SSL/TLS Verification

```bash
# Test SSL configuration
curl -vI https://inversion-excursion.com/ 2>&1 | grep -E "(SSL|TLS|protocol)"

# Or use SSL Labs test: https://www.ssllabs.com/ssltest/
```

---

## Performance Testing Commands

```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse https://inversion-excursion.com --output html --output-path report.html

# WebPageTest API
# Sign up at webpagetest.org for API key

# cURL timing breakdown
curl -w "
Time DNS: %{time_namelookup}
Time Connect: %{time_connect}
Time SSL: %{time_appconnect}
Time TTFB: %{time_starttransfer}
Time Total: %{time_total}
" -o /dev/null -s https://inversion-excursion.com/

# HTTP/2 push (if implementing server push)
curl -I --http2-prior-knowledge https://inversion-excursion.com/
```

---

## Monitoring Setup

### Basic Log Analysis

```bash
# Nginx - Top slow requests
awk '{print $1, $6, $7, $10}' /var/log/nginx/access.log | sort -k4 -rn | head -20

# Apache - 404 errors
grep " 404 " /var/log/apache2/access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -20
```

### Enable Status Modules (for monitoring)

**Nginx:**
```nginx
location /nginx_status {
    stub_status on;
    allow 127.0.0.1;
    deny all;
}
```

**Apache:**
```apache
<Location "/server-status">
    SetHandler server-status
    Require host localhost
</Location>
```

---

*Generated for Inversion Excursion Website Technical Audit*

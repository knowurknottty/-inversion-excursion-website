# GOOGLE DRIVE OAUTH SETUP
## JavaScript & Redirect Configuration

---

## 🔧 GOOGLE CLOUD CONSOLE SETTINGS

### 1. Create OAuth 2.0 Credentials
**URL:** https://console.cloud.google.com/apis/credentials

**Application Type:** Web application

**Name:** Kimi Claw Google MCP

**Authorized JavaScript Origins:**
```
http://localhost:8080
http://localhost:3000
http://localhost
```

**Authorized Redirect URIs:**
```
http://localhost:8080/callback
http://localhost:3000/callback
http://localhost/callback
urn:ietf:wg:oauth:2.0:oob
```

---

## 📋 JAVASCRIPT ORIGINS (Add These)

```javascript
// For local development
http://localhost:8080
http://localhost:3000
http://localhost
http://127.0.0.1:8080
http://127.0.0.1:3000
http://127.0.0.1

// If using custom domain
https://yourdomain.com
https://www.yourdomain.com
```

---

## 🔄 REDIRECT URIs (Add These)

```javascript
// Standard callbacks
http://localhost:8080/callback
http://localhost:3000/callback
http://localhost/callback
http://127.0.0.1:8080/callback
http://127.0.0.1:3000/callback
http://127.0.0.1/callback

// Out-of-band (for CLI tools)
urn:ietf:wg:oauth:2.0:oob

// If using custom domain
https://yourdomain.com/callback
https://www.yourdomain.com/callback
```

---

## 🔐 REQUIRED SCOPES

```javascript
[
  // Google Drive - Full access
  "https://www.googleapis.com/auth/drive",
  
  // OR read-only (safer)
  "https://www.googleapis.com/auth/drive.readonly",
  
  // Additional services (optional)
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/documents"
]
```

---

## 📁 CONFIG FILE FOR MCP

Create `~/.openclaw/google-mcp-config.json`:

```json
{
  "oauth": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uri": "http://localhost:8080/callback",
    "token_file": "~/.openclaw/google-mcp-token.json",
    "scopes": [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/documents"
    ]
  },
  "services": {
    "drive": {
      "enabled": true,
      "default_folder": "root",
      "chunk_size": 5242880,
      "max_retries": 3
    }
  }
}
```

---

## 🚀 AUTH FLOW

### Step 1: Generate Auth URL
```javascript
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
  client_id=${CLIENT_ID}
  &redirect_uri=http://localhost:8080/callback
  &response_type=code
  &scope=https://www.googleapis.com/auth/drive
  &access_type=offline
  &prompt=consent`;
```

### Step 2: User Authorizes
- Opens authUrl in browser
- Logs into Google
- Grants permissions
- Redirected to callback with code

### Step 3: Exchange Code for Token
```javascript
const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    code: AUTH_CODE,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: 'http://localhost:8080/callback',
    grant_type: 'authorization_code'
  })
});
```

### Step 4: Store Token
```javascript
const tokens = await tokenResponse.json();
// Save to ~/.openclaw/google-mcp-token.json
```

---

## 🎯 QUICK SETUP CHECKLIST

### In Google Cloud Console:
- [ ] Create OAuth 2.0 credentials (Web application)
- [ ] Add JavaScript origins (localhost:8080, etc.)
- [ ] Add redirect URIs (localhost:8080/callback, etc.)
- [ ] Enable Google Drive API
- [ ] Download client_secret.json

### Send Me:
- Client ID
- Client Secret
- Or: The client_secret.json file

### I'll Handle:
- Auth flow
- Token storage
- MCP server config
- Drive sync setup

---

## 📧 MINIMAL SCOPES (If Concerned About Security)

If you only want Drive access:
```javascript
[
  "https://www.googleapis.com/auth/drive.readonly"
]
```

This gives read-only access to:
- List files
- Download files
- View metadata

No ability to:
- Delete files
- Modify files
- Create files

---

**Add these to Google Cloud Console and send me the Client ID/Secret.**
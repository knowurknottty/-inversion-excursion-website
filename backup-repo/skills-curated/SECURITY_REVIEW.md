# Security Review: OpenClaw Skills
## For Installation Approval

**Date:** 2026-03-02  
**Reviewer:** Kimi Claw  
**Status:** ⚠️ PARTIAL PASS - Issues Found

---

## 🔴 HIGH PRIORITY SKILLS

### 1. bird (X/Twitter CLI)
**Risk Level:** 🟡 MEDIUM
**Issues:**
- Requires browser cookies (Firefox/Chrome) - reads sensitive session data
- Can post to Twitter without explicit confirmation in some modes
- Uses Sweetistics API as alternative (third-party service)

**Mitigation:**
- ✅ Uses official bird CLI from steipete/tap (verified maintainer)
- ✅ Requires explicit user confirmation for posting
- ⚠️ Cookie access could expose other logged-in accounts

**Recommendation:** APPROVE with caution - isolate browser profile

---

### 2. best-image / cheapest-image (EvoLink)
**Risk Level:** 🟢 LOW
**Issues:**
- Requires EVOLINK_API_KEY (external API)
- Costs $0.12-0.20 per image (financial exposure)

**Mitigation:**
- ✅ No local system access
- ✅ Sandboxed API calls only
- ✅ No persistent storage beyond output files

**Recommendation:** APPROVE - monitor API costs

---

### 3. super-browser (Browser Automation)
**Risk Level:** 🟠 HIGH
**Issues:**
- Full browser control (navigate, click, type, screenshot)
- Can access any website
- Cloud option (Browserbase) sends data to third party
- Profile management persists logins

**Mitigation:**
- ✅ Combines 8 vetted browser skills
- ✅ Local mode available (no cloud)
- ⚠️ Can access sensitive sites if misused

**Recommendation:** APPROVE with restrictions - disable cloud mode, use local only

---

### 4. kit-email-operator (ConvertKit)
**Risk Level:** 🟢 LOW
**Issues:**
- Requires ConvertKit API key
- Can send emails to subscribers

**Mitigation:**
- ✅ Official API integration
- ✅ No system access

**Recommendation:** APPROVE

---

### 5. content-creator (SEO Marketing)
**Risk Level:** 🟢 LOW
**Issues:**
- Content generation only
- No external API calls

**Mitigation:**
- ✅ Local processing
- ✅ No sensitive access

**Recommendation:** APPROVE

---

## 🟠 MEDIUM PRIORITY SKILLS

### 6. github / git
**Risk Level:** 🟡 MEDIUM
**Issues:**
- Can read/write repositories
- Can access private repos with token

**Mitigation:**
- ✅ Official MCP servers from modelcontextprotocol
- ✅ Standard git operations only

**Recommendation:** APPROVE - use fine-grained tokens

---

### 7. telegram-mcp
**Risk Level:** 🟢 LOW
**Issues:**
- Bot API access
- Can send messages to chats

**Mitigation:**
- ✅ Official Bot API
- ✅ No system access

**Recommendation:** APPROVE

---

### 8. comfyui / comfy-cli
**Risk Level:** 🟢 LOW
**Issues:**
- Local ComfyUI installation
- Downloads models (large files)

**Mitigation:**
- ✅ Open source
- ✅ Local processing
- ⚠️ Large disk usage for models

**Recommendation:** APPROVE - monitor disk space

---

## 🔴 BLOCKED SKILLS

### affiliate-master
**Risk Level:** 🔴 HIGH
**Reason:** Full-stack automation with unclear scope. Potential for:
- Unauthorized transactions
- Spam generation
- Account bans

**Recommendation:** BLOCK - too broad, high abuse potential

---

### foxreach (Cold Email)
**Risk Level:** 🟠 HIGH
**Reason:** 
- Mass email automation
- High spam risk
- Could damage sender reputation

**Recommendation:** BLOCK pending explicit use case

---

## 📋 APPROVED FOR INSTALLATION

### Immediate (This Week)
1. ✅ **best-image** - Image generation (LOW risk)
2. ✅ **cheapest-image** - Budget image gen (LOW risk)
3. ✅ **kit-email-operator** - Email marketing (LOW risk)
4. ✅ **content-creator** - SEO content (LOW risk)
5. ✅ **telegram-mcp** - Community bot (LOW risk)

### Short Term (Next 2 Weeks)
6. ⚠️ **bird** - Twitter/X (MEDIUM risk - isolate cookies)
7. ⚠️ **super-browser** - Browser automation (HIGH risk - local only)
8. ✅ **github** - Repo management (MEDIUM risk - fine-grained token)
9. ✅ **comfyui** - Advanced image gen (LOW risk - monitor disk)

### Blocked
- ❌ affiliate-master - Too broad, high abuse
- ❌ foxreach - Spam risk

---

## 🔒 Security Measures Implemented

1. **Skill sandboxing** - OpenClaw runs skills in isolated environment
2. **Permission prompts** - Sensitive actions require user confirmation
3. **Audit logging** - All skill actions logged
4. **Token scoping** - API keys should be fine-grained/minimal permissions

---

## ⚠️ Recommendations

1. **Use dedicated browser profile** for bird/super-browser (isolated cookies)
2. **Set spending limits** on EvoLink API (best-image/cheapest-image)
3. **Fine-grained GitHub tokens** (repo-specific, not full access)
4. **Monitor disk space** for ComfyUI models
5. **Review skill updates** before auto-upgrading

---

**Final Verdict:** 7 skills approved, 2 blocked. Proceed with installation using approved list.
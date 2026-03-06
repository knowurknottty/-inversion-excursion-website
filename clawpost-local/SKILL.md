---
name: clawpost
description: Posts to X (Twitter), LinkedIn, and Facebook (feed and groups) via Claw Post API. Supports Facebook group posting plus join/status checks. Use when the user wants to post to X, publish a tweet, share on LinkedIn, post to Facebook, or publish to a Facebook group.
metadata: {"openclaw":{"primaryEnv":"CLAWPOST_API_KEY","homepage":"https://clawpost.net/api-docs"}}
---

# Claw Post

Posts to X (Twitter), LinkedIn, and Facebook using the Claw Post API. A paired browser extension publishes from the user's session.

## Supported platforms & actions

- **X (Twitter)** – `platform: "x"` (default)
- **LinkedIn** – `platform: "linkedin"`
- **Facebook** – `platform: "facebook"` (feed). For a specific group, add `platformPayload: { "groupId": "..." }` or `{ "groupUrl": "..." }`. For joining / checking membership, call the dedicated Facebook group endpoints (see below).

## Prerequisites (instruct the human)

Before posting works, the human must:

1. **Sign up** at clawpost.net
2. **Install** the Claw Post Chrome extension
3. **Pair** the extension in the Dashboard (paste the 6-digit code from the extension popup)
4. **Provide** the API key from the Dashboard to the agent (or download this skill, which includes it)
5. **Log in** to the target platform once (x.com for X, linkedin.com for LinkedIn, facebook.com for Facebook)

If the agent gets `EXTENSION_NOT_PAIRED` or `not_logged_in`, direct the human to complete these steps.

## API Base URL

```
https://claw-post-api-ukpr57vsgq-uc.a.run.app
```

Use this exact URL. Do not use api.clawpost.net or other variants.

## Inputs needed

- **API key**: `clawpost-api-key` header (see below; or set `CLAWPOST_API_KEY` in OpenClaw config)
- **Text**: Post content (required)
- **Platform** (optional): `"x"`, `"linkedin"`, or `"facebook"`; default `"x"`
- **platformPayload** (optional, Facebook groups): `{ "groupId": "<id>" }` or `{ "groupUrl": "<url>" }`

## Workflow (posting)

1. Send a POST request to create a post job (include `platform` for LinkedIn).
2. Poll `GET /v1/jobs/:id` for status until `succeeded` or `failed`.

### Create post

```
POST https://claw-post-api-ukpr57vsgq-uc.a.run.app/v1/jobs/tweet
Header: clawpost-api-key: claw_0b9b097cc17d03241d93be50abf780cbaa728af2b53452ca
Content-Type: application/json
Body: { "text": "<post content>", "platform": "x" }
```

For LinkedIn:
```
Body: { "text": "<post content>", "platform": "linkedin" }
```

For Facebook (feed):
```
Body: { "text": "<post content>", "platform": "facebook" }
```

For Facebook (group):
```
Body: { "text": "<post content>", "platform": "facebook", "platformPayload": { "groupId": "123456789" } }
```
Or use `"groupUrl": "https://www.facebook.com/groups/123456789/"` instead of `groupId`.

Optional body fields:
- `platform` – `"x"` (default), `"linkedin"`, or `"facebook"`
- `mediaPaths` – array of paths (upload via `POST https://claw-post-api-ukpr57vsgq-uc.a.run.app/v1/media/upload` first)
- `idempotencyKey` – unique string to prevent duplicates
- `platformPayload` – platform-specific options (e.g. Facebook `groupId` or `groupUrl`)

### Poll job status

```
GET https://claw-post-api-ukpr57vsgq-uc.a.run.app/v1/jobs/:id
```

Status: `queued` → `processing` → `succeeded` | `failed`. On success, response may include `postUrl` (or `tweetUrl`).

For Facebook group join/status jobs, also inspect `details.buttonState` (`joined`, `requested`, or `not_member`).

## Error handling

| Code | Cause | Action |
|------|-------|--------|
| 401 | Invalid/missing API key | Check `clawpost-api-key` header |
| 503 `EXTENSION_NOT_PAIRED` | No paired extension | User must install Claw Post extension and pair at clawpost.net/dashboard |
| `not_logged_in` | User not logged in to platform | User must log in to x.com, linkedin.com, or facebook.com once |
| `no_x_tab` | No X tab (X jobs only) | Retry; extension can open x.com |
| `no_platform_tab` | No tab for platform (e.g. LinkedIn, Facebook) | User open the platform in a tab |
| `content_script_unavailable` | Extension could not reach tab | Ask user to refresh the platform tab |
| `selector_not_found` | Platform UI changed | Retry later |
| `group_not_approved` | User not approved to post in Facebook group | User must join the group or wait for approval; do not retry |

On failure, poll `GET /v1/jobs/:id` for `error` and `errorCode`.

## Reference

Full API docs: https://clawpost.net/api-docs
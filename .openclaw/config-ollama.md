# Ollama Configuration for OpenClaw
## Local Embeddings + Fast Inference

## Service Status
- **Ollama API:** http://127.0.0.1:11434
- **Installed Models:**
  - ✅ nomic-embed-text:latest (274MB) — embeddings
  - 🔄 phi4-mini (2.5GB, downloading) — fast inference

## OpenClaw Config Addition

```jsonc
{
  "memory": {
    "embedding": {
      "provider": "ollama",
      "model": "nomic-embed-text",
      "host": "http://127.0.0.1:11434",
      "fallback": ["gemini", "openai"]
    },
    "indexConcurrency": 4,
    "deltaThreshold": {
      "bytes": 102400,
      "messages": 50
    }
  },
  "models": {
    "fast": {
      "provider": "ollama",
      "model": "phi4-mini",
      "host": "http://127.0.0.1:11434"
    }
  }
}
```

## Test Commands

```bash
# Test embedding
curl http://127.0.0.1:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "test embedding"
}'

# Test fast model (when ready)
curl http://127.0.0.1:11434/api/generate -d '{
  "model": "phi4-mini",
  "prompt": "Hello",
  "stream": false
}'
```

## Benefits

| Feature | Before | After |
|---------|--------|-------|
| Embeddings | OpenAI API ($) | Local nomic-embed-text (free) |
| Fast tier | Kimi K2.5 ($$) | Local phi4-mini (free) |
| Latency | Network round-trip | Localhost |
| Privacy | External API | On-device |

---

*Ollama integration for KimiClaw autonomous system*

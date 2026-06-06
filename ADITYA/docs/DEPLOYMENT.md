# Deployment

## Local API

```bash
PYTHONPATH=subagents uvicorn subagents.examples.backend_api:app --reload --port 8787
```

## Docker

```bash
docker build -t website-agent-bol .
docker run --rm -p 8787:8787 website-agent-bol
```

## Docker Compose

```bash
docker compose up --build
```

## Health Check

```bash
curl "http://localhost:8787/api/agent/health?manifestPath=subagents/examples/site-manifest.sample.json&clientId=local"
```

## API Key Example

```bash
export BOL_API_KEYS_JSON='{"*":"dev-local-key"}'
```

Then pass `apiKey=dev-local-key` in health query params or request JSON.

## CORS Example

For production deployments, set an explicit allowlist:

```bash
export BOL_ALLOWED_ORIGINS='["https://merchant.example.com","https://www.merchant.example.com"]'
```

For local demo-only setups, you can opt into wildcard origins:

```bash
export BOL_ALLOW_ALL_ORIGINS=true
```

Keep wildcard CORS out of production unless you have a very specific, reviewed reason to use it.

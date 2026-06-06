# Release Readiness

Use this checklist before calling a build production-ready.

## Core Runtime

- manifest validation passes
- integration doctor passes
- permission profiles verified (`strict`, `balanced`, `lenient`)
- sensitive boundaries pause correctly
- audit logging and replay verified

## Adapter Readiness

- `react-next` quickstart generates and validates
- `shopify` quickstart generates and validates
- `woocommerce` quickstart generates and validates
- `adobe-commerce` quickstart generates and validates
- each adapter includes a visible progress surface

## Operational Controls

- HTTPS endpoint
- API key auth enabled
- CORS restricted via `BOL_ALLOWED_ORIGINS`
- wildcard CORS only used in local demo mode via `BOL_ALLOW_ALL_ORIGINS=true`
- rate limits configured (`tenantId:clientId`)
- rollout starts in dry-run or low percentage

## UX And Safety

- launcher visible on target pages
- live activity/progress visible
- pause/handoff messaging is clear
- payment and destructive actions require human confirmation

## Verification Commands

```bash
PYTHONPATH=subagents python3 -m pytest subagents/tests
PYTHONPATH=subagents python3 -m bol.main --list-quickstarts
PYTHONPATH=subagents python3 -m bol.main --init-quickstart --quickstart-type react-next --quickstart-dir /tmp/aha-react --doctor-after-init
PYTHONPATH=subagents python3 -m bol.main --init-quickstart --quickstart-type shopify --quickstart-dir /tmp/aha-shopify --doctor-after-init
PYTHONPATH=subagents python3 -m bol.main --init-quickstart --quickstart-type woocommerce --quickstart-dir /tmp/aha-woo --doctor-after-init
PYTHONPATH=subagents python3 -m bol.main --init-quickstart --quickstart-type adobe-commerce --quickstart-dir /tmp/aha-adobe --doctor-after-init
PYTHONPATH=subagents python3 -m bol.main --export-handoff --handoff-adapter react-next --handoff-dir /tmp/aha-handoff
PYTHONPATH=subagents python3 -m bol.main --export-ops-bundle --manifest ./subagents/examples/site-manifest.sample.json --ops-bundle-dir /tmp/aha-ops --site-id example-site --site-name "Example Site"
```

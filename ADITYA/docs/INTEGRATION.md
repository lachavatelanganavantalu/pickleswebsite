# Website Agent Integration

This package exposes a stack-agnostic website-owned execution agent.

The website is the source of truth. The runtime uses subagents only as helpers
for perception and execution.

This is a fixed product contract, not a per-client custom build.

- The docs stay the same for every website.
- The client developer fills in site-specific values through the manifest and integration steps.
- We do not rewrite the product for each client.
- We do not change the runtime behavior to fit one website by hand.

Product roadmap and stack priority:

- `docs/PRODUCT_ROADMAP.md`
- `docs/PRODUCT_OVERVIEW.md`
- `docs/ADAPTERS.md`
- `docs/VISIBILITY.md`
- `docs/RELEASE_READINESS.md`

Contract and migration references:

- `subagents/docs/CONTRACT_V1.md`
- `subagents/docs/MIGRATION.md`
- `subagents/docs/COMPLIANCE.md`
- `subagents/docs/DEPLOYMENT.md`
- `subagents/docs/COMPATIBILITY.md`

CI workflow:

- `.github/workflows/bol-ci.yml` runs tests + manifest validation + doctor checks.

## Installation

From project root:

```bash
pip install -e .
```

With API extras:

```bash
pip install -e ".[api]"
```

CLI entrypoint:

```bash
bol-agent --help
```

## Runtime Architecture

The main runtime is composed of four focused agents:

- `WebsiteContractAgent`: reads the website manifest and answers what the site supports.
- `PlannerAgent`: turns finalized user intent into deterministic actions.
- `PermissionAgent`: enforces sensitive, restricted, and human-only boundaries.
- `ExecutionAgent`: uses helper subagents for browser navigation, OCR, clicks, typing, scrolling, and vision fallback.

## What a website publishes

The website should provide a small manifest that describes:

- site identity
- routes and pages
- workflows
- semantic UI elements
- sensitive actions
- success hints
- allowed or disallowed actions
- human handoff messages

The runtime never needs backend access. It only needs enough frontend meaning to navigate the same UI a normal user can see.

## What the developer installs

1. Add the runtime package to the project.
2. Publish a JSON manifest.
3. Point the agent at the manifest and homepage URL.
4. Provide semantic labels for important buttons, inputs, modals, and danger actions.
5. Use the onboarding questionnaire in `subagents/docs/WEBSITE_ONBOARDING.md` to collect the exact site answers before wiring the runtime.
6. Integrate with the same SDK/API contract described here, regardless of stack.
7. Use their own AI API key only for the chat or intent layer if they want BYOK.
8. Let their developer complete the wiring in their IDE or codebase without requesting product changes from us.

## Mandatory 3-Step Integration (Do Not Skip)

Every client integration must complete these three steps:

1. Mount the launcher UI in the site shell so users can enter intent.
2. Wire the launcher to a site-owned intent endpoint (`POST /api/agent/intent` or equivalent) that calls this runtime.
3. Provide a valid site manifest with real routes, workflows, elements, human-only boundaries, and success signals.

If step 3 is incomplete, the runtime still responds, but execution quality will be generic and may fall back to conservative dry-run planning.

## SDK integration surface

Use `WebsiteAgentSDK` as the public entry point.

```python
from bol import BOLConfig, WebsiteAgentSDK

config = BOLConfig(
    target_platform="my-site",
    site_name="My Site",
    site_home_url="https://example.com",
    execution_policy_profile="balanced",  # strict | balanced | lenient
    rollout_mode="enabled",               # enabled | dry_run | disabled
    rollout_percentage=100,               # 0..100
    approval_policy_mode="off",           # off | required | rules
    approval_rules=["contains:delete"],   # used when approval_policy_mode=rules
)
sdk = WebsiteAgentSDK(config=config)
sdk.load_manifest("./site-manifest.json")

health = sdk.get_health()
if not health["manifest_valid"]:
    raise ValueError(health["validation_errors"])

plan = sdk.plan("search invoices from last month")
result = sdk.run("search invoices from last month")
```

Optional approval hook before execution:

```python
def approve(payload: dict[str, object]) -> bool:
    # payload is dry-run output: plan/decisions/trace
    return True

result = sdk.run("search invoices from last month", approval_callback=approve)
```

Declarative approval policy examples:

- `approval_policy_mode="required"`: always pause for approval.
- `approval_policy_mode="rules"` + rules:
  - `requires_human`
  - `action_count>5`
  - `contains:delete`

## Example launch

```bash
bol-agent \
  --site-id my-site \
  --site-name "My Site" \
  --site-home-url "https://example.com" \
  --manifest ./site-manifest.json \
  --intent "Search for invoices from last month"
```

By default, invalid manifest references fail fast with explicit error details.  
If you want to continue anyway during development, pass:

```bash
--allow-invalid-manifest
```

## Validation command

```bash
bol-agent --manifest ./site-manifest.json --validate-manifest
```

## Integration Doctor (Pre-Go-Live)

Run one command before production deployment:

```bash
python -m bol.main --doctor --manifest ./site-manifest.json --tenant-registry ./tenants.json
```

Doctor validates:

- manifest parse and semantic presence
- tenant registry structure
- duplicate tenant IDs
- tenant manifest-path references (warning)
- workflow and action quality lints:
  - unknown route/element references
  - open_url without URL
  - weak click/type/scroll targeting
  - pause action without human handoff

## Manifest Schema Export

```bash
bol-agent --print-manifest-schema
```

Generated schema file for integrations:

- `subagents/schema/site-manifest.schema.json`

## Quickstart Scaffold Generator

Generate starter integration files:

```bash
bol-agent --init-quickstart --quickstart-type plain-html --quickstart-dir ./agent-quickstart
```

List supported quickstarts:

```bash
bol-agent --list-quickstarts
```

Generate and validate in one command:

```bash
bol-agent \
  --init-quickstart \
  --quickstart-type plain-html \
  --quickstart-dir ./agent-quickstart \
  --doctor-after-init
```

Validate an existing scaffold directory:

```bash
bol-agent --doctor-quickstart-dir ./agent-quickstart
```

## Client Handoff Bundle Export

Generate a single folder for client developers that includes the selected adapter scaffold, the main docs, and a sample manifest:

```bash
bol-agent --export-handoff --handoff-adapter react-next --handoff-dir ./client-handoff
```

Supported adapter values:

- `plain-html`
- `react-next`
- `backend-only`
- `shopify`
- `woocommerce`
- `adobe-commerce`

The exported bundle is meant to be shared with the client developer as the starting point for integration.

## Production Evidence Bundle Export

Generate a production-readiness snapshot with manifest validation, doctor results, health, and audit integrity:

```bash
bol-agent \
  --export-ops-bundle \
  --manifest ./site-manifest.json \
  --ops-bundle-dir ./ops-bundle \
  --site-id my-site \
  --site-name "My Site"
```

The bundle includes:

- `manifest-validation.json`
- `health.json`
- `doctor.json`
- `audit-integrity.json`
- `summary.json`

Supported types:

- `plain-html`
- `react-next`
- `backend-only`
- `shopify`
- `woocommerce`
- `adobe-commerce`

## Manifest Authoring Snippets

List snippet templates:

```bash
bol-agent --list-manifest-snippets
```

Export a snippet:

```bash
bol-agent \
  --export-manifest-snippet search-workflow \
  --snippet-output ./search-workflow.snippet.json
```

Compose snippets directly into a base manifest:

```bash
bol-agent \
  --compose-manifest \
  --manifest ./site-manifest.json \
  --compose-snippets search-workflow,delete-sessions-workflow \
  --compose-output ./site-manifest.composed.json \
  --compose-conflict-strategy fail
```

## Dry-run command (no browser execution)

```bash
bol-agent \
  --manifest ./site-manifest.json \
  --intent "Search invoices from last month" \
  --policy-profile balanced \
  --dry-run
```

## Templates

- React/Next integration sketch: `subagents/examples/integration/react-next.ts`
- Plain JS integration sketch: `subagents/examples/integration/plain-js.js`
- Local harness script: `subagents/examples/harness.py`
- FastAPI backend wrapper: `subagents/examples/backend_api.py`
- Python client stub: `subagents/examples/clients/python_client.py`
- TypeScript client stub: `subagents/examples/clients/typescript-client.ts`

## Backend API wrapper

Run the example backend:

```bash
PYTHONPATH=subagents uvicorn subagents.examples.backend_api:app --reload --port 8787
```

Optional multi-tenant mode:

```bash
export BOL_TENANTS_PATH=subagents/examples/tenants.sample.json
```

Endpoints:

- `POST /api/agent/validate`
- `POST /api/agent/intent`
- `GET /api/agent/health`

Security controls:

- Optional API key auth via `BOL_API_KEYS_JSON` env:
  - example: `{"default":"your-key","client-a":"client-a-key","*":"fallback-key"}`
- Request payload/query should include:
  - `apiKey`
  - `clientId` (for rate limiting buckets)
- Built-in rate limit:
  - 60 requests per 60 seconds per `tenantId:clientId`

In multi-tenant mode, send `tenantId` in requests and the backend resolves
manifest/config from the tenant registry.

Health endpoint returns:

- readiness (`ready` or `not_ready`)
- manifest validation summary
- integration doctor report
- resolved tenant/runtime settings
- operator rollout/audit settings:
  - `rollout_mode`
  - `rollout_percentage`
  - `execution_policy_profile`
  - `strict_manifest_validation`
  - `audit_log_path`
  - `audit_integrity` (hash-chain verification result)

Replay from audit log:

```bash
bol-agent \
  --replay-audit \
  --audit-file ./data/audit/default.jsonl \
  --replay-run-index -1 \
  --replay-output ./replay-latest.json
```

## Sensitive boundaries

The site should mark these as pause-and-handoff actions:

- OTP
- passwords
- PINs
- payment authorization
- destructive actions
- legal confirmation

## Design rule

The agent may do anything the user can do on that site, but it must stop where the site says the human must take over.

## AI usage

AI is optional at execution time. BYOK is supported for the chat/intake layer only: the site can use its own AI API key to understand the user and finalize intent. After that, this runtime executes the website-owned workflow from the manifest.

Important: the agent runtime is not re-authored per client. The client supplies their site data, their manifest, and their own AI key if needed. The product contract stays universal.

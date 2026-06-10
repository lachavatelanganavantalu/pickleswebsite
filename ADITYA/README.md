# ADITYA Protocol

ADITYA Protocol is a neutral website-assistant integration standard.

It is not tied to any one customer, vertical, or stack. A client developer can
take this folder, map the manifest to their own site, and wire the assistant
into their existing UI.

## What is included

- `site-manifest.json`: starter manifest for routing and workflow mapping
- `site-manifest.sample.json`: a second generic manifest example
- `quickstart/`: React/Next integration scaffold
- `docs/`: integration, onboarding, and release guidance
- `docs/LACHAVA_WORKFLOWS.md`: all 14 manifest workflows + runtime flows on the live Lachava site
- `CLIENT_SETUP.md`: what the client developer needs to provide
- `generate-intent-dictionary.mjs`: builds the chat intent dictionary from the manifest
- `intent-dictionary.json`: generated word, phrase, and sentence mapping for chat routing

## How the protocol works

1. The client developer maps their site routes, buttons, forms, and sensitive actions into `site-manifest.json`.
2. The chat layer uses `intent-dictionary.json` to match user wording to the right workflow.
3. The runtime follows the manifest and executes only the allowed public flows.
4. Sensitive actions pause for human confirmation.

## Example chat phrases

- "search for an item"
- "add this to cart"
- "go to checkout"
- "open support"
- "change password"

## Generate the intent dictionary

Run this from the workspace root:

```bash
node ADITYA/generate-intent-dictionary.mjs ADITYA/site-manifest.json ADITYA/intent-dictionary.json
```

This reads the workflow `intent_hints` from the manifest and writes a chat-ready dictionary file.

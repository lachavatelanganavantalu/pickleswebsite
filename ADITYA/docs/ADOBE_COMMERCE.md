# Adobe Commerce / Magento Adapter

This adapter is for merchants running Adobe Commerce or Magento-based
storefronts.

## What The Merchant Needs

- a module or storefront shell mount point
- a site-owned intent endpoint
- a manifest path
- a site ID and site name
- a client ID for rate limiting
- an optional tenant ID
- an optional BYOK key for the chat/intake layer

## Where To Mount The Launcher

Recommended places:

- storefront theme
- PWA shell
- module output area
- shared layout shell

## What The Launcher Talks To

The launcher should call a site-owned endpoint owned by the merchant app or
backend. That endpoint can be:

- a Magento controller
- a service endpoint
- a PWA backend route
- any existing site-owned API

## Starter Files

- `examples/quickstart_templates/adobe-commerce/README.md`
- `examples/quickstart_templates/adobe-commerce/agent-client.ts`
- `examples/quickstart_templates/adobe-commerce/site-agent.js`
- `examples/quickstart_templates/adobe-commerce/site-manifest.json`

## Integration Rule

Do not hard-code Adobe Commerce-specific logic into the core runtime. Keep it
as an adapter wrapper around the universal contract.


# Shopify Adapter

This adapter is for Shopify merchants who want a clean, low-friction launch
path.

## What Shopify Merchants Need

- an app embed block or theme app extension
- a site-owned intent endpoint
- a manifest path
- a merchant/site ID
- a client ID for rate limiting
- an optional tenant ID
- an optional BYOK key for the chat/intake layer

## Where To Mount The Launcher

Recommended places:

- app embed block
- theme app extension
- storefront shell

## What The Launcher Talks To

The launcher should call a site-owned endpoint owned by the merchant's app or
backend. That endpoint can be:

- a Next.js route handler
- a Node service
- a serverless function
- any existing site-owned API

## Starter Files

- `examples/quickstart_templates/shopify/README.md`
- `examples/quickstart_templates/shopify/agent-client.ts`
- `examples/quickstart_templates/shopify/theme-app-extension.liquid`
- `examples/quickstart_templates/shopify/site-manifest.json`

## Integration Rule

Do not hard-code Shopify-specific logic into the core runtime. Keep Shopify as
an adapter wrapper around the universal contract.


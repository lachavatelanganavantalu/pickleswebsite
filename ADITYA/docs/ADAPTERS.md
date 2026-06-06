# Stack Adapters

The runtime is universal. Adapters exist only to make integration easy for the
most common merchant stacks.

## Adapter Priority

1. Next.js / React storefronts
2. Shopify stores
3. WooCommerce / WordPress stores
4. Adobe Commerce / Magento stores
5. Generic fallback for everything else

## What An Adapter Must Provide

- a launcher mount point
- a site-owned intent endpoint or route handler
- a manifest path
- a site ID and site name
- a client ID for rate limiting
- an optional tenant ID for multi-tenant setups
- an optional BYOK chat key for the site-owned conversation layer

## Next.js / React

Use this when the merchant owns the storefront and ships custom React code.

Recommended mount points:

- root layout
- shared provider shell
- app-level header/footer

Recommended endpoint shape:

- a Next route handler
- a server action
- or any existing site-owned service endpoint

Reference files:

- `examples/integration/react-next.ts`
- `examples/quickstart_templates/react-next/README.md`
- `examples/quickstart_templates/react-next/agent-client.ts`
- `examples/quickstart_templates/react-next/agent-bootstrap.ts`
- `examples/quickstart_templates/react-next/agent-activity-panel.tsx`
- `docs/PRODUCT_OVERVIEW.md`
- `docs/VISIBILITY.md`

## Shopify

Use this when the merchant runs a Shopify store and wants a fast integration
path with minimal engineering work.

Recommended mount points:

- app embed block
- theme app extension
- storefront app shell

Recommended endpoint shape:

- app backend route
- edge function
- site-owned service endpoint

Reference files:

- `examples/quickstart_templates/plain-html/README.md`
- `docs/WEBSITE_ONBOARDING.md`
- `examples/quickstart_templates/shopify/README.md`
- `docs/SHOPIFY.md`
- `examples/quickstart_templates/shopify/theme-app-extension.liquid`

## WooCommerce / WordPress

Use this when the merchant runs a WordPress site with WooCommerce.

Recommended mount points:

- theme header/footer
- widget area
- plugin shortcode block

Recommended endpoint shape:

- WordPress REST endpoint
- plugin AJAX handler
- site-owned service endpoint

Reference files:

- `examples/quickstart_templates/woocommerce/README.md`
- `examples/quickstart_templates/woocommerce/site-agent.php`
- `examples/quickstart_templates/woocommerce/site-agent-client.js`
- `docs/WOOCOMMERCE.md`

## Adobe Commerce / Magento

Use this when the merchant has a larger catalog and more complex commerce
operations.

Recommended mount points:

- storefront theme
- PWA shell
- module-level integration

Recommended endpoint shape:

- Magento controller
- service endpoint
- app backend route

Reference files:

- `examples/quickstart_templates/adobe-commerce/README.md`
- `examples/quickstart_templates/adobe-commerce/site-agent.js`
- `examples/quickstart_templates/adobe-commerce/agent-client.ts`
- `docs/ADOBE_COMMERCE.md`

## Generic Fallback

For sites that do not fit a specific adapter, use the stable contract only:

- launcher UI
- manifest
- site-owned endpoint
- optional BYOK chat/intake layer

## Rule

Do not introduce stack-specific runtime behavior into the core engine. Only the
integration wrapper changes.

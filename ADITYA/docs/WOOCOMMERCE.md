# WooCommerce / WordPress Adapter

This adapter is for merchants running WordPress with WooCommerce.

## What The Merchant Needs

- a plugin or shortcode mount point
- a site-owned intent endpoint
- a manifest path
- a site ID and site name
- a client ID for rate limiting
- an optional tenant ID
- an optional BYOK key for the chat/intake layer

## Where To Mount The Launcher

Recommended places:

- theme header/footer
- widget area
- shortcode block
- custom plugin output

## What The Launcher Talks To

The launcher should call a site-owned endpoint owned by the merchant site or
plugin backend. That endpoint can be:

- a WordPress REST route
- a plugin AJAX handler
- a site-owned service endpoint

## Starter Files

- `examples/quickstart_templates/woocommerce/README.md`
- `examples/quickstart_templates/woocommerce/agent-client.ts`
- `examples/quickstart_templates/woocommerce/site-agent.php`
- `examples/quickstart_templates/woocommerce/site-manifest.json`

## Integration Rule

Do not hard-code WooCommerce-specific logic into the core runtime. Keep
WooCommerce as an adapter wrapper around the universal contract.


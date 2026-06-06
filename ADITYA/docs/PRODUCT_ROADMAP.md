# Product Roadmap

This document captures the product strategy for the website-owned AHA runtime.

## Product Principle

- One universal core engine.
- One manifest contract.
- One launcher pattern.
- Stack-specific adapters only where they help adoption.
- No per-client custom runtime logic.

## Build Order

### Phase 1 - Universal Core

Ship and stabilize the core runtime:

- manifest parsing and validation
- workflow planning
- permission and handoff policy
- execution orchestration
- audit and replay
- rollout and dry-run controls
- visible assistant launcher contract

### Phase 2 - Reference Adapter

Ship a clean reference adapter for the most common custom storefront pattern:

- Next.js App Router
- route handler or server action endpoint
- embeddable launcher UI
- BYOK chat/intake integration

Adapter reference: `docs/ADAPTERS.md`

### Phase 3 - Commerce Adapters

Prioritize the commerce stacks that merchants actually use:

- Shopify
- WooCommerce / WordPress
- Adobe Commerce / Magento

These should be treated as first-class adapter targets, not custom one-offs.

### Phase 4 - Generalized Coverage

Expand the same contract to additional stacks and deployment styles:

- plain HTML / vanilla JS
- CMS/plugin-style installs
- custom headless storefronts
- backend-only integrations

## Who Pays

The buyer is usually:

- the merchant owner
- the ecommerce or growth lead
- the engineering lead
- an agency or freelancer building the store

The product is valuable if it:

- reduces support cost
- improves conversion
- automates repetitive user tasks
- lowers manual handling
- stays safe around sensitive actions

## Primary Target Markets

1. Custom storefronts on Next.js / React
2. Shopify stores
3. WooCommerce stores
4. Adobe Commerce / Magento stores

## Example Tenant Rule

- Example tenant bundles can exist for testing.
- Example tenants must not define the product shape.
- The core runtime and docs must stay universal.

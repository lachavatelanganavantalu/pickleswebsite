# Lachava ADITYA workflows

This document lists every ADITYA workflow/tool wired on the Lachava site (`lachava-pickles`), how each is triggered, what it does in the browser, and known limits.

**Source of truth:** `ADITYA/site-manifest.json` and `ADITYA/intent-dictionary.json`  
**Runtime:** `POST /api/agent/intent` → `src/lib/aditya/match-intent.ts` → `src/components/aditya/AdityaAssistant.tsx`

---

## Count: 14 manifest workflows (not 13)

The site manifest and intent dictionary define **14** public workflows. An earlier “13 tools” count was off by one.

There are also **5 runtime-only flows** (not separate manifest entries) for navigation shortcuts, order placement, off-menu items, and sensitive chat blocking.

---

## Site detection (separate from chat tools)

Scanners do **not** use the workflow list. They use:

| Step | URL / check | Lachava |
|------|-------------|---------|
| 1 | `GET /.well-known/aditya.json` → `"aditya": true` | Yes — `src/app/.well-known/aditya.json/route.ts` |
| 2 (fallback) | Homepage HTML contains `data-aditya-key`, `aditya-fab`, or `aditya-launcher` | Yes — `aditya-fab` on all public pages |

Optional: `GET /llms.txt` points to the well-known URL.

---

## The 14 manifest workflows

| # | `workflow_id` | Name | Example phrases | Action | Route / effect | Human pause? |
|---|---------------|------|-----------------|--------|----------------|--------------|
| 1 | `open_launcher` | Open assistant | `ask`, `help`, `assistant`, `open assistant` | `noop` | Panel is already open when user sends a message | No |
| 2 | `search_content` | Search pickles | `search mango pickle`, `find chicken`, `show me combo` | `open_search` | Opens navbar search with query | No |
| 3 | `add_to_cart` | Add to cart | `buy mutton pickle 1 kg`, `add tomato pickle`, `order combo` | `add_to_cart` | Resolves product/combo + weight, adds to cart | No |
| 4 | `browse_shop` | Browse shop | `shop`, `pickles`, `products`, `menu`, `browse` | `navigate` | `/products` | No |
| 5 | `browse_combos` | Browse combos | `combo`, `combos`, `5 pickles`, `999` | `navigate` | `/combos` | No |
| 6 | `view_cart` | View cart | `cart`, `my cart`, `view cart`, `basket` | `navigate` | `/cart` | No |
| 7 | `review_cart_and_checkout` | Review cart and checkout | `checkout`, `proceed to checkout`, `go to checkout` | `navigate` then `pause` | `/checkout` — user must review and place order on page | **Yes** at place order |
| 8 | `track_order` | Track order | `track order`, `order status`, `where is my order` | `navigate` | `/track` | No |
| 9 | `navigate_to_account` | Open account | `account`, `my account`, `my orders`, `orders` | `navigate` | `/account` | No |
| 10 | `sign_up` | Sign up | `sign up`, `signup`, `create account`, `register` | `navigate` | `/account?tab=register` | No |
| 11 | `sign_in` | Log in | `log in`, `login`, `sign in` | `navigate` | `/account?tab=login` | No |
| 12 | `change_password` | Change password | `change password`, `update password`, `reset password` | `navigate` then `pause` | `/account` — user changes password on page | **Yes** |
| 13 | `contact_support` | Contact support | `contact`, `support`, `whatsapp`, `help` | `navigate` | `/contact` | No |
| 14 | `complete_payment` | Complete payment | `payment`, `pay`, `upi`, `complete payment` | `pause` | Opens payment/checkout handoff — no UPI in chat | **Yes** |

### Restricted actions (manifest)

From `site-manifest.json`:

- `change_password`
- `place_order` (handled at checkout pause inside workflow 7)
- `complete_payment`

Sensitive keywords monitored: `otp`, `password`, `payment`, `delete`, `confirm`, `pin`, `upi`.

---

## Runtime-only flows (not separate manifest rows)

These are resolved **before** dictionary workflow matching in `match-intent.ts`.

| `workflow_id` | Name | Trigger | Effect | Notes |
|---------------|------|---------|--------|-------|
| `sensitive_shared_credential` | Sensitive information blocked | User pastes password/OTP in chat | Blocks; hides message | By design |
| `sensitive_shared_payment` | Payment details blocked | User pastes CVV/PIN/card in chat | Blocks; hides message | By design |
| `sensitive_payment_handoff` | Complete payment securely | `pay now`, `pay via gpay`, etc. | Navigates to checkout or order payment page | Overrides naive “pay” matching |
| `place_order` | Place order | `place order`, `submit order`, `confirm order` | Calls order API if logged in + cart + delivery complete | Else redirects to login/checkout |
| `unknown_pickle` | Off-menu pickle | Unknown product name (e.g. prawn, gongura) | WhatsApp handoff message | Not in catalog |
| `view_product` | View product | `open mutton pickle`, product name navigation | `/products/[slug]` | From `match-navigate-intent.ts` |

### Navigation shortcuts (also runtime)

`src/lib/aditya/site-navigation.ts` maps extra destinations without their own manifest workflow row. Examples:

| Destination id | Path | Example phrases |
|----------------|------|-----------------|
| `home` | `/` | `home`, `homepage` |
| `veg_pickles` | `/veg-pickles` | `veg pickles`, `vegetarian` |
| `non_veg_pickles` | `/non-veg-pickles` | `non veg`, `meat pickles` |
| `wishlist` | `/wishlist` | `wishlist`, `favorites`, `saved items` |
| `checkout` | `/checkout` | `checkout`, `delivery details` |
| `change_password` | `/account` | `change password` (+ human pause) |

These use the destination `id` as `workflow_id` in the API response.

---

## Intent resolution order

When a user sends a message in the assistant:

1. **Sensitive chat** — credentials/payment secrets blocked; payment phrases → secure handoff  
2. **Place order** — `place_order` if phrase matches  
3. **Navigate** — site destinations, search-with-query, product page  
4. **Unknown pickle** — off-menu catalog terms  
5. **Buy intent** — multi-item parse → `add_to_cart` (+ optional delivery draft → checkout)  
6. **Dictionary workflow** — score match against `intent-dictionary.json` (min score 50)

Endpoint: `POST /api/agent/intent` with `{ "intent": "..." }`.

---

## What “works perfectly” means here

| Category | Status |
|----------|--------|
| Browse, cart, track, contact, sign up/in | Works for typical phrases |
| Search | Opens navbar search; depends on site search handler |
| Add to cart | Works for catalog products + combo; weight must match variant |
| Checkout / payment / password | **Navigate only** — user completes on page (by design) |
| Place order via chat | Works only when logged in, cart non-empty, delivery fields saved |
| Off-menu pickles | WhatsApp message, not cart add |
| Odd phrasing | May miss dictionary match → “Try: home, shop, cart…” |

---

## Regenerating the dictionary

After editing `site-manifest.json`:

```bash
node ADITYA/generate-intent-dictionary.mjs ADITYA/site-manifest.json ADITYA/intent-dictionary.json
```

---

## Related files

| File | Role |
|------|------|
| `ADITYA/site-manifest.json` | Workflow definitions and routes |
| `ADITYA/intent-dictionary.json` | Chat phrase → workflow mapping |
| `src/lib/aditya/match-intent.ts` | Main intent resolver |
| `src/lib/aditya/match-navigate-intent.ts` | Nav, search, product page |
| `src/lib/aditya/match-sensitive-intent.ts` | Secrets + payment handoff |
| `src/lib/aditya/match-place-order-intent.ts` | Place order |
| `src/lib/aditya/apply-cart-action.ts` | Cart add execution |
| `src/components/aditya/AdityaAssistant.tsx` | UI + action execution |
| `src/app/.well-known/aditya.json/route.ts` | Public ADITYA detection signal |

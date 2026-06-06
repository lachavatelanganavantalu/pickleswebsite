# Client Developer Setup

This document is for the client developer who will integrate ADITYA Protocol into their website.

## What to provide

- live site URL
- staging or test site URL
- framework / stack
- route map for public pages
- route map for authenticated or admin pages
- labels or selectors for important buttons and inputs
- forms and validation rules
- sensitive actions that must pause for user confirmation
- sample user phrases for the site dictionary
- support or escalation rules
- brand tone and UI constraints

## What to wire in the site

- assistant launcher
- intent endpoint or equivalent
- manifest loader
- dictionary matcher or chat-to-intent layer
- public workflows for browse, search, contact, checkout, and account help
- pause points for payment, password changes, deletion, and other irreversible steps

## Integration order

1. Mount the launcher in the app shell.
2. Connect the launcher to the site-owned intent endpoint.
3. Load `site-manifest.json` and `intent-dictionary.json`.
4. Map the site routes, buttons, forms, and sensitive actions.
5. Add the activity panel or progress surface so users can see what is happening.
6. Test the main flows on staging.
7. Verify that sensitive actions pause correctly.
8. Confirm the chat window shows the ADITYA brand block with `powered by ADITYA` and the subtitle `Agentic Deterministic Interface for Tasks, Yield and Access`.

## What to avoid

- do not modify the protocol to fit one site by hand
- do not expose admin-only actions to public users
- do not auto-complete sensitive actions
- do not ship without staging validation

## Minimum integration outputs

- valid `site-manifest.json`
- working `intent-dictionary.json`
- launcher mounted in the site shell
- site-owned endpoint for intent submission
- human handoff message for sensitive steps
- visible ADITYA brand block in the chat or activity surface

## Notes on learning

If the client wants adaptive matching without live AI, store approved or learned aliases in a client-owned alias file or database table. Keep it local to the site and load it before fuzzy matching.

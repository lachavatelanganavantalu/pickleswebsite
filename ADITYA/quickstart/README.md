# React/Next Quickstart

Use these files in your Next.js app:

- `agent-client.ts`: frontend helper to call your site-owned endpoint.
- `agent-bootstrap.ts`: site metadata payload helper.
- `agent-activity-panel.tsx`: visible progress surface for the user.
- `site-manifest.json`: starter manifest.
- `app/api/agent/intent/route.ts`: optional route-handler pattern you can adapt.

The Next.js app can call its own route handler, a server action, or any other
site-owned endpoint. The runtime itself is not embedded in Next.js.

## Mandatory Integration Checklist

For real website execution (not just demo response), every integration must include:

1. Launcher UI mounted in the app shell.
2. Endpoint wiring from launcher/client helper to a site-owned runtime API.
3. Valid site manifest with real routes, workflows, key elements, sensitive boundaries, and success signals.
4. A visible ADITYA brand block in the chat or activity surface, with no icon and a small subtitle line.

Without the manifest quality in step 3, outputs can remain generic or dry-run oriented.

## Recommended implementation order

1. Add the launcher component to the app shell.
2. Wire the launcher to the site-owned intent endpoint.
3. Load the manifest and intent dictionary.
4. Connect the workflow map to the real site buttons, forms, and routes.
5. Add pause messages for sensitive steps.
6. Test in staging before production.

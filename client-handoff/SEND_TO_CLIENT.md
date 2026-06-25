# Message To Send Client Developer

Hi, here is the simplified integration path for `ai` (assistance interface).

You only need three things:

1. Serve `ai-workflows.json` from your website public folder.
2. Add `<div id="ai"></div>` where the assistance interface should appear.
3. Mount the SDK with:

```ts
import { createAssistanceInterface } from "@reptile/ai";

createAssistanceInterface({
  mount: "#ai",
  workflowBundle: "/ai-workflows.json",
  title: "ai"
});
```

For buttons or links that workflows need to activate, add stable markers:

```html
<button data-ai-target="orders-history">Orders</button>
<a data-ai-target="track-package" href="/track">Track Package</a>
```

The system only runs approved first-party workflows. It does not use a browser extension, visual OCR, mouse automation, or a generic bot.

Files included:

- `ai-workflows.json`
- `CLIENT_INTEGRATION.md`
- `nextjs-example.tsx`
- `plain-html-example.html`

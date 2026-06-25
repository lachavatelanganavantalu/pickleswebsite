# ai Client Integration

`ai` means assistance interface. It is not a generic browser bot.

This integration uses:

- one approved workflow bundle: `ai-workflows.json`
- one SDK function: `createAssistanceInterface`
- optional semantic markers: `data-ai-target`

## 1. Put workflow bundle in the website public folder

Place this file where the website can serve it:

`/ai-workflows.json`

For example:

- Next.js: `public/ai-workflows.json`
- Vite/React: `public/ai-workflows.json`
- Plain HTML: next to `index.html` or in public assets

## 2. Add a mount element

```html
<div id="ai"></div>
```

## 3. Mount the assistance interface

```ts
import { createAssistanceInterface } from "@reptile/ai";

createAssistanceInterface({
  mount: "#ai",
  workflowBundle: "/ai-workflows.json",
  title: "ai"
});
```

## 4. Add stable targets for button/page actions

For workflows that activate a button or link, add stable markers:

```html
<button data-ai-target="orders-history">Orders</button>
<a data-ai-target="track-package" href="/track">Track Package</a>
```

## 5. Required behavior

The website should support:

- stable routes for important pages
- keyboard focus for interactive controls
- deterministic states for workflow completion

## 6. What not to do

Do not integrate browser extensions, external automation, visual OCR, or mouse-control agents.

This is a first-party website integration only.

## 7. Developer checklist

- Serve `ai-workflows.json`.
- Mount `#ai`.
- Import and call `createAssistanceInterface`.
- Add `data-ai-target` for important buttons/links.
- Test five common requests from the user journey.

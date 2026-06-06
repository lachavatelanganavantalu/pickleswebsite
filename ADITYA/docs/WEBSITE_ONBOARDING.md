# Website Onboarding Questionnaire

This project is built for website-owned agents.

The website owner keeps ownership of the agent runtime. Their developer answers
the questions below, adds the manifest, and wires the runtime into the site.

The onboarding answers must fit the fixed contract. They are not a request for
us to create a custom variant of the product.

## What BYOK Means

BYOK is for the chat or intake layer only.

- The website can use its own AI API key for conversational intent capture.
- After intent is finalized, the website-owned runtime executes the workflow.
- The runtime does not need the website's backend or business logic.
- Sensitive actions still stop for human confirmation.

## What the Developer Must Provide

1. A site manifest describing routes, elements, workflows, and sensitive actions.
2. A homepage URL or route where the agent starts.
3. The list of supported user tasks the site should let the agent perform.
4. The pause-and-handoff boundaries for OTP, password, payment, deletion, legal confirmation, and similar actions.
5. Any selectors, data-testid values, or semantic labels that make the UI easier to map.
6. A test environment or staging page if the production site is not safe to automate directly.

## Questions To Ask The Website Developer

### 1. Identity

- What is the site name?
- What is the site ID?
- What is the homepage URL?
- What stack is used, if known?
- Is there a staging URL we should use first?

### 2. Supported Workflows

- What are the top 3 to 10 user tasks the site should support?
- Which tasks should the agent complete end to end?
- Which tasks should the agent pause on and hand back to the user?
- Which tasks should the agent never start on its own?
- Which tasks are the highest business value first?

### 3. Pages And Routes

- What are the main routes or pages?
- Which route is the home page?
- Which routes are authenticated?
- Which routes are internal-only?
- Which route usually starts each workflow?

### 4. Semantic Elements

- Which element opens search?
- Which element submits a form?
- Which element goes to checkout?
- Which element confirms an action?
- Which element opens settings or account management?
- Which elements are better identified by label, selector, or `data-testid`?

### 5. Forms And Inputs

- Which fields are required?
- Which fields are optional?
- Which fields may be autofilled?
- Which fields are user-editable?
- Which fields are read-only?
- Which validation rules exist for each field?

### 6. Sensitive Boundaries

- Which actions must always stop and wait for the user?
- Which fields contain OTP, password, PIN, payment, or legal confirmation?
- Which actions are destructive or irreversible?
- Which pages should be blocked unless the user confirms?
- What message should the agent show when it pauses?

### 7. Success Criteria

- How does the developer know each workflow finished correctly?
- What visible text proves success?
- What URL or page should be reached at the end?
- What toast, banner, or modal confirms completion?

### 8. Error Handling

- What should happen if a field is missing?
- What should happen if a step fails?
- What should happen if a modal appears unexpectedly?
- What should happen if login expires?
- What should happen if inventory or session state changes?

### 9. Permissions And Limits

- What actions are allowed for the agent?
- What actions are restricted?
- What rate limits or rollout controls should be enabled?
- What approval policy should be used?
- Should dry-run be enabled during rollout?

### 10. Integration Details

- Should the site use the backend API wrapper, the SDK, or both?
- Which environment variables will the developer set?
- What is the API base URL?
- What client ID should be used for rate limiting?
- What tenant ID should be used if the site is multi-tenant?
- What own-AI provider and API key will the site use for the chat layer?

## Suggested Response Format

The developer can answer in this shape:

```json
{
  "site_name": "Example Site",
  "site_id": "example-site",
  "homepage_url": "https://example.com",
  "stack_hint": "next.js",
  "workflows": [
    {
      "name": "Search invoices",
      "intent": "search invoices from last month",
      "start_route": "/dashboard",
      "success_hint": "Invoice list updated",
      "pause_on_sensitive_steps": false
    }
  ],
  "sensitive_actions": [
    "delete sessions",
    "payment authorization"
  ],
  "allowed_autofill_fields": [
    "name",
    "email",
    "phone"
  ],
  "pause_message": "Please confirm this step manually."
}
```

## What Happens After The Answers

1. Convert the answers into `site-manifest.json` or an equivalent manifest file.
2. Validate the manifest.
3. Run the doctor checks.
4. Have the client developer wire the manifest into their site using the same SDK/API contract.
5. Keep the AI layer limited to chat and intent finalization if the website wants BYOK.
6. Keep the product itself unchanged across clients.

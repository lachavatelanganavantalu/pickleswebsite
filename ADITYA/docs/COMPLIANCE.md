# Compliance Notes

## Data Boundary

The runtime uses frontend semantics and browser-visible state. It does not require
database access, internal backend access, or proprietary business logic access.

## Sensitive Inputs

The website manifest should mark these as human-only:

- OTP
- password
- PIN
- payment authorization
- legal confirmation
- destructive account actions

## Audit Logging

Audit logs are JSONL and hash-chained. The logger redacts:

- API keys
- passwords
- OTPs
- PINs
- tokens
- secrets
- email-like strings
- phone-like strings

## Retention

Production deployments should set a tenant-specific retention policy for
`data/audit/*.jsonl`. This repository provides local files only; long-term
storage policy belongs to the website owner.

## Operator Controls

Available controls:

- `rollout_mode`
- `rollout_percentage`
- `approval_policy_mode`
- `approval_rules`
- `execution_policy_profile`
- API keys via `BOL_API_KEYS_JSON`
- rate limiting by `tenantId:clientId`

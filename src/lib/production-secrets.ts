const WEAK_SECRETS = new Set([
  "lachava-admin-secret",
  "lachava-customer-session-change-me",
  "lachava-dev-only-admin-session",
  "lachava-dev-only-customer-session",
  "lachava-dev-only-order-payment-token",
  "use-a-long-random-string-here",
  "change-this-password",
]);

const MIN_SESSION_SECRET_LENGTH = 16;
const MIN_ADMIN_PASSWORD_LENGTH = 8;

function isBlank(value: string | undefined): boolean {
  return !value?.trim();
}

function isKnownWeakValue(value: string): boolean {
  return WEAK_SECRETS.has(value.trim());
}

/** Session / cookie signing — required for checkout and customer login. */
function isWeakSessionSecret(value: string | undefined): boolean {
  if (isBlank(value)) return true;
  const trimmed = value!.trim();
  if (trimmed.length < MIN_SESSION_SECRET_LENGTH) return true;
  return isKnownWeakValue(trimmed);
}

/** Admin panel password — must not block customer checkout if short but non-default. */
function isWeakAdminPassword(value: string | undefined): boolean {
  if (isBlank(value)) return true;
  const trimmed = value!.trim();
  if (trimmed.length < MIN_ADMIN_PASSWORD_LENGTH) return true;
  return isKnownWeakValue(trimmed);
}

function sessionSecretCandidates(): (string | undefined)[] {
  return [process.env.CUSTOMER_SESSION_SECRET, process.env.SESSION_SECRET];
}

function hasUsableSessionSecret(): boolean {
  return sessionSecretCandidates().some((value) => !isWeakSessionSecret(value));
}

/** Secrets required before customers can place orders (not admin credentials). */
export function getOrderCheckoutSecretIssues(): string[] {
  if (process.env.NODE_ENV !== "production") return [];

  if (hasUsableSessionSecret()) return [];

  return [
    "SESSION_SECRET must be set for checkout (at least 16 random characters, not the .env.example placeholder).",
  ];
}

/** Full production config review — admin credentials, etc. */
export function getProductionSecretIssues(): string[] {
  if (process.env.NODE_ENV !== "production") return [];

  const issues: string[] = [];

  issues.push(...getOrderCheckoutSecretIssues());

  if (!process.env.ADMIN_USERNAME?.trim() || isBlank(process.env.ADMIN_PASSWORD)) {
    issues.push("ADMIN_USERNAME and ADMIN_PASSWORD must be set.");
  } else if (isWeakAdminPassword(process.env.ADMIN_PASSWORD)) {
    issues.push("ADMIN_PASSWORD is missing, too short, or still the default placeholder.");
  }

  return issues;
}

export function assertOrderCheckoutSecretsConfigured(): void {
  const issues = getOrderCheckoutSecretIssues();
  if (issues.length > 0) {
    throw new Error(issues.join(" "));
  }
}

export function assertProductionSecretsConfigured(): void {
  const issues = getProductionSecretIssues();
  if (issues.length > 0) {
    throw new Error(issues.join(" "));
  }
}

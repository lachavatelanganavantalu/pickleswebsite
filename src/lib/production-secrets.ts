const WEAK_SECRETS = new Set([
  "lachava-admin-secret",
  "lachava-customer-session-change-me",
  "lachava-dev-only-admin-session",
  "lachava-dev-only-customer-session",
  "lachava-dev-only-order-payment-token",
  "use-a-long-random-string-here",
  "change-this-password",
]);

function isWeak(value: string | undefined): boolean {
  if (!value?.trim()) return true;
  const trimmed = value.trim();
  if (trimmed.length < 24) return true;
  return WEAK_SECRETS.has(trimmed);
}

export function getProductionSecretIssues(): string[] {
  if (process.env.NODE_ENV !== "production") return [];

  const issues: string[] = [];

  if (isWeak(process.env.SESSION_SECRET)) {
    issues.push("SESSION_SECRET must be a long random value (24+ characters).");
  }
  if (!process.env.ADMIN_USERNAME?.trim() || !process.env.ADMIN_PASSWORD?.trim()) {
    issues.push("ADMIN_USERNAME and ADMIN_PASSWORD must be set.");
  } else if (isWeak(process.env.ADMIN_PASSWORD)) {
    issues.push("ADMIN_PASSWORD is too weak for production.");
  }
  if (
    isWeak(process.env.CUSTOMER_SESSION_SECRET) &&
    isWeak(process.env.SESSION_SECRET)
  ) {
    issues.push("CUSTOMER_SESSION_SECRET or SESSION_SECRET must be set for customer login.");
  }

  return issues;
}

export function assertProductionSecretsConfigured(): void {
  const issues = getProductionSecretIssues();
  if (issues.length > 0) {
    throw new Error(issues.join(" "));
  }
}

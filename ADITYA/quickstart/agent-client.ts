export type AgentIntentRequest = {
  intent: string;
  manifestPath?: string;
  dryRun?: boolean;
  tenantId?: string;
  policyProfile?: "strict" | "balanced" | "lenient";
};

export async function runAgentIntent(
  endpoint: string,
  payload: AgentIntentRequest
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Agent request failed: ${response.status}`);
  }
  return response.json();
}

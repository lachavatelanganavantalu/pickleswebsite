import type { AdityaIntentResponse, AgentIntentRequest } from "@/lib/aditya/types";

export async function runAgentIntent(
  endpoint: string,
  payload: AgentIntentRequest,
): Promise<AdityaIntentResponse> {
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

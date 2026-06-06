import type { AdityaIntentResponse } from "@/lib/aditya/types";

export function buildAssistantReply(
  response: AdityaIntentResponse | null,
  addedSummaries: string[],
  notices: string[],
  errorMessage: string,
): string {
  if (errorMessage && addedSummaries.length === 0 && notices.length === 0) {
    return errorMessage;
  }

  if (!response) {
    return errorMessage || "Sorry, something went wrong. Please try again.";
  }

  if (!response.matched) {
    return "I couldn't match that. Try: home, shop, cart, wishlist, track order, sign up, or mutton pickle 1 kg.";
  }

  if (
    response.workflow_id?.startsWith("sensitive_") &&
    response.assistant_reply
  ) {
    if (notices.length > 0) {
      return `${response.assistant_reply} ${notices.join(" ")}`;
    }
    return response.assistant_reply;
  }

  const parts: string[] = [];

  if (addedSummaries.length > 0) {
    parts.push(`Added to your cart: ${addedSummaries.join(", ")}.`);
  }

  if (notices.length > 0) {
    parts.push(notices.join(" "));
  }

  if (response.workflow_id === "place_order" && notices.length > 0) {
    return notices.join(" ");
  }

  if (parts.length > 0) {
    if (response.delivery_draft?.name) {
      parts.push("Delivery details saved — opening checkout for you to review.");
    }
    return parts.join(" ");
  }

  if (response.workflow_id === "unknown_pickle" && response.assistant_reply) {
    return response.assistant_reply;
  }

  if (response.assistant_reply) {
    return response.assistant_reply;
  }

  if (errorMessage) return errorMessage;

  if (response.requires_human) {
    return (
      response.human_handoff_message ??
      response.pause_reason ??
      "Please complete this step manually on the page."
    );
  }

  switch (response.workflow_id) {
    case "search_content":
      return response.search_query
        ? `Showing search results for "${response.search_query}".`
        : "Opening shop search.";
    default:
      return response.workflow_name
        ? `Done — ${response.workflow_name.toLowerCase()}.`
        : "Done.";
  }
}

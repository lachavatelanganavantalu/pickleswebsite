import type { AdityaIntentResponse } from "@/lib/aditya/types";
import {
  SENSITIVE_PAYMENT_HANDOFF_MESSAGE,
  SENSITIVE_SHARED_CREDENTIAL_MESSAGE,
  SENSITIVE_SHARED_PAYMENT_MESSAGE,
} from "@/lib/aditya/sensitive-messages";

export type SharedSecretKind = "credential" | "payment";

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s@./:-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const CHANGE_PASSWORD_NAV =
  /^(please\s+)?((go to|open|show|take me to)\s+)?(change|update|reset)\s+(my\s+)?password\s*$/;

const PASSWORD_WITH_VALUE = [
  /\b(?:password|passwd|pwd)\s*(?:is|:|=|to)\s*\S+/i,
  /\b(?:new|current|old)\s+password\s*(?:is|:|=|to)\s*\S+/i,
  /\b(?:set|change|update|reset)\s+(?:my\s+)?password\s+(?:to|as)\s+\S+/i,
  /\b(?:login|sign in|signin)\s+(?:with\s+)?(?:password\s+)\S{4,}/i,
  /\bpassword\s+[a-z0-9!@#$%^&*._-]{4,}\b/i,
];

const OTP_WITH_VALUE = [
  /\b(?:otp|one time password|verification code)\s*(?:is|:|=)?\s*\d{4,8}\b/i,
  /\botp\s+\d{4,8}\b/i,
];

const PAYMENT_SECRET = [
  /\b(?:cvv|cvc)\s*(?:is|:|=)?\s*\d{3,4}\b/i,
  /\b(?:card|debit|credit)\s*(?:number|no|#)?\s*[:\s]?\d{13,19}\b/i,
  /\b(?:upi|atm)\s*pin\s*(?:is|:|=)?\s*\S+/i,
  /\bpin\s*(?:is|:|=)\s*\d{4,6}\b/i,
];

const PAYMENT_HANDOFF_PHRASES = [
  "pay now",
  "make payment",
  "complete payment",
  "pay for order",
  "pay order",
  "submit payment",
  "do payment",
  "pay my order",
  "pay the order",
  "pay the amount",
  "pay amount",
  "pay via gpay",
  "pay via phonepe",
  "pay via upi",
  "pay through gpay",
  "pay with gpay",
  "pay using gpay",
];

const PAYMENT_HANDOFF_PATTERNS = [
  /\bpay\s+(?:the\s+)?(?:amount|money|order|bill|total|balance|fee)\b/,
  /\bpay\s+(?:via|through|using|with|in)\s+/,
  /\bpayment\s+(?:via|through|using|with|in)\s+/,
  /\b(?:make|do|complete|submit)\s+(?:a\s+)?payment\b/,
  /\b(?:gpay|google pay|phonepe|phone pe|paytm|bhim|upi)\b.*\bpay(?:ment)?\b/,
  /\bpay(?:ment)?\b.*\b(?:gpay|google pay|phonepe|phone pe|paytm|bhim|upi)\b/,
];

export function detectSharedSecret(intent: string): SharedSecretKind | null {
  const raw = intent.trim();
  if (!raw) return null;

  if (CHANGE_PASSWORD_NAV.test(normalize(raw))) return null;

  if (OTP_WITH_VALUE.some((pattern) => pattern.test(raw))) return "credential";
  if (PASSWORD_WITH_VALUE.some((pattern) => pattern.test(raw))) return "credential";
  if (PAYMENT_SECRET.some((pattern) => pattern.test(raw))) return "payment";

  return null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseMatches(text: string, phrase: string): boolean {
  const pattern = new RegExp(`\\b${escapeRegex(normalize(phrase))}\\b`);
  return pattern.test(text);
}

export function isPaymentHandoffIntent(intent: string): boolean {
  const norm = normalize(intent);
  if (detectSharedSecret(intent)) return false;

  if (
    PAYMENT_HANDOFF_PHRASES.some(
      (phrase) => norm === normalize(phrase) || phraseMatches(norm, phrase),
    )
  ) {
    return true;
  }

  return PAYMENT_HANDOFF_PATTERNS.some((pattern) => pattern.test(norm));
}

export function isPaymentHandoffWorkflow(
  workflowId: string | null | undefined,
): boolean {
  return workflowId === "sensitive_payment_handoff";
}

function buildBlockedResponse(
  intent: string,
  bootstrap: AdityaIntentResponse["bootstrap"],
  workflowId: string,
  workflowName: string,
  message: string,
): AdityaIntentResponse {
  return {
    matched: true,
    workflow_id: workflowId,
    workflow_name: workflowName,
    intent,
    assistant_reply: message,
    requires_human: true,
    pause_reason: message,
    human_handoff_message: message,
    actions: [
      {
        action_id: "pause_sensitive_chat",
        kind: "pause",
        label: workflowName,
        requires_human: true,
        human_handoff_message: message,
      },
    ],
    activity: [
      {
        label: "Sensitive information detected",
        status: "blocked",
        detail: "Do not share secrets in chat",
      },
    ],
    bootstrap,
  };
}

export function isSensitiveSharedWorkflow(
  workflowId: string | null | undefined,
): boolean {
  return (
    workflowId === "sensitive_shared_credential" ||
    workflowId === "sensitive_shared_payment"
  );
}

export function matchSensitiveChatIntent(
  intent: string,
  bootstrap: AdityaIntentResponse["bootstrap"],
): AdityaIntentResponse | null {
  const shared = detectSharedSecret(intent);
  if (shared === "credential") {
    return buildBlockedResponse(
      intent,
      bootstrap,
      "sensitive_shared_credential",
      "Sensitive information blocked",
      SENSITIVE_SHARED_CREDENTIAL_MESSAGE,
    );
  }

  if (shared === "payment") {
    return buildBlockedResponse(
      intent,
      bootstrap,
      "sensitive_shared_payment",
      "Payment details blocked",
      SENSITIVE_SHARED_PAYMENT_MESSAGE,
    );
  }

  if (isPaymentHandoffIntent(intent)) {
    const message = SENSITIVE_PAYMENT_HANDOFF_MESSAGE;
    return {
      matched: true,
      workflow_id: "sensitive_payment_handoff",
      workflow_name: "Complete payment securely",
      intent,
      assistant_reply: message,
      requires_human: true,
      pause_reason: message,
      human_handoff_message: message,
      actions: [
        {
          action_id: "pause_payment_handoff",
          kind: "pause",
          label: "Complete payment",
          requires_human: true,
          human_handoff_message: message,
        },
      ],
      activity: [
        {
          label: "Complete payment securely",
          status: "paused",
          detail: "Payments are not completed in chat",
        },
      ],
      bootstrap,
    };
  }

  return null;
}

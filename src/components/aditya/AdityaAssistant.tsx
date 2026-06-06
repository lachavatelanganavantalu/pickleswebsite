"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Minimize2, Maximize2, Trash2, X } from "lucide-react";
import { AdityaBrandFooter } from "@/components/aditya/AgentActivityPanel";
import { runAgentIntent } from "@/lib/aditya/agent-client";
import { applyCartAction } from "@/lib/aditya/apply-cart-action";
import { buildAssistantReply } from "@/lib/aditya/build-assistant-reply";
import type { AdityaResolvedAction } from "@/lib/aditya/types";
import {
  saveCheckoutDraft,
  hasCheckoutDraftFields,
  loadCheckoutDraft,
  draftToCustomer,
  isCheckoutCustomerComplete,
} from "@/lib/checkout-draft";
import { submitCartOrder } from "@/lib/submit-cart-order";
import {
  detectSharedSecret,
  isPaymentHandoffWorkflow,
  isSensitiveSharedWorkflow,
} from "@/lib/aditya/match-sensitive-intent";
import {
  SENSITIVE_DELETE_LABEL,
  SENSITIVE_MESSAGE_HIDDEN,
} from "@/lib/aditya/sensitive-messages";
import { loginUrl } from "@/lib/customer-login-url";
import {
  readPendingOrderSession,
  writePendingOrderSession,
} from "@/lib/pending-order-session";
import { useAditya } from "@/context/AdityaContext";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useOrder } from "@/context/OrderContext";
import type { ComboPack } from "@/data/combos";
import type { PickleProduct } from "@/types/product";

const EXAMPLE_INTENTS = [
  "sign up",
  "wishlist",
  "mutton pickle 1 kg, combo pack",
  "track order",
];

const WELCOME_MESSAGE =
  "Hi! I can take you anywhere on the shop — home, pickles, cart, wishlist, track order, sign up, contact, or add items to cart.";

type PanelState = "closed" | "expanded" | "minimized";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  containsSensitiveData?: boolean;
  sensitiveWarning?: boolean;
  linkedUserMessageId?: string;
};

function createMessage(
  role: ChatMessage["role"],
  text: string,
  extra?: Pick<
    ChatMessage,
    "containsSensitiveData" | "sensitiveWarning" | "linkedUserMessageId"
  >,
): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    ...extra,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function AdityaAssistant() {
  const router = useRouter();
  const { openSearch } = useAditya();
  const { addItem, items, totalINR } = useCart();
  const { user } = useCustomerAuth();
  const { setLastOrder } = useOrder();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [panelState, setPanelState] = useState<PanelState>("closed");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [intent, setIntent] = useState("");
  const [busy, setBusy] = useState(false);

  const panelOpen = panelState !== "closed";
  const panelMinimized = panelState === "minimized";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const deleteSensitiveExchange = useCallback((userMessageId: string) => {
    setMessages((prev) =>
      prev.filter(
        (message) =>
          message.id !== userMessageId &&
          message.linkedUserMessageId !== userMessageId,
      ),
    );
  }, []);

  const executeAction = useCallback(
    async (
      action: AdityaResolvedAction,
      catalog: { products: PickleProduct[]; combos: ComboPack[] },
      addedSummaries: string[],
      notices: string[],
    ) => {
      if (action.wait_after_ms) {
        await sleep(action.wait_after_ms);
      }

      switch (action.kind) {
        case "navigate":
          if (action.path?.startsWith("https://")) {
            window.open(action.path, "_blank", "noopener,noreferrer");
          } else if (action.path) {
            router.push(action.path);
          }
          break;
        case "open_search":
          openSearch(action.query ?? "");
          break;
        case "add_to_cart": {
          const outcome = applyCartAction(
            action,
            catalog.products,
            catalog.combos,
            addItem,
          );
          if (outcome.added) addedSummaries.push(outcome.added);
          if (outcome.notice) notices.push(outcome.notice);
          break;
        }
        case "place_order": {
          if (!user) {
            notices.push("Please log in first — taking you to checkout.");
            router.push(loginUrl("/checkout"));
            break;
          }
          if (items.length === 0) {
            notices.push("Your cart is empty — add pickles first.");
            router.push("/products");
            break;
          }

          const customer = draftToCustomer(loadCheckoutDraft(), user.phone);
          if (!isCheckoutCustomerComplete(customer)) {
            notices.push(
              "I need your delivery details — opening checkout to fill them in.",
            );
            router.push("/checkout");
            break;
          }

          try {
            const orderPayload = await submitCartOrder({
              customer,
              items,
              totalINR,
            });
            setLastOrder(orderPayload);
            writePendingOrderSession(orderPayload);
            notices.push(
              `Order ${orderPayload.displayOrderId} placed. Opening payment.`,
            );
            router.push(`/order/${orderPayload.orderId}/payment`);
          } catch (err) {
            notices.push(
              err instanceof Error ? err.message : "Could not place order.",
            );
          }
          break;
        }
        case "pause":
          break;
        case "noop":
          break;
        default:
          break;
      }
    },
    [addItem, items, openSearch, router, setLastOrder, totalINR, user],
  );

  const runIntent = useCallback(
    async (rawIntent: string) => {
      const trimmed = rawIntent.trim();
      if (!trimmed) return;

      setBusy(true);
      setPanelState("expanded");

      const userMessage = createMessage("user", trimmed, {
        containsSensitiveData: Boolean(detectSharedSecret(trimmed)),
      });
      const userMessageId = userMessage.id;

      setMessages((prev) => [...prev, userMessage]);
      setIntent("");

      let response = null;
      let errorMessage = "";
      const addedSummaries: string[] = [];
      const notices: string[] = [];
      let sensitiveShared = userMessage.containsSensitiveData ?? false;

      try {
        response = await runAgentIntent("/api/agent/intent", { intent: trimmed });
        sensitiveShared =
          sensitiveShared || isSensitiveSharedWorkflow(response.workflow_id);

        if (response.matched && response.actions.some((a) => a.kind === "add_to_cart")) {
          const [productsRes, combosRes] = await Promise.all([
            fetch("/api/products"),
            fetch("/api/combos"),
          ]);

          if (!productsRes.ok || !combosRes.ok) {
            throw new Error("Could not load shop catalog");
          }

          const catalog = {
            products: (await productsRes.json()) as PickleProduct[],
            combos: (await combosRes.json()) as ComboPack[],
          };

          for (const action of response.actions) {
            if (action.kind === "pause") break;
            await executeAction(action, catalog, addedSummaries, notices);
          }

          if (response.delivery_draft && hasCheckoutDraftFields(response.delivery_draft)) {
            saveCheckoutDraft(response.delivery_draft);
            router.push("/checkout");
          }
        } else if (response.matched) {
          if (isPaymentHandoffWorkflow(response.workflow_id)) {
            const pending = readPendingOrderSession();
            if (pending?.orderId) {
              notices.push("Opening the secure payment page for your order.");
              router.push(`/order/${pending.orderId}/payment`);
            } else if (items.length > 0) {
              notices.push("Opening checkout — complete payment on the secure page.");
              router.push(user ? "/checkout" : loginUrl("/checkout"));
            } else {
              notices.push("Place an order first, then pay on the secure payment page.");
              router.push("/products");
            }
          }

          for (const action of response.actions) {
            if (action.kind === "pause") break;
            await executeAction(
              action,
              { products: [], combos: [] },
              addedSummaries,
              notices,
            );
          }
        }
      } catch (err) {
        errorMessage =
          err instanceof Error ? err.message : "Assistant request failed";
      } finally {
        const reply = buildAssistantReply(
          response,
          addedSummaries,
          notices,
          errorMessage,
        );

        setMessages((prev) => {
          const withSensitiveFlag = sensitiveShared
            ? prev.map((message) =>
                message.id === userMessageId
                  ? { ...message, containsSensitiveData: true }
                  : message,
              )
            : prev;

          return [
            ...withSensitiveFlag,
            createMessage("assistant", reply, {
              sensitiveWarning: sensitiveShared,
              linkedUserMessageId: sensitiveShared ? userMessageId : undefined,
            }),
          ];
        });
        setBusy(false);
      }
    },
    [executeAction, items.length, router, user],
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await runIntent(intent);
  };

  const togglePanelSize = () => {
    setPanelState((state) => (state === "minimized" ? "expanded" : "minimized"));
  };

  return (
    <>
      <button
        type="button"
        className="aditya-fab"
        aria-label="Open AI assistant"
        aria-expanded={panelOpen}
        onClick={() => {
          if (panelState === "closed") {
            setPanelState("expanded");
            return;
          }
          if (panelState === "minimized") {
            setPanelState("expanded");
            return;
          }
          setPanelState("closed");
        }}
      >
        <span className="aditya-fab-mark" aria-hidden>
          <MessageCircle className="aditya-fab-icon" />
          <span className="aditya-fab-label">ai</span>
        </span>
      </button>

      {panelOpen ? (
        <div className={`aditya-panel-shell${panelMinimized ? " is-minimized" : ""}`}>
          <div className="aditya-panel">
            <div className="aditya-panel-header">
              <div>
                <p className="aditya-panel-title">assistance interface (ai)</p>
                {!panelMinimized ? (
                  <p className="aditya-panel-subtitle">Chat to shop</p>
                ) : null}
              </div>
              <div className="aditya-panel-actions">
                <button
                  type="button"
                  className="aditya-panel-toggle"
                  aria-label={panelMinimized ? "Maximize assistant" : "Minimize assistant"}
                  onClick={togglePanelSize}
                >
                  {panelMinimized ? (
                    <Maximize2 className="h-5 w-5" />
                  ) : (
                    <Minimize2 className="h-5 w-5" />
                  )}
                </button>
                <button
                  type="button"
                  className="aditya-panel-close"
                  aria-label="Close assistant"
                  onClick={() => setPanelState("closed")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!panelMinimized ? (
              <>
                <div className="aditya-chat-messages" aria-live="polite">
                  {messages.length === 0 ? (
                    <p className="aditya-chat-empty">{WELCOME_MESSAGE}</p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={
                          message.role === "user"
                            ? `aditya-chat-bubble aditya-chat-bubble-user${
                                message.containsSensitiveData
                                  ? " aditya-chat-bubble-sensitive"
                                  : ""
                              }`
                            : `aditya-chat-bubble aditya-chat-bubble-assistant${
                                message.sensitiveWarning
                                  ? " aditya-chat-bubble-sensitive-warning"
                                  : ""
                              }`
                        }
                      >
                        {message.containsSensitiveData ? (
                          <>
                            <p className="aditya-sensitive-hidden">
                              {SENSITIVE_MESSAGE_HIDDEN}
                            </p>
                            <button
                              type="button"
                              className="aditya-sensitive-delete"
                              onClick={() => deleteSensitiveExchange(message.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden />
                              {SENSITIVE_DELETE_LABEL}
                            </button>
                          </>
                        ) : (
                          <p className="aditya-chat-text">{message.text}</p>
                        )}
                      </div>
                    ))
                  )}
                  {busy ? (
                    <div className="aditya-chat-bubble aditya-chat-bubble-assistant aditya-chat-typing">
                      …
                    </div>
                  ) : null}
                  <div ref={messagesEndRef} />
                </div>

                {messages.length === 0 ? (
                  <div className="aditya-examples">
                    {EXAMPLE_INTENTS.map((example) => (
                      <button
                        key={example}
                        type="button"
                        className="aditya-example-chip"
                        disabled={busy}
                        onClick={() => void runIntent(example)}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                ) : null}

                <form className="aditya-panel-form" onSubmit={onSubmit}>
                  <input
                    type="text"
                    value={intent}
                    onChange={(event) => setIntent(event.target.value)}
                    placeholder="Type a message…"
                    aria-label="Assistant message"
                    className="aditya-panel-input"
                    disabled={busy}
                  />
                  <button
                    type="submit"
                    className="aditya-panel-submit"
                    disabled={busy || !intent.trim()}
                  >
                    Send
                  </button>
                </form>

                <AdityaBrandFooter />
              </>
            ) : (
              <button
                type="button"
                className="aditya-panel-restore"
                onClick={() => setPanelState("expanded")}
              >
                Tap to expand assistant
              </button>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

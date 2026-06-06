import { useEffect, useMemo, useState } from "react";

type ActivityItem = {
  label: string;
  status: "planned" | "working" | "paused" | "done" | "blocked";
  detail?: string;
};

type AgentActivityPanelProps = {
  open?: boolean;
  currentStep?: string;
  currentTarget?: string;
  pauseReason?: string;
  successState?: string;
  items?: ActivityItem[];
  brandLabel?: string;
  brandTagline?: string;
};

export function AgentActivityPanel({
  open = true,
  currentStep = "Waiting for intent",
  currentTarget = "None",
  pauseReason = "",
  successState = "",
  items = [],
  brandLabel = "powered by ADITYA",
  brandTagline = "Agentic Deterministic Interface for Tasks, Yield and Access",
}: AgentActivityPanelProps) {
  const visibleItems = useMemo(() => items.slice(0, 6), [items]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return (
    <aside
      aria-label="Agent activity"
      style={{
        position: "fixed",
        left: 20,
        bottom: 20,
        width: "min(420px, calc(100vw - 40px))",
        border: "1px solid #d8e0ec",
        borderRadius: 16,
        background: "#fff",
        boxShadow: "0 20px 50px rgba(24, 32, 51, 0.12)",
        padding: 14,
        zIndex: 45,
      }}
    >
      <div
        style={{
          border: "1px solid #e3e9f2",
          borderRadius: 14,
          padding: "14px 16px 12px",
          marginBottom: 12,
          background: "#fff",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 16,
            lineHeight: 1.15,
            color: "#3d4350",
            fontStyle: "italic",
            fontWeight: 500,
            letterSpacing: 0,
          }}
        >
          {brandLabel}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            lineHeight: 1.35,
            color: "#a0a9b8",
            fontWeight: 600,
          }}
        >
          {brandTagline}
        </div>
      </div>

      <div style={{ display: "grid", gap: 4, marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1f57d6" }}>
          Live progress
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#182033" }}>{currentStep}</div>
      </div>

      <div style={{ display: "grid", gap: 6, marginBottom: 10, fontSize: 13, color: "#51607a" }}>
        <div><strong>Target:</strong> {currentTarget}</div>
        {pauseReason ? <div><strong>Pause:</strong> {pauseReason}</div> : null}
        {successState ? <div><strong>Status:</strong> {successState}</div> : null}
      </div>

      {visibleItems.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
          {visibleItems.map((item, index) => (
            <li
              key={`${item.label}-${index}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "center",
                borderRadius: 12,
                padding: "10px 12px",
                background: item.status === "working" ? "#e7efff" : "#f7f9fc",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#182033" }}>{item.label}</div>
                {item.detail ? <div style={{ fontSize: 12, color: "#65728a" }}>{item.detail}</div> : null}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#1f57d6" }}>
                {item.status}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

    </aside>
  );
}

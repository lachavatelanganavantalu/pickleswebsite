"use client";

import { useEffect } from "react";
import { createAssistanceInterface } from "@reptile/ai";

export function AiWidget() {
  useEffect(() => {
    void createAssistanceInterface({
      mount: "#ai",
      workflowBundle: "/api/ai-workflows",
      title: "ai",
    });
  }, []);

  return <div id="ai" />;
}

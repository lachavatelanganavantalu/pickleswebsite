import { useEffect } from "react";
import { createAssistanceInterface } from "@reptile/ai";

export function AiWidget() {
  useEffect(() => {
    void createAssistanceInterface({
      mount: "#ai",
      workflowBundle: "/ai-workflows.json",
      title: "ai"
    });
  }, []);

  return <div id="ai" />;
}

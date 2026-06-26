import { NextResponse } from "next/server";
import baseAiWorkflows from "../../../../public/ai-workflows.json";
import { getAssistantManifestForRuntime } from "@/lib/assistant-manifest-db";

export async function GET() {
  try {
    const snapshot = await getAssistantManifestForRuntime();
    const baseWorkflows = Array.isArray(baseAiWorkflows.workflows) ? baseAiWorkflows.workflows : [];
    const productWorkflowIds = new Set(snapshot.aiProductWorkflows.map((workflow) => workflow.id));
    const mergedWorkflows = [
      ...baseWorkflows.filter((workflow) => !productWorkflowIds.has(workflow.id)),
      ...snapshot.aiProductWorkflows,
    ];

    return NextResponse.json(
      {
        generatedAt: snapshot.generatedAt,
        version: snapshot.version,
        workflows: mergedWorkflows,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    console.error("GET /api/ai-workflows:", err);
    return NextResponse.json({ error: "Failed to load AI workflows" }, { status: 500 });
  }
}

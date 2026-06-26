import { NextRequest, NextResponse } from "next/server";
import { resolveAgentIntent } from "@/lib/aditya/match-intent";
import type { AgentIntentRequest } from "@/lib/aditya/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AgentIntentRequest;
    const intent = body.intent?.trim();

    if (!intent) {
      return NextResponse.json({ error: "intent is required" }, { status: 400 });
    }

    const result = await resolveAgentIntent(intent);
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/agent/intent:", err);
    return NextResponse.json({ error: "Failed to resolve intent" }, { status: 500 });
  }
}

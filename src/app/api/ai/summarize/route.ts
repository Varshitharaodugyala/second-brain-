import { NextRequest, NextResponse } from "next/server";
import { summarizeContent } from "@/lib/ai";
import { enforceRateLimit } from "@/lib/rate-limit";

// POST /api/ai/summarize - Generate a summary for content
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = enforceRateLimit(
      request,
      "ai:summarize",
      20,
      60_000
    );
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (content.length > 20_000) {
      return NextResponse.json(
        { error: "Content is too long" },
        { status: 400 }
      );
    }

    const result = await summarizeContent(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}

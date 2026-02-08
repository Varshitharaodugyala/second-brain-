import { NextRequest, NextResponse } from "next/server";
import { autoTagContent } from "@/lib/ai";
import { enforceRateLimit } from "@/lib/rate-limit";

// POST /api/ai/auto-tag - Generate tags for content
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = enforceRateLimit(request, "ai:auto-tag", 20, 60_000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
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

    const result = await autoTagContent(content, title);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating tags:", error);
    return NextResponse.json(
      { error: "Failed to generate tags" },
      { status: 500 }
    );
  }
}

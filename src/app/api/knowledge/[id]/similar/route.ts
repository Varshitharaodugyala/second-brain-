import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateKnowledgeEmbedding } from "@/lib/ai";
import { parseBoundedInt } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/knowledge/[id]/similar - Find similar items using vector search
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = enforceRateLimit(
      request,
      "knowledge:similar",
      40,
      60_000
    );
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const limit = parseBoundedInt(
      request.nextUrl.searchParams.get("limit"),
      5,
      1,
      20
    );

    // Get the item
    const item = await prisma.knowledgeItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Knowledge item not found" },
        { status: 404 }
      );
    }

    // Generate embedding for the item's content
    let embedding: number[];
    try {
      const result = await generateKnowledgeEmbedding(item.title, item.content);
      embedding = result.embedding;
    } catch (error) {
      console.error("Failed to generate embedding:", error);
      return NextResponse.json(
        { error: "Failed to generate embedding for similarity search" },
        { status: 500 }
      );
    }

    // Find similar items using cosine similarity
    const similarItems = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        content: string;
        type: string;
        tags: string[];
        source_url: string | null;
        summary: string | null;
        created_at: Date;
        updated_at: Date;
        similarity: number;
      }>
    >`
      SELECT
        id, title, content, type, tags, source_url, summary, created_at, updated_at,
        1 - (embedding <=> ${embedding}::vector) as similarity
      FROM knowledge_items
      WHERE id != ${id}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${embedding}::vector
      LIMIT ${limit}
    `;

    // Map to response format
    const results = similarItems.map((row) => ({
      item: {
        id: row.id,
        title: row.title,
        content: row.content,
        type: row.type as "note" | "link" | "insight",
        tags: row.tags,
        sourceUrl: row.source_url,
        summary: row.summary,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      similarity: row.similarity,
    }));

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error("Error finding similar items:", error);
    return NextResponse.json(
      { error: "Failed to find similar items" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { queryKnowledgeBase, generateEmbedding } from "@/lib/ai";
import { enforceRateLimit } from "@/lib/rate-limit";

// GET /api/public/brain/query - Public API to query the knowledge base
export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = enforceRateLimit(
      request,
      "public:brain-query",
      10,
      60_000
    );
    if (rateLimitResponse) return rateLimitResponse;

    const question = request.nextUrl.searchParams.get("q")?.trim() || "";

    if (!question) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    if (question.length > 500) {
      return NextResponse.json(
        { error: "Question is too long" },
        { status: 400 }
      );
    }

    // Generate embedding for the question
    let questionEmbedding: number[] | null = null;
    try {
      const result = await generateEmbedding(question);
      questionEmbedding = result.embedding;
    } catch (error) {
      console.error("Failed to generate question embedding:", error);
    }

    // Find relevant items using vector search
    let relevantItems: Array<{
      id: string;
      title: string;
      content: string;
      summary: string | null;
    }> = [];

    if (questionEmbedding) {
      const vectorResults = await prisma.$queryRaw<
        Array<{
          id: string;
          title: string;
          content: string;
          summary: string | null;
        }>
      >`
        SELECT id, title, content, summary
        FROM knowledge_items
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> ${questionEmbedding}::vector
        LIMIT 5
      `;
      relevantItems = vectorResults;
    } else {
      // Fallback to keyword search
      const keywordResults = await prisma.knowledgeItem.findMany({
        where: {
          OR: [
            { title: { contains: question, mode: "insensitive" } },
            { content: { contains: question, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          content: true,
          summary: true,
        },
      });
      relevantItems = keywordResults;
    }

    if (relevantItems.length === 0) {
      return NextResponse.json({
        answer: "No relevant information found.",
        sources: [],
      });
    }

    // Query AI
    const result = await queryKnowledgeBase(question, relevantItems);

    // Get source items (limited info for public API)
    const sourceItems = await prisma.knowledgeItem.findMany({
      where: {
        id: { in: relevantItems.map((i) => i.id) },
      },
      select: {
        id: true,
        title: true,
        type: true,
        summary: true,
      },
    });

    return NextResponse.json({
      answer: result.answer,
      sources: sourceItems,
    });
  } catch (error) {
    console.error("Error processing public query:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}

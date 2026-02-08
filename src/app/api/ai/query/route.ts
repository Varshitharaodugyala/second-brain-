import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { queryKnowledgeBase, generateEmbedding } from "@/lib/ai";
import { enforceRateLimit } from "@/lib/rate-limit";

// POST /api/ai/query - Query the knowledge base with a natural language question
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = enforceRateLimit(request, "ai:query", 20, 60_000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
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

    // Find relevant items using vector search if embedding is available
    let relevantItems: Array<{
      id: string;
      title: string;
      content: string;
      summary: string | null;
    }> = [];

    if (questionEmbedding) {
      // Use vector similarity search
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

    // If no relevant items found, return a message
    if (relevantItems.length === 0) {
      return NextResponse.json({
        answer:
          "I couldn't find any relevant information in your knowledge base. Try adding more content or rephrasing your question.",
        sources: [],
        confidence: 0,
      });
    }

    // Query the AI with the relevant context
    const result = await queryKnowledgeBase(question, relevantItems);

    // Get full item details for sources
    const sourceItems = await prisma.knowledgeItem.findMany({
      where: {
        id: { in: relevantItems.map((i) => i.id) },
      },
    });

    return NextResponse.json({
      answer: result.answer,
      sources: sourceItems,
      confidence: result.confidence,
    });
  } catch (error) {
    console.error("Error processing query:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}

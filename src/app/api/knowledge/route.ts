import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { summarizeContent, generateKnowledgeEmbedding } from "@/lib/ai";
import { CreateKnowledgeInput } from "@/types";
import { Prisma } from "@prisma/client";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  isKnowledgeType,
  isSafeHttpUrl,
  isSortField,
  isSortOrder,
  parseBoundedInt,
  sanitizeTags,
  type KnowledgeSortField,
} from "@/lib/validation";

// GET /api/knowledge - List all knowledge items with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const rawType = searchParams.get("type");
    const tags = searchParams
      .get("tags")
      ?.split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
    const rawSortBy = searchParams.get("sortBy");
    const rawSortOrder = searchParams.get("sortOrder");
    const page = parseBoundedInt(searchParams.get("page"), 1, 1, 100000);
    const limit = parseBoundedInt(searchParams.get("limit"), 50, 1, 100);

    if (rawType && !isKnowledgeType(rawType)) {
      return NextResponse.json(
        { error: "Invalid type filter" },
        { status: 400 }
      );
    }

    if (rawSortBy && !isSortField(rawSortBy)) {
      return NextResponse.json(
        { error: "Invalid sortBy field" },
        { status: 400 }
      );
    }

    if (rawSortOrder && !isSortOrder(rawSortOrder)) {
      return NextResponse.json(
        { error: "Invalid sortOrder value" },
        { status: 400 }
      );
    }

    const sortBy: KnowledgeSortField = (rawSortBy || "createdAt") as KnowledgeSortField;
    const sortOrder: "asc" | "desc" = (rawSortOrder || "desc") as "asc" | "desc";

    const where: Prisma.KnowledgeItemWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
      ];
    }

    // Type filter
    if (rawType) {
      where.type = rawType;
    }

    // Tags filter
    if (tags && tags.length > 0) {
      where.tags = { hasEvery: tags };
    }

    const skip = (page - 1) * limit;

    const [count, items] = await prisma.$transaction([
      prisma.knowledgeItem.count({ where }),
      prisma.knowledgeItem.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: items,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error fetching knowledge items:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge items" },
      { status: 500 }
    );
  }
}

// POST /api/knowledge - Create a new knowledge item
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = enforceRateLimit(
      request,
      "knowledge:create",
      20,
      60_000
    );
    if (rateLimitResponse) return rateLimitResponse;

    const parsedBody = await request.json();
    const body: Partial<CreateKnowledgeInput> =
      parsedBody && typeof parsedBody === "object"
        ? (parsedBody as Partial<CreateKnowledgeInput>)
        : {};

    const title = body.title?.trim() || "";
    const content = body.content?.trim() || "";
    const type = body.type || "note";
    const sourceUrl = body.sourceUrl?.trim() || "";
    const tags = sanitizeTags(body.tags);

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (!isKnowledgeType(type)) {
      return NextResponse.json(
        { error: "Invalid knowledge type" },
        { status: 400 }
      );
    }

    if (sourceUrl && !isSafeHttpUrl(sourceUrl)) {
      return NextResponse.json(
        { error: "Source URL must be a valid http(s) URL" },
        { status: 400 }
      );
    }

    // Generate AI summary
    let summary: string | undefined;
    try {
      const result = await summarizeContent(content);
      summary = result.summary;
    } catch (error) {
      console.error("Failed to generate summary:", error);
      // Continue without summary if AI fails
    }

    // Generate embedding for vector search
    let embedding: number[] | undefined;
    try {
      const result = await generateKnowledgeEmbedding(title, content);
      embedding = result.embedding;
    } catch (error) {
      console.error("Failed to generate embedding:", error);
      // Continue without embedding if AI fails
    }

    // Create the knowledge item
    const item = await prisma.knowledgeItem.create({
      data: {
        title,
        content,
        type,
        tags,
        sourceUrl: sourceUrl || null,
        summary,
      },
    });

    // Update embedding separately using raw query (Prisma limitation with vector type)
    if (embedding) {
      await prisma.$executeRaw`
        UPDATE knowledge_items
        SET embedding = ${embedding}::vector
        WHERE id = ${item.id}
      `;
    }

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    console.error("Error creating knowledge item:", error);
    return NextResponse.json(
      { error: "Failed to create knowledge item" },
      { status: 500 }
    );
  }
}

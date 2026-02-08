import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { summarizeContent, generateKnowledgeEmbedding } from "@/lib/ai";
import { UpdateKnowledgeInput } from "@/types";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  isKnowledgeType,
  isSafeHttpUrl,
  sanitizeTags,
} from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/knowledge/[id] - Get a single knowledge item
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const item = await prisma.knowledgeItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Knowledge item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("Error fetching knowledge item:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge item" },
      { status: 500 }
    );
  }
}

// PATCH /api/knowledge/[id] - Update a knowledge item
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = enforceRateLimit(
      request,
      "knowledge:update",
      30,
      60_000
    );
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;
    const body: Partial<UpdateKnowledgeInput> = await request.json();

    // Check if item exists
    const existing = await prisma.knowledgeItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Knowledge item not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      updateData.title = title;
    }

    if (body.content !== undefined) {
      const content = body.content.trim();
      if (!content) {
        return NextResponse.json(
          { error: "Content cannot be empty" },
          { status: 400 }
        );
      }
      updateData.content = content;
    }

    if (body.type !== undefined) {
      if (!isKnowledgeType(body.type)) {
        return NextResponse.json(
          { error: "Invalid knowledge type" },
          { status: 400 }
        );
      }
      updateData.type = body.type;
    }

    if (body.tags !== undefined) {
      updateData.tags = sanitizeTags(body.tags);
    }

    if (body.sourceUrl !== undefined) {
      const sourceUrl = body.sourceUrl?.trim() || "";
      if (sourceUrl && !isSafeHttpUrl(sourceUrl)) {
        return NextResponse.json(
          { error: "Source URL must be a valid http(s) URL" },
          { status: 400 }
        );
      }
      updateData.sourceUrl = sourceUrl || null;
    }

    if (body.summary !== undefined) {
      updateData.summary = body.summary.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const nextTitle = (updateData.title as string | undefined) ?? existing.title;
    const nextContent =
      (updateData.content as string | undefined) ?? existing.content;
    const contentChanged = nextContent !== existing.content;
    const embeddingInputChanged =
      nextTitle !== existing.title || nextContent !== existing.content;

    if (contentChanged) {
      try {
        const result = await summarizeContent(nextContent);
        updateData.summary = result.summary;
      } catch (error) {
        console.error("Failed to regenerate summary:", error);
      }
    }

    if (embeddingInputChanged) {
      try {
        const embeddingResult = await generateKnowledgeEmbedding(
          nextTitle,
          nextContent
        );

        // Update embedding using raw query
        await prisma.$executeRaw`
          UPDATE knowledge_items
          SET embedding = ${embeddingResult.embedding}::vector
          WHERE id = ${id}
        `;
      } catch (error) {
        console.error("Failed to regenerate embedding:", error);
      }
    }

    const item = await prisma.knowledgeItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error("Error updating knowledge item:", error);
    return NextResponse.json(
      { error: "Failed to update knowledge item" },
      { status: 500 }
    );
  }
}

// DELETE /api/knowledge/[id] - Delete a knowledge item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const rateLimitResponse = enforceRateLimit(
      request,
      "knowledge:delete",
      30,
      60_000
    );
    if (rateLimitResponse) return rateLimitResponse;

    const { id } = await params;

    // Check if item exists
    const existing = await prisma.knowledgeItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Knowledge item not found" },
        { status: 404 }
      );
    }

    await prisma.knowledgeItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Knowledge item deleted successfully" });
  } catch (error) {
    console.error("Error deleting knowledge item:", error);
    return NextResponse.json(
      { error: "Failed to delete knowledge item" },
      { status: 500 }
    );
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Text generation model - using gemini-2.5-flash (current stable model)
const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface SummarizeResult {
  summary: string;
}

export interface AutoTagResult {
  tags: string[];
}

export interface QueryResult {
  answer: string;
  confidence: number;
}

export interface EmbeddingResult {
  embedding: number[];
}

// Cache for the embedding pipeline
let embeddingPipeline: any = null;

/**
 * Get or initialize the MiniLM embedding pipeline
 */
async function getEmbeddingPipeline() {
  if (embeddingPipeline) return embeddingPipeline;

  // Dynamic import for transformers.js
  const { pipeline } = await import("@xenova/transformers");
  embeddingPipeline = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  return embeddingPipeline;
}

/**
 * Generate a concise summary of the given content
 */
export async function summarizeContent(content: string): Promise<SummarizeResult> {
  const prompt = `You are a helpful assistant that creates concise summaries.
Summarize the following content in 2-3 sentences, capturing the key points:

${content}

Respond with only the summary, no additional text.`;

  const result = await textModel.generateContent(prompt);
  const response = await result.response;
  const summary = response.text().trim();

  return { summary };
}

/**
 * Automatically generate relevant tags for the content
 */
export async function autoTagContent(
  content: string,
  title: string
): Promise<AutoTagResult> {
  const prompt = `You are a helpful assistant that generates relevant tags for knowledge management.
Based on the title and content below, suggest 3-5 relevant tags that would help categorize and find this content later.

Title: ${title}
Content: ${content}

Respond with only the tags as a comma-separated list (e.g., "javascript, web development, tutorial").
Use lowercase, keep tags concise (1-3 words each).`;

  const result = await textModel.generateContent(prompt);
  const response = await result.response;
  const tagsText = response.text().trim();

  const tags = tagsText
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);

  return { tags };
}

/**
 * Query the knowledge base with a natural language question
 */
export async function queryKnowledgeBase(
  question: string,
  relevantContent: Array<{ title: string; content: string; summary?: string | null }>
): Promise<QueryResult> {
  const contextParts = relevantContent
    .map(
      (item, index) =>
        `[Source ${index + 1}] ${item.title}\n${item.summary || item.content}`
    )
    .join("\n\n---\n\n");

  const prompt = `You are a helpful assistant that answers questions based on a user's personal knowledge base.
Use the following knowledge base entries to answer the question. If you cannot find relevant information, say so clearly.

Knowledge Base:
${contextParts}

Question: ${question}

Provide a clear, concise answer based on the knowledge base. If the answer comes from specific sources, mention which ones.`;

  const result = await textModel.generateContent(prompt);
  const response = await result.response;
  const answer = response.text().trim();

  // Simple confidence heuristic based on response characteristics
  const confidence = answer.toLowerCase().includes("not find") ||
    answer.toLowerCase().includes("no information") ||
    answer.toLowerCase().includes("cannot answer")
    ? 0.3
    : 0.85;

  return { answer, confidence };
}

/**
 * Generate an embedding vector for the given text using MiniLM
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    const pipe = await getEmbeddingPipeline();
    const output = await pipe(text, { pooling: "mean", normalize: true });
    // Convert to regular array and ensure it's 384 dimensions (MiniLM output)
    const embedding = Array.from(output.data as Float32Array);
    return { embedding };
  } catch (error) {
    console.error("Error generating embedding with MiniLM:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Generate embedding for a knowledge item (combines title and content)
 */
export async function generateKnowledgeEmbedding(
  title: string,
  content: string
): Promise<EmbeddingResult> {
  const combinedText = `${title}\n\n${content}`;
  return generateEmbedding(combinedText);
}

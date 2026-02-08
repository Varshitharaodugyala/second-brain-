export const KNOWLEDGE_ITEM_TYPES = ["note", "link", "insight"] as const;
export type KnowledgeItemType = (typeof KNOWLEDGE_ITEM_TYPES)[number];

export const KNOWLEDGE_SORT_FIELDS = ["createdAt", "updatedAt", "title"] as const;
export type KnowledgeSortField = (typeof KNOWLEDGE_SORT_FIELDS)[number];

export function isKnowledgeType(value: string): value is KnowledgeItemType {
  return KNOWLEDGE_ITEM_TYPES.includes(value as KnowledgeItemType);
}

export function isSortField(value: string): value is KnowledgeSortField {
  return KNOWLEDGE_SORT_FIELDS.includes(value as KnowledgeSortField);
}

export function isSortOrder(value: string): value is "asc" | "desc" {
  return value === "asc" || value === "desc";
}

export function parseBoundedInt(
  value: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];

  const normalized = tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(normalized)).slice(0, 20);
}

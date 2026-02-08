export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: "note" | "link" | "insight";
  tags: string[];
  sourceUrl?: string | null;
  summary?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateKnowledgeInput {
  title: string;
  content: string;
  type: "note" | "link" | "insight";
  tags?: string[];
  sourceUrl?: string;
}

export interface UpdateKnowledgeInput {
  title?: string;
  content?: string;
  type?: "note" | "link" | "insight";
  tags?: string[];
  sourceUrl?: string;
  summary?: string;
}

export interface KnowledgeFilters {
  search?: string;
  type?: "note" | "link" | "insight";
  tags?: string[];
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface QueryResponse {
  answer: string;
  sources: KnowledgeItem[];
  confidence: number;
}

export interface SimilaritySearchResult {
  item: KnowledgeItem;
  similarity: number;
}

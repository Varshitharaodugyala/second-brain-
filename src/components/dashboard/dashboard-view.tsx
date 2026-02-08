"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  Grid,
  List,
  FileText,
  Link as LinkIcon,
  Lightbulb,
  X,
  MessageSquare,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KnowledgeCard } from "@/components/knowledge/knowledge-card";
import { KnowledgeForm } from "@/components/knowledge/knowledge-form";
import { CardSkeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { KnowledgeItem, KnowledgeFilters } from "@/types";
import { debounce, cn } from "@/lib/utils";

interface DashboardViewProps {
  initialItems?: KnowledgeItem[];
}

export function DashboardView({ initialItems = [] }: DashboardViewProps) {
  const [items, setItems] = useState<KnowledgeItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"note" | "link" | "insight">("note");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<KnowledgeFilters>({
    search: "",
    type: undefined,
    tags: [],
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // AI Query state
  const [showQueryInput, setShowQueryInput] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    answer: string;
    sources: KnowledgeItem[];
  } | null>(null);

  // Fetch items
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.type) params.set("type", filters.type);
      if (filters.tags?.length) params.set("tags", filters.tags.join(","));
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/knowledge?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch items");

      const data = await response.json();
      setItems(data.data || []);
    } catch (error) {
      toast("Failed to load knowledge items", "error");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setFilters((prev) => ({ ...prev, search: value }));
      }, 300),
    []
  );

  // Handle AI query
  const handleQuery = async () => {
    if (!queryText.trim()) return;

    setIsQuerying(true);
    setQueryResult(null);
    try {
      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: queryText }),
      });

      if (!response.ok) throw new Error("Failed to query");

      const data = await response.json();
      setQueryResult(data);
    } catch (error) {
      toast("Failed to process query", "error");
    } finally {
      setIsQuerying(false);
    }
  };

  // Handle find similar
  const handleFindSimilar = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge/${id}/similar`);
      if (!response.ok) throw new Error("Failed to find similar items");

      const data = await response.json();
      if (data.data?.length > 0) {
        toast(`Found ${data.data.length} similar items`, "success");
        setItems(data.data.map((r: { item: KnowledgeItem }) => r.item));
      } else {
        toast("No similar items found", "info");
      }
    } catch (error) {
      toast("Failed to find similar items", "error");
    }
  };

  // Open form with specific type
  const openForm = (type: "note" | "link" | "insight") => {
    setFormType(type);
    setIsFormOpen(true);
  };

  // Get all unique tags from items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Knowledge Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {items.length} items in your second brain
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Create Buttons */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openForm("note")}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Note
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openForm("link")}
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openForm("insight")}
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Insight
                </Button>
              </div>

              {/* Mobile Create Button */}
              <Button
                className="sm:hidden"
                onClick={() => openForm("note")}
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                data-search-input
                placeholder="Search your knowledge..."
                className="pl-10"
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-accent")}
            >
              <Filter className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowQueryInput(!showQueryInput)}
              className={cn(showQueryInput && "bg-accent")}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>

            <div className="hidden sm:flex items-center border border-border rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "grid"
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "list"
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  {/* Type Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    {["note", "link", "insight"].map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            type:
                              prev.type === type
                                ? undefined
                                : (type as "note" | "link" | "insight"),
                          }))
                        }
                        className={cn(
                          "px-3 py-1 text-sm rounded-full border transition-colors capitalize",
                          filters.type === type
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-accent"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Tags Filter */}
                  {allTags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">Tags:</span>
                      {allTags.slice(0, 8).map((tag) => (
                        <button
                          key={tag}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              tags: prev.tags?.includes(tag)
                                ? prev.tags.filter((t) => t !== tag)
                                : [...(prev.tags || []), tag],
                            }))
                          }
                          className={cn(
                            "px-2 py-0.5 text-xs rounded-full border transition-colors",
                            filters.tags?.includes(tag)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:bg-accent"
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Clear Filters */}
                  {(filters.type || filters.tags?.length) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          type: undefined,
                          tags: [],
                        }))
                      }
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Query Panel */}
          <AnimatePresence>
            {showQueryInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-500" />
                      <Input
                        placeholder="Ask a question about your knowledge..."
                        className="pl-10"
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                      />
                    </div>
                    <Button onClick={handleQuery} disabled={isQuerying}>
                      {isQuerying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Ask AI"
                      )}
                    </Button>
                  </div>

                  {/* Query Result */}
                  {queryResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg"
                    >
                      <p className="text-sm mb-3">{queryResult.answer}</p>
                      {queryResult.sources.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Sources:</span>
                          {queryResult.sources.map((source) => (
                            <Badge key={source.id} variant="secondary">
                              {source.title}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No knowledge items yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your second brain by adding your first item.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button onClick={() => openForm("note")}>
                <FileText className="h-4 w-4 mr-2" />
                Add Note
              </Button>
              <Button variant="outline" onClick={() => openForm("link")}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Add Link
              </Button>
              <Button variant="outline" onClick={() => openForm("insight")}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Add Insight
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            layout
            className={cn(
              viewMode === "grid"
                ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}
          >
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <KnowledgeCard
                    item={item}
                    onDelete={(id) =>
                      setItems((prev) => prev.filter((i) => i.id !== id))
                    }
                    onFindSimilar={handleFindSimilar}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Knowledge Form Modal */}
      <KnowledgeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchItems}
        defaultType={formType}
      />
    </div>
  );
}

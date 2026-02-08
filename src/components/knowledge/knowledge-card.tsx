"use client";

import { motion } from "framer-motion";
import { FileText, Link as LinkIcon, Lightbulb, MoreVertical, Trash2, ExternalLink, Copy, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KnowledgeItem } from "@/types";
import { formatRelativeTime, isValidUrl, truncate } from "@/lib/utils";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

interface KnowledgeCardProps {
  item: KnowledgeItem;
  onDelete?: (id: string) => void;
  onFindSimilar?: (id: string) => void;
}

export function KnowledgeCard({ item, onDelete, onFindSimilar }: KnowledgeCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const typeIcons = {
    note: FileText,
    link: LinkIcon,
    insight: Lightbulb,
  };

  const typeColors = {
    note: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    link: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    insight: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };

  const Icon = typeIcons[item.type] || FileText;
  const hasSafeSourceUrl = !!item.sourceUrl && isValidUrl(item.sourceUrl);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/knowledge/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast("Item deleted successfully", "success");
      onDelete?.(item.id);
    } catch (error) {
      toast("Failed to delete item", "error");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    toast("Content copied to clipboard", "success");
    setShowMenu(false);
  };

  return (
    <Card className="relative group">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="line-clamp-2">{item.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Icon className="h-3.5 w-3.5" />
              <span>{formatRelativeTime(item.createdAt)}</span>
            </CardDescription>
          </div>

          {/* Type Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[item.type]}`}
          >
            <Icon className="h-3 w-3" />
            {item.type}
          </span>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-accent rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-20 py-1"
                >
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Content
                  </button>
                  {hasSafeSourceUrl && (
                    <a
                      href={item.sourceUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Source
                    </a>
                  )}
                  <button
                    onClick={() => {
                      onFindSimilar?.(item.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    Find Similar
                  </button>
                  <hr className="my-1 border-border" />
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary or Content */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {item.summary || truncate(item.content, 200)}
        </p>
      </CardContent>

      <CardFooter>
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{item.tags.length - 4}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

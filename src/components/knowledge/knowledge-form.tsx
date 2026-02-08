"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { toast } from "@/components/ui/toast";
import { isValidUrl, KNOWLEDGE_TYPES } from "@/lib/utils";
import { CreateKnowledgeInput } from "@/types";

interface KnowledgeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultType?: "note" | "link" | "insight";
}

export function KnowledgeForm({
  isOpen,
  onClose,
  onSuccess,
  defaultType = "note",
}: KnowledgeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoTagging, setIsAutoTagging] = useState(false);
  const [formData, setFormData] = useState<CreateKnowledgeInput>({
    title: "",
    content: "",
    type: defaultType,
    tags: [],
    sourceUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form type when defaultType changes (when modal opens with different type)
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({ ...prev, type: defaultType }));
    }
  }, [isOpen, defaultType]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (formData.sourceUrl && formData.sourceUrl.trim()) {
      if (!isValidUrl(formData.sourceUrl)) {
        newErrors.sourceUrl = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAutoTag = async () => {
    if (!formData.content.trim()) {
      toast("Please add some content first", "warning");
      return;
    }

    setIsAutoTagging(true);
    try {
      const response = await fetch("/api/ai/auto-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate tags");

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        tags: [...new Set([...prev.tags!, ...data.tags])],
      }));
      toast("Tags generated successfully!", "success");
    } catch (error) {
      toast("Failed to generate tags", "error");
    } finally {
      setIsAutoTagging(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create knowledge item");
      }

      toast("Knowledge item created successfully!", "success");
      onSuccess?.();
      onClose();
      setFormData({
        title: "",
        content: "",
        type: defaultType,
        tags: [],
        sourceUrl: "",
      });
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to create item",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Modal - Centered with flex */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Add Knowledge</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <Input
                  label="Title"
                  placeholder="Enter a title for your knowledge"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  error={errors.title}
                />

                <Textarea
                  label="Content"
                  placeholder="Write your thoughts, paste an article, or describe your insight..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, content: e.target.value }))
                  }
                  error={errors.content}
                  rows={6}
                />

                <Select
                  label="Type"
                  options={KNOWLEDGE_TYPES.map((t) => ({
                    value: t.value,
                    label: t.label,
                    description: t.description,
                  }))}
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as "note" | "link" | "insight",
                    }))
                  }
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-foreground">
                      Tags
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAutoTag}
                      disabled={isAutoTagging}
                      className="text-xs"
                    >
                      {isAutoTagging ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-1" />
                      )}
                      Auto-tag with AI
                    </Button>
                  </div>
                  <TagInput
                    value={formData.tags || []}
                    onChange={(tags) =>
                      setFormData((prev) => ({ ...prev, tags }))
                    }
                    placeholder="Add tags..."
                    suggestions={[
                      "javascript",
                      "react",
                      "typescript",
                      "productivity",
                      "learning",
                      "ideas",
                      "projects",
                    ]}
                  />
                </div>

                <Input
                  label="Source URL (optional)"
                  placeholder="https://example.com/article"
                  value={formData.sourceUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sourceUrl: e.target.value }))
                  }
                  error={errors.sourceUrl}
                />

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isLoading}>
                    Save Knowledge
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { motion, AnimatePresence } from "framer-motion";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  label?: string;
  error?: string;
  maxTags?: number;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tags...",
  suggestions = [],
  label,
  error,
  maxTags = 10,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const normalizedTag = tag.trim().toLowerCase();
    if (normalizedTag && !value.includes(normalizedTag) && value.length < maxTags) {
      onChange([...value, normalizedTag]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(s.toLowerCase())
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 min-h-[42px] w-full rounded-lg border border-border bg-background px-3 py-2",
          "focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent",
          "transition-all duration-200",
          error && "border-red-500 focus-within:ring-red-500"
        )}
      >
        <AnimatePresence mode="popLayout">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" removable onRemove={() => removeTag(tag)}>
              {tag}
            </Badge>
          ))}
        </AnimatePresence>

        {value.length < maxTags && (
          <div className="relative flex-1 min-w-[120px]">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={value.length === 0 ? placeholder : "Add more..."}
              className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-[200px] overflow-y-auto"
                >
                  {filteredSuggestions.slice(0, 5).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addTag(suggestion)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
      <p className="mt-1 text-xs text-muted-foreground">
        Press Enter or comma to add a tag. {value.length}/{maxTags} tags used.
      </p>
    </div>
  );
}

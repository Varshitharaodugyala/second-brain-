"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  FileText,
  Link,
  Lightbulb,
  Home,
  LayoutDashboard,
  BookOpen,
  Settings,
  Command as CommandIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  onCreateNew?: (type: "note" | "link" | "insight") => void;
}

export function CommandPalette({ onCreateNew }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground",
          "border border-border rounded-lg",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-colors duration-200"
        )}
      >
        <CommandIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Command</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setOpen(false)}
            />

            {/* Command Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-1/4 -translate-x-1/2 z-50 w-full max-w-lg"
            >
              <Command
                className={cn(
                  "rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
                )}
              >
                <div className="flex items-center border-b border-border px-4">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Command.Input
                    autoFocus
                    placeholder="Type a command or search..."
                    className={cn(
                      "flex h-12 w-full bg-transparent py-3 px-3 text-sm",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none"
                    )}
                  />
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto p-2">
                  <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                    No results found.
                  </Command.Empty>

                  {/* Navigation Group */}
                  <Command.Group heading="Navigation" className="mb-2">
                    <CommandItem
                      onSelect={() => runCommand(() => router.push("/"))}
                    >
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => runCommand(() => router.push("/dashboard"))}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </CommandItem>
                    <CommandItem
                      onSelect={() => runCommand(() => router.push("/docs"))}
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Documentation</span>
                    </CommandItem>
                  </Command.Group>

                  {/* Create Group */}
                  <Command.Group heading="Create" className="mb-2">
                    <CommandItem
                      onSelect={() =>
                        runCommand(() => onCreateNew?.("note"))
                      }
                    >
                      <FileText className="h-4 w-4" />
                      <span>New Note</span>
                    </CommandItem>
                    <CommandItem
                      onSelect={() =>
                        runCommand(() => onCreateNew?.("link"))
                      }
                    >
                      <Link className="h-4 w-4" />
                      <span>New Link</span>
                    </CommandItem>
                    <CommandItem
                      onSelect={() =>
                        runCommand(() => onCreateNew?.("insight"))
                      }
                    >
                      <Lightbulb className="h-4 w-4" />
                      <span>New Insight</span>
                    </CommandItem>
                  </Command.Group>

                  {/* Actions Group */}
                  <Command.Group heading="Actions">
                    <CommandItem
                      onSelect={() =>
                        runCommand(() => {
                          // Focus search on dashboard
                          router.push("/dashboard");
                          setTimeout(() => {
                            const searchInput = document.querySelector<HTMLInputElement>(
                              '[data-search-input]'
                            );
                            searchInput?.focus();
                          }, 100);
                        })
                      }
                    >
                      <Search className="h-4 w-4" />
                      <span>Search Knowledge Base</span>
                    </CommandItem>
                  </Command.Group>
                </Command.List>

                <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border bg-muted px-1">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border bg-muted px-1">↵</kbd>
                      Select
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-muted px-1">Esc</kbd>
                    Close
                  </span>
                </div>
              </Command>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CommandItem({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
        "text-sm text-foreground",
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
        "transition-colors duration-100"
      )}
    >
      {children}
    </Command.Item>
  );
}

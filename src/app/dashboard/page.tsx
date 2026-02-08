"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Brain } from "lucide-react";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { CommandPalette } from "@/components/ui/command-palette";
import { KnowledgeForm } from "@/components/knowledge/knowledge-form";

export default function DashboardPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"note" | "link" | "insight">("note");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateNew = useCallback((type: "note" | "link" | "insight") => {
    setFormType(type);
    setIsFormOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-violet-500" />
            <span className="text-xl font-bold">Second Brain</span>
          </Link>

          <div className="flex items-center gap-4">
            <CommandPalette onCreateNew={handleCreateNew} />
            <Link
              href="/docs"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
          </div>
        </div>
      </nav>

      {/* Dashboard Content (with top padding for fixed nav) */}
      <div className="pt-16">
        <DashboardView key={refreshKey} />
      </div>

      {/* Knowledge Form Modal (triggered by command palette) */}
      <KnowledgeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        defaultType={formType}
      />
    </div>
  );
}

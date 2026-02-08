"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Brain,
  Layers,
  Cpu,
  Globe,
  Lightbulb,
  Code,
  Database,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CommandPalette } from "@/components/ui/command-palette";

export default function DocsPage() {
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
            <CommandPalette />
            <Link
              href="/dashboard"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Architecture{" "}
              <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
                Documentation
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore the design principles, architecture decisions, and
              implementation details of Second Brain.
            </p>
          </motion.div>

          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Contents</h2>
              <nav className="space-y-2">
                {[
                  { href: "#architecture", label: "Portable Architecture" },
                  { href: "#ux-principles", label: "UX Principles for AI" },
                  { href: "#agent-thinking", label: "Agent-Like Thinking" },
                  { href: "#public-api", label: "Public API" },
                  { href: "#tech-stack", label: "Technology Stack" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    <ChevronRight className="h-4 w-4" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </Card>
          </motion.div>

          {/* Section: Portable Architecture */}
          <Section id="architecture" icon={Layers} title="Portable Architecture">
            <p className="text-muted-foreground mb-6">
              Second Brain is built with a clean, portable architecture that
              separates concerns and makes it easy to swap components.
            </p>

            <div className="bg-muted/50 rounded-xl p-6 mb-6 font-mono text-sm">
              <pre className="text-foreground whitespace-pre-wrap">
{`┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │ Landing Page│ │  Dashboard  │ │   Documentation     ││
│  │   (Next.js) │ │  (React)    │ │       Page          ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      API Layer                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │  Knowledge  │ │     AI      │ │    Public API       ││
│  │    CRUD     │ │  Services   │ │   (Query Brain)     ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │   Prisma    │ │   Gemini    │ │   Vector Search     ││
│  │    ORM      │ │     AI      │ │    (pgvector)       ││
│  └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                           │
│           PostgreSQL (Neon) with pgvector               │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ knowledge_items                                   │  │
│  │  - id, title, content, type, tags                │  │
│  │  - summary (AI-generated)                        │  │
│  │  - embedding (vector for semantic search)        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘`}
              </pre>
            </div>

            <h3 className="text-lg font-semibold mb-3">Key Design Decisions</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">AI Abstraction:</strong> The
                AI service layer is abstracted, making it easy to swap Gemini
                for another provider (OpenAI, Claude, etc.)
              </li>
              <li>
                <strong className="text-foreground">Database Independence:</strong>{" "}
                Prisma ORM allows switching between PostgreSQL providers (Neon,
                Supabase, local) without code changes
              </li>
              <li>
                <strong className="text-foreground">Component-Based UI:</strong>{" "}
                Reusable UI components with consistent styling and animations
              </li>
            </ul>
          </Section>

          {/* Section: UX Principles */}
          <Section id="ux-principles" icon={Lightbulb} title="UX Principles for AI">
            <p className="text-muted-foreground mb-6">
              Designing AI-powered features requires special consideration for
              user experience. Here are the principles guiding Second Brain:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {[
                {
                  title: "1. Transparency Over Magic",
                  description:
                    "Users see when AI is working (loading states) and can review AI-generated content before accepting it.",
                },
                {
                  title: "2. Graceful Degradation",
                  description:
                    "If AI fails, the app continues to work. Summarization failure doesn't block item creation.",
                },
                {
                  title: "3. User Control",
                  description:
                    "AI suggestions (tags, summaries) are recommendations, not mandates. Users can edit or ignore them.",
                },
                {
                  title: "4. Progressive Enhancement",
                  description:
                    "AI features enhance the experience but aren't required. Basic CRUD works without AI.",
                },
                {
                  title: "5. Contextual Assistance",
                  description:
                    "AI features appear where they're useful (auto-tag button on form, query on dashboard).",
                },
              ].map((principle) => (
                <Card key={principle.title} className="p-4">
                  <h4 className="font-semibold mb-2">{principle.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {principle.description}
                  </p>
                </Card>
              ))}
            </div>
          </Section>

          {/* Section: Agent Thinking */}
          <Section id="agent-thinking" icon={Cpu} title="Agent-Like Thinking">
            <p className="text-muted-foreground mb-6">
              Second Brain implements AI features that exhibit agent-like
              behavior, going beyond simple request-response patterns.
            </p>

            <div className="space-y-6">
              <div className="border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  Auto-Tagging System
                </h3>
                <p className="text-muted-foreground mb-4">
                  When you save content, the AI analyzes it and suggests relevant
                  tags based on:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Topic detection and categorization</li>
                  <li>Key concept extraction</li>
                  <li>Semantic understanding of content</li>
                </ul>
                <div className="mt-4 bg-muted/50 rounded-lg p-4 font-mono text-sm">
                  <code className="text-violet-500">// Example prompt logic</code>
                  <br />
                  <code>
                    "Analyze this content and suggest 3-5 relevant tags..."
                  </code>
                </div>
              </div>

              <div className="border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-500" />
                  Semantic Search
                </h3>
                <p className="text-muted-foreground mb-4">
                  Vector embeddings enable finding related content by meaning, not
                  just keywords:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Content is converted to 384-dimensional vectors</li>
                  <li>pgvector performs efficient cosine similarity search</li>
                  <li>Results ranked by semantic similarity score</li>
                </ul>
              </div>

              <div className="border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-pink-500" />
                  Conversational Query
                </h3>
                <p className="text-muted-foreground mb-4">
                  Ask questions in natural language and get contextual answers:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Question is embedded using the same model</li>
                  <li>Most relevant knowledge items are retrieved</li>
                  <li>Context is provided to LLM with the question</li>
                  <li>AI synthesizes an answer from your knowledge</li>
                </ol>
              </div>
            </div>
          </Section>

          {/* Section: Public API */}
          <Section id="public-api" icon={Globe} title="Public API">
            <p className="text-muted-foreground mb-6">
              Query your knowledge base programmatically using the public API
              endpoint.
            </p>

            <div className="bg-muted/50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Code className="h-5 w-5" />
                Endpoint
              </h3>
              <code className="text-sm bg-background px-3 py-2 rounded-lg block">
                GET /api/public/brain/query?q=&#123;question&#125;
              </code>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Request</h4>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                  <pre>{`curl "https://your-domain.com/api/public/brain/query?q=What%20is%20React"`}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Response</h4>
                <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                  <pre>
{`{
  "answer": "Based on your knowledge base, React is...",
  "sources": [
    {
      "id": "clx123...",
      "title": "React Fundamentals",
      "type": "note",
      "summary": "Overview of React concepts..."
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>
          </Section>

          {/* Section: Tech Stack */}
          <Section id="tech-stack" icon={Code} title="Technology Stack">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Layer</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Technology
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">Frontend</td>
                      <td className="py-3 px-4">Next.js 15, React 19</td>
                    <td className="py-3 px-4">App Router, Server Components</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">Styling</td>
                    <td className="py-3 px-4">Tailwind CSS</td>
                    <td className="py-3 px-4">Utility-first styling</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">Animations</td>
                    <td className="py-3 px-4">Framer Motion</td>
                    <td className="py-3 px-4">Smooth transitions, parallax</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">Database</td>
                    <td className="py-3 px-4">PostgreSQL (Neon)</td>
                    <td className="py-3 px-4">Serverless PostgreSQL</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">ORM</td>
                    <td className="py-3 px-4">Prisma</td>
                    <td className="py-3 px-4">Type-safe database access</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">Vector Search</td>
                    <td className="py-3 px-4">pgvector</td>
                    <td className="py-3 px-4">Semantic similarity search</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 px-4">AI</td>
                    <td className="py-3 px-4">Google Gemini</td>
                    <td className="py-3 px-4">Summarization, embeddings</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Command Palette</td>
                    <td className="py-3 px-4">cmdk</td>
                    <td className="py-3 px-4">Keyboard-first navigation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Start Using Second Brain
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="mb-16 scroll-mt-24"
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
          <Icon className="h-5 w-5 text-white" />
        </div>
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

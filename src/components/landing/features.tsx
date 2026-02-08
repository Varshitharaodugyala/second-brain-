"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Brain,
  Sparkles,
  Search,
  Tags,
  Zap,
  Shield,
  Command,
  Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI Summarization",
    description:
      "Automatically generate concise summaries of your notes and articles, making it easy to review key points.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Tags,
    title: "Smart Auto-Tagging",
    description:
      "Let AI analyze your content and suggest relevant tags, keeping your knowledge organized effortlessly.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description:
      "Find related content by meaning, not just keywords. Discover connections you never knew existed.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Sparkles,
    title: "Natural Language Queries",
    description:
      "Ask questions about your knowledge base in plain English and get intelligent, contextual answers.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Command,
    title: "Command Palette",
    description:
      "Navigate and create quickly with keyboard shortcuts. Press Cmd+K to access any action instantly.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Globe,
    title: "Public API",
    description:
      "Query your knowledge base programmatically. Build integrations and extend functionality.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

export function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for Your{" "}
            <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
              Digital Mind
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to capture, organize, and leverage your knowledge
            effectively.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full group">
                <CardContent className="p-6">
                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-lg`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="container mx-auto max-w-4xl"
      >
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-600" />

          {/* Animated Shapes */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
            }}
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl"
          />

          {/* Content */}
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Start Building Your Second Brain</span>
            </motion.div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform How You
              <br />
              Manage Knowledge?
            </h2>

            <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
              Join the future of personal knowledge management. Let AI help you
              capture, organize, and rediscover your ideas.
            </p>

            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-white text-violet-600 hover:bg-white/90 group"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

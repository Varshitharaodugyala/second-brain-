"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "outlined";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = true, children, ...props }, ref) => {
    const variants = {
      default: "bg-card border border-border",
      elevated: "bg-card shadow-lg",
      outlined: "bg-transparent border-2 border-border",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl p-6",
          variants[variant],
          hover && "transition-all duration-200 hover:shadow-lg",
          className
        )}
        whileHover={hover ? { y: -2 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4", className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-lg font-semibold text-foreground leading-tight",
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

const CardDescription = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground mt-1", className)} {...props}>
    {children}
  </p>
);

const CardContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("", className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-4 flex items-center gap-2", className)}
    {...props}
  >
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toastsState: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...toastsState]));
}

export function toast(message: string, type: ToastType = "info", duration = 5000) {
  const id = Math.random().toString(36).slice(2);
  const newToast: Toast = { id, message, type, duration };
  toastsState = [...toastsState, newToast];
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      toastsState = toastsState.filter((t) => t.id !== id);
      notifyListeners();
    }, duration);
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  const removeToast = (id: string) => {
    toastsState = toastsState.filter((t) => t.id !== id);
    notifyListeners();
  };

  if (!mounted) return <>{children}</>;

  return (
    <>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          <AnimatePresence>
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </>
  );
}

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const backgrounds = {
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-[400px]",
        backgrounds[t.type]
      )}
    >
      {icons[t.type]}
      <p className="flex-1 text-sm text-foreground">{t.message}</p>
      <button
        onClick={onRemove}
        className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </motion.div>
  );
}

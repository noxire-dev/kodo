"use client";

import type { ToastManagerAddOptions } from "@base-ui/react/toast";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { ThreadToastData } from "./toast";

export type StackedThreadToastOptions = {
  type: "error" | "warning" | "success" | "info" | "loading";
  title: ReactNode;
  description?: ReactNode;
  timeout?: number;
  priority?: "low" | "high";
  actionProps?: ComponentPropsWithoutRef<"button">;
  /** Merged into `data` after `actionLayout: "stacked-end"`. */
  actionVariant?: ThreadToastData["actionVariant"];
  data?: ThreadToastData;
};

/**
 * Thread toast using the stacked body + bottom action row (copy for errors, CTA on its own row).
 */
export function stackedThreadToast(
  options: StackedThreadToastOptions,
): ToastManagerAddOptions<ThreadToastData> {
  const { type, title, description, timeout, priority, actionProps, actionVariant, data } = options;

  const mergedData: ThreadToastData = {
    actionLayout: "stacked-end",
    ...(data !== undefined ? data : {}),
  };
  if (actionVariant !== undefined) {
    mergedData.actionVariant = actionVariant;
  }

  const payload: ToastManagerAddOptions<ThreadToastData> = {
    type,
    title,
    data: mergedData,
  };

  if (description !== undefined) {
    payload.description = description;
  }
  if (timeout !== undefined) {
    payload.timeout = timeout;
  }
  if (priority !== undefined) {
    payload.priority = priority;
  }
  if (actionProps !== undefined) {
    payload.actionProps = actionProps;
  }

  return payload;
}

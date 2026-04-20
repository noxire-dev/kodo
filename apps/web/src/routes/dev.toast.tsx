import { Toast } from "@base-ui/react/toast";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

import {
  anchoredToastManager,
  stackedThreadToast,
  toastManager,
  type ThreadToastData,
} from "~/components/ui/toast";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/dev/toast")({
  component: DevToastPlaygroundRoute,
});

const LONG_COPY =
  "This description is intentionally long so you can confirm wrapping, collapsed-stack peek height, and expanded hover behavior without leaving this page.";

const MEGA_ERROR_BODY = [
  "Typecheck failed across 38 packages after incremental rebuild. The compiler stopped after the first 200 diagnostics; full output is ~18k lines on disk.",
  "",
  "packages/web/src/components/ChatView.tsx(3084,11): error TS2322: Type 'DispatchCommandResult | undefined' is not assignable to type 'DispatchCommandResult'.",
  "packages/web/src/components/GitActionsControl.tsx(639,22): error TS18048: 'progress' is possibly 'undefined'.",
  "packages/contracts/src/orchestration.ts(112,3): error TS4104: The type 'readonly string[]' is 'readonly' and cannot be assigned to the mutable type 'string[]'.",
  "",
  "Caused by: upstream @types/node@22.10.2 conflicting with workspace typescript@5.9.2 — see https://example.invalid/ts-triage for the internal runbook.",
  "",
  LONG_COPY,
  LONG_COPY,
  "Retry with T3_VERBOSE_TSC=1 and attach .t3/tsc-full.log when filing an issue.",
].join("\n");

function DevToastPlaygroundRoute() {
  const anchoredTooltipAnchorRef = useRef<HTMLButtonElement>(null);
  const anchoredPanelAnchorRef = useRef<HTMLButtonElement>(null);
  const anchoredManager = Toast.useToastManager<ThreadToastData>();

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 pb-16">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Toast playground</h1>
        <p className="text-sm text-muted-foreground">
          Dev-only route at <code className="rounded bg-muted px-1 py-0.5 text-xs">/dev/toast</code>
          . Dismiss toasts with the corner control. Anchored toasts can be cleared in bulk below.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Viewport toasts</CardTitle>
          <CardDescription>
            Types, copy length, actions, and layout flags used by{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">toastManager</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Type / icon</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    title: "Neutral",
                    description: "No type set — no leading icon.",
                  })
                }
              >
                Neutral
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    type: "success",
                    title: "Success",
                    description: "Operation completed.",
                  })
                }
              >
                Success
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    type: "info",
                    title: "Info",
                    description: "Something you should know.",
                  })
                }
              >
                Info
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    type: "warning",
                    title: "Warning",
                    description: "Proceed with care.",
                  })
                }
              >
                Warning
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    type: "warning",
                    title: "Slow RPCs (demo)",
                    description: "2 requests waiting longer than 15s.",
                    data: {
                      expandableDescriptionTrigger: true,
                      expandableContent: (
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="min-w-0">
                            <div className="font-medium text-foreground">
                              orchestration.dispatch
                            </div>
                            <div className="font-mono text-[10px] opacity-90">req-demo-1</div>
                          </li>
                          <li className="min-w-0">
                            <div className="font-medium text-foreground">
                              nativeApi.workspace.list
                            </div>
                            <div className="font-mono text-[10px] opacity-90">req-demo-2</div>
                          </li>
                        </ul>
                      ),
                      expandableLabels: { collapse: "Hide requests", expand: "Show requests" },
                    },
                  })
                }
              >
                Warning + expandable
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    type: "error",
                    title: "Error",
                    description: "Something failed — copy button appears for string descriptions.",
                  })
                }
              >
                Error + copy
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    type: "error",
                    title: "Error (no copy)",
                    description: "Copy control hidden via data.hideCopyButton.",
                    data: { hideCopyButton: true },
                  })
                }
              >
                Error hide copy
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    type: "loading",
                    title: "Loading",
                    description: "Spinner in the icon slot.",
                  })
                }
              >
                Loading
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Title-only & long body</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={() => toastManager.add({ title: "Title only" })}
              >
                Title only
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    type: "info",
                    title: "Long description",
                    description: LONG_COPY,
                  })
                }
              >
                Long description
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Actions & layout</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    type: "warning",
                    title: "Inline action",
                    description: "Default action alignment.",
                    actionProps: {
                      children: "Fix it",
                      onClick: () => undefined,
                    },
                  })
                }
              >
                Inline action
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add(
                    stackedThreadToast({
                      type: "warning",
                      title: "Stacked action",
                      description: "Action pinned to the end on its own row.",
                      actionProps: {
                        children: "Review",
                        onClick: () => undefined,
                      },
                    }),
                  )
                }
              >
                Stacked action
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add(
                    stackedThreadToast({
                      type: "error",
                      title: "Destructive action",
                      description: "actionVariant: destructive",
                      actionVariant: "destructive",
                      actionProps: {
                        children: "Delete",
                        onClick: () => undefined,
                      },
                    }),
                  )
                }
              >
                Destructive
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    type: "info",
                    title: "Outline action",
                    description: "actionVariant: outline",
                    data: { actionVariant: "outline" },
                    actionProps: {
                      children: "Details",
                      onClick: () => undefined,
                    },
                  })
                }
              >
                Outline CTA
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Kitchen sink</h2>
            <p className="text-xs text-muted-foreground">
              Long <code className="rounded bg-muted px-1">error</code> body (copy),{" "}
              <code className="rounded bg-muted px-1">stacked-end</code> CTA row, destructive
              variant, corner dismiss — plus optional multi-toast stack behind it.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add(
                    stackedThreadToast({
                      type: "error",
                      title: "Mega failure (stacked · copy · destructive CTA)",
                      description: MEGA_ERROR_BODY,
                      actionVariant: "destructive",
                      actionProps: {
                        children: "Open logs",
                        onClick: () => undefined,
                      },
                    }),
                  )
                }
              >
                Long error · stacked · all
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  toastManager.add({
                    type: "info",
                    title: "Stack backdrop A",
                    description: "Behind the mega error — hover the stack to expand.",
                  });
                  toastManager.add({
                    type: "info",
                    title: "Stack backdrop B",
                    description: "Second filler toast for peek height + reflow.",
                  });
                  toastManager.add(
                    stackedThreadToast({
                      type: "error",
                      title: "Mega failure (front-most)",
                      description: MEGA_ERROR_BODY,
                      actionVariant: "destructive",
                      actionProps: {
                        children: "Open logs",
                        onClick: () => undefined,
                      },
                    }),
                  );
                }}
              >
                Same + 3-toast stack
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Auto-dismiss</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  toastManager.add({
                    type: "success",
                    title: "Auto-dismiss",
                    description: "Closes after 3s while the tab is focused and visible.",
                    data: { dismissAfterVisibleMs: 3000 },
                  })
                }
              >
                3s auto-dismiss
              </Button>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Stacking</h2>
            <div className="flex flex-wrap gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  toastManager.add({
                    type: "info",
                    title: "Stack A",
                    description: "Front-most in the stack.",
                  });
                  toastManager.add({
                    type: "info",
                    title: "Stack B",
                    description: "Peek / expand interactions.",
                  });
                  toastManager.add({
                    type: "success",
                    title: "Stack C",
                    description: "Third toast — try hover expand.",
                  });
                }}
              >
                Queue three
              </Button>
            </div>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Anchored toasts</CardTitle>
          <CardDescription>
            <code className="rounded bg-muted px-1 py-0.5 text-xs">anchoredToastManager</code> with
            a real anchor element (same thread scoping rules as viewport toasts).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              ref={anchoredTooltipAnchorRef}
              size="xs"
              variant="secondary"
              onClick={() => {
                const el = anchoredTooltipAnchorRef.current;
                if (!el) return;
                anchoredToastManager.add({
                  data: { tooltipStyle: true },
                  positionerProps: { anchor: el },
                  timeout: 4000,
                  title: "Tooltip-style anchored",
                });
              }}
            >
              Tooltip anchored
            </Button>
            <Button
              ref={anchoredPanelAnchorRef}
              size="xs"
              variant="secondary"
              onClick={() => {
                const el = anchoredPanelAnchorRef.current;
                if (!el) return;
                anchoredToastManager.add({
                  type: "success",
                  positionerProps: { anchor: el, sideOffset: 8 },
                  timeout: 8000,
                  title: "Panel anchored",
                  description: "Full card layout with dismiss and optional action.",
                  actionProps: {
                    children: "OK",
                    onClick: () => undefined,
                  },
                });
              }}
            >
              Panel anchored
            </Button>
            <Button
              size="xs"
              variant="outline"
              className={cn(anchoredManager.toasts.length === 0 && "opacity-50")}
              disabled={anchoredManager.toasts.length === 0}
              onClick={() => {
                for (const t of anchoredManager.toasts) {
                  anchoredManager.close(t.id);
                }
              }}
            >
              Dismiss all anchored
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

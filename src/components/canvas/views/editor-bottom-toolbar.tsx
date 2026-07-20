"use client";

import * as React from "react";
import {
  ClipboardCopy,
  Download,
  Hand as HandIcon,
  ImageDown,
  Loader2,
  MousePointer2 as CursorArrowIcon,
  Pencil,
  PenTool,
  Redo,
  Send,
  Sparkles,
  Undo,
} from "lucide-react";
import type { UserContent } from "ai";
import { useEveAgent } from "eve/react";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { generatedBlockPayloadSchema, updateHtmlBlockPayloadSchema } from "@/lib/assistant-schemas";
import { buildCanvasContext } from "@/lib/canvas-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CustomTooltip from "@/components/ui/tooltip";
import { useEditorStore } from "../use-editor";
import { BlockIcon } from "../utils";
import { useShallow } from "zustand/react/shallow";
import { useOrderedBlocks } from "../hooks/use-ordered-blocks";
import { captureSelectedBlocksAsImage, calculateSelectedBlocksBounds } from "../services/export";
import { EXPORT_PADDING } from "../utils/constants";
import type { SelectionBounds } from "@/lib/types";
import type { IEditorBlocks } from "@/lib/schema";
import { ApiKeyDialog, GATEWAY_API_KEY_STORAGE_KEY } from "../../api-key-dialog";
import { createLoadingBlock } from "../utils/loading-block";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Separator } from "@/components/ui/separator";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * BYO-key transport: the stored gateway key rides as a bearer header on
 * every eve request (the channel verifier hands it to the dynamic model
 * resolver). Read from localStorage on every request — eve captures this
 * resolver once at store creation, so React state would go stale.
 */
const resolveAuthHeaders = (): Readonly<Record<string, string>> => {
  if (typeof window === "undefined") return {};
  const key = window.localStorage.getItem(GATEWAY_API_KEY_STORAGE_KEY);
  return key !== null && key.length > 0 ? { authorization: `Bearer ${key}` } : {};
};

/**
 * Auth-shaped failures: a 401 from the channel (keyless in prod), a
 * rejected gateway key at the model call, or a missing server key in dev.
 * All of them route back to the key dialog.
 */
const isAuthError = (error: Error): boolean =>
  /unauthorized|forbidden|authentication|api.?key|credential|401|403/i.test(error.message);

// -----------------------------------------------------------------------------
// Stream events -> store mutations
//
// eve streams tool calls as `actions.requested` (input available before the
// tool runs — used to drop a loading placeholder for HTML builds) and tool
// results as `action.result` events whose `data.result.output` is the tool's
// full `execute` return. Every payload is zod-parsed against the shared
// assistant schemas before touching the zustand store.
// -----------------------------------------------------------------------------

const toolCallActionSchema = z.object({
  kind: z.literal("tool-call"),
  callId: z.string(),
  toolName: z.string(),
});

const actionsRequestedEventSchema = z.object({
  type: z.literal("actions.requested"),
  data: z.object({ actions: z.array(z.unknown()) }),
});

const toolResultEventSchema = z.object({
  type: z.literal("action.result"),
  data: z.object({
    status: z.enum(["completed", "failed", "rejected"]),
    result: z.object({
      kind: z.literal("tool-result"),
      callId: z.string(),
      toolName: z.string(),
      output: z.unknown(),
      isError: z.boolean().optional(),
    }),
  }),
});

/** `subagent.event` wraps a child session's stream event under `data.event`. */
const subagentEventSchema = z.object({
  type: z.literal("subagent.event"),
  data: z.object({ event: z.unknown() }),
});

/** callId -> placeholder block id for in-flight build_html_block calls. */
const pendingHtmlBuilds = new Map<string, string>();

/** Selection bounds captured at send time; places the loading placeholder. */
let lastSelectionBounds: SelectionBounds | null = null;

/** Removes every outstanding loading placeholder (turn failed or errored). */
const dropPendingLoadingBlocks = (): void => {
  const store = useEditorStore.getState();
  for (const blockId of pendingHtmlBuilds.values()) {
    store.deleteBlock(blockId);
  }
  pendingHtmlBuilds.clear();
};

const applyAgentEvent = (event: unknown): void => {
  // Delegation is forbidden by the instructions, but if the model strays,
  // unwrap the child's events so its tool results still reach the canvas.
  const wrapped = subagentEventSchema.safeParse(event);
  if (wrapped.success) {
    applyAgentEvent(wrapped.data.data.event);
    return;
  }

  const store = useEditorStore.getState();

  // Tool call requested: drop a spinner placeholder for HTML builds so the
  // user sees where the block will land while the model writes the markup.
  const requested = actionsRequestedEventSchema.safeParse(event);
  if (requested.success) {
    for (const rawAction of requested.data.data.actions) {
      const action = toolCallActionSchema.safeParse(rawAction);
      if (!action.success) continue;
      const { callId, toolName } = action.data;
      if (toolName !== "build_html_block" || pendingHtmlBuilds.has(callId)) continue;
      const loadingBlock = createLoadingBlock(lastSelectionBounds);
      pendingHtmlBuilds.set(callId, loadingBlock.id);
      store.addBlock(loadingBlock);
    }
    return;
  }

  const parsed = toolResultEventSchema.safeParse(event);
  if (!parsed.success) return;
  const { status, result } = parsed.data.data;

  const loadingBlockId = pendingHtmlBuilds.get(result.callId);
  if (status !== "completed" || result.isError === true) {
    // Failed/rejected build: remove its placeholder and let the turn-level
    // error surface through onError.
    if (loadingBlockId !== undefined) {
      pendingHtmlBuilds.delete(result.callId);
      store.deleteBlock(loadingBlockId);
    }
    return;
  }

  switch (result.toolName) {
    case "generate_text_block":
    case "generate_frame_block":
    case "generate_image_block": {
      const payload = generatedBlockPayloadSchema.safeParse(result.output);
      if (!payload.success) return;
      store.addBlock(payload.data.block);
      break;
    }
    case "build_html_block": {
      const payload = generatedBlockPayloadSchema.safeParse(result.output);
      if (!payload.success) return;
      let block = payload.data.block;
      if (loadingBlockId !== undefined) {
        pendingHtmlBuilds.delete(result.callId);
        const placeholder: IEditorBlocks | undefined = store.blocksById[loadingBlockId];
        if (placeholder) {
          // Land exactly where the placeholder sat, then swap it out.
          block = { ...block, x: placeholder.x, y: placeholder.y };
          store.deleteBlock(loadingBlockId);
        }
      }
      store.addBlock(block);
      break;
    }
    case "update_html_block": {
      const payload = updateHtmlBlockPayloadSchema.safeParse(result.output);
      if (!payload.success) return;
      const { updateBlockId, ...updates } = payload.data;
      if (!store.blocksById[updateBlockId]) {
        toast.error("The assistant tried to update a block that no longer exists");
        return;
      }
      store.updateBlockValues(updateBlockId, updates);
      break;
    }
  }
};

function EditorBottomToolbar() {
  const [toolbarMode, setToolbarMode] = React.useState<"design" | "ai">("ai");
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const [mode, setMode] = useEditorStore(useShallow((state) => [state.canvas.mode, state.setMode]));
  const setPendingImageData = useEditorStore((state) => state.setPendingImageData);
  const [handleUndo, handleRedo, undoCount, redoCount] = useEditorStore(
    useShallow((state) => [
      state.handleUndo,
      state.handleRedo,
      state.history.undo.length,
      state.history.redo.length,
    ]),
  );
  const downloadImage = useEditorStore((state) => state.downloadImage);
  const stage = useEditorStore((state) => state.stage);
  const blocks = useOrderedBlocks();
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const [canvasSize, canvasBackground] = useEditorStore(
    useShallow((state) => [state.canvas.size, state.canvas.background]),
  );

  // AI Prompt state
  const [input, setInput] = React.useState("");
  const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);
  const [apiKey, , removeApiKey] = useLocalStorage(GATEWAY_API_KEY_STORAGE_KEY, "");

  const agent = useEveAgent({
    headers: resolveAuthHeaders,
    onEvent: applyAgentEvent,
    onError: (error) => {
      dropPendingLoadingBlocks();
      if (isAuthError(error)) {
        removeApiKey();
        toast.error("Invalid API key. Please enter a valid Vercel AI Gateway API key.");
        setShowApiKeyModal(true);
      } else {
        toast.error(error.message || "Failed to generate block");
      }
    },
  });
  const { status, error } = agent;

  const isLoading = status === "submitted" || status === "streaming";
  const showKeyNotice = status === "error" && error !== undefined && isAuthError(error);
  const needsKey = !apiKey && process.env.NODE_ENV !== "development";
  const handleCopyJson = React.useCallback(async () => {
    const serialized = JSON.stringify(
      {
        blocks,
        size: canvasSize,
        background: canvasBackground,
      },
      null,
      2,
    );

    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard ||
      typeof navigator.clipboard.writeText !== "function"
    ) {
      toast.error("Clipboard is not available in this environment.");
      return;
    }

    try {
      await navigator.clipboard.writeText(serialized);
      toast.success("Canvas JSON copied to clipboard.");
    } catch (error) {
      console.error("Failed to copy canvas JSON", error);
      toast.error("Failed to copy JSON to clipboard.");
    }
  }, [blocks, canvasBackground, canvasSize]);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;
      if (needsKey) {
        setShowApiKeyModal(true);
        return;
      }

      let selectionBounds: SelectionBounds | null = null;
      if (selectedIds.length > 0) {
        const boundsWithPadding = calculateSelectedBlocksBounds(blocks, selectedIds);
        if (boundsWithPadding) {
          selectionBounds = {
            x: boundsWithPadding.x + EXPORT_PADDING,
            y: boundsWithPadding.y + EXPORT_PADDING,
            width: boundsWithPadding.width - EXPORT_PADDING * 2,
            height: boundsWithPadding.height - EXPORT_PADDING * 2,
          };
        }
      }
      // Stash for the actions.requested handler, which places the HTML-build
      // loading placeholder relative to the selection this turn was sent with.
      lastSelectionBounds = selectionBounds;

      // PNG snapshot of the canvas (or just the selection) — the model's
      // visual context. Capture failures degrade to a text-only turn.
      let canvasImage: string | null = null;
      try {
        canvasImage = await captureSelectedBlocksAsImage(stage, blocks, selectedIds);
      } catch {
        canvasImage = null;
      }

      const message: string | UserContent = canvasImage
        ? [
            { type: "text", text: trimmed },
            { type: "file", data: canvasImage, mediaType: "image/png", filename: "canvas.png" },
          ]
        : trimmed;

      agent
        .send({
          message,
          clientContext: buildCanvasContext({
            canvasSize,
            background: canvasBackground,
            selectionBounds,
            blocks,
            selectedIds,
          }),
        })
        .catch(() => undefined); // failures surface via status/error/onError
      setInput("");
    },
    [input, isLoading, needsKey, agent, stage, blocks, selectedIds, canvasSize, canvasBackground],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaFocus = () => {
    if (needsKey) setShowApiKeyModal(true);
  };

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isInInput =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      // Handle Shift+Tab to toggle between design and AI mode
      if (event.key === "Tab" && event.shiftKey) {
        if (isInInput) {
          return;
        }
        event.preventDefault();
        setToolbarMode((prev) => (prev === "design" ? "ai" : "design"));
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setToolbarMode, toolbarMode, input, isLoading, handleSubmit]);

  return (
    <>
      <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2">
        <div className="border border-border/50 supports-backdrop-filter:bg-background/80 bg-background/95 backdrop-blur shadow-xl rounded-[1.25rem]">
          <Tabs
            value={toolbarMode}
            onValueChange={(value) => setToolbarMode(value === "design" ? "design" : "ai")}
          >
            <div className="flex gap-2 p-2 items-center">
              <TabsContent value="design" className="mt-0">
                <div className="flex gap-1">
                  <CustomTooltip content="Select" hotkey="V">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMode("select")}
                      className={cn(mode === "select" && "bg-muted")}
                    >
                      <CursorArrowIcon />
                    </Button>
                  </CustomTooltip>
                  <CustomTooltip content="Move" hotkey="Space">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMode("move")}
                      className={cn(mode === "move" && "bg-muted")}
                    >
                      <HandIcon />
                    </Button>
                  </CustomTooltip>
                  <CustomTooltip content="Add Text" hotkey="T">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMode("text")}
                      className={cn(mode === "text" && "bg-muted")}
                    >
                      {BlockIcon("text")}
                    </Button>
                  </CustomTooltip>
                  <CustomTooltip content="Add Image">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (imageInputRef.current) {
                          imageInputRef.current.click();
                        }
                      }}
                      className={cn(mode === "image" && "bg-muted")}
                    >
                      {BlockIcon("image")}
                    </Button>
                  </CustomTooltip>
                  <CustomTooltip content="Add Frame" hotkey="F">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMode("frame")}
                      className={cn(mode === "frame" && "bg-muted")}
                    >
                      {BlockIcon("frame")}
                    </Button>
                  </CustomTooltip>
                  <CustomTooltip content="Add Arrow" hotkey="A">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMode("arrow")}
                      className={cn(mode === "arrow" && "bg-muted")}
                    >
                      {BlockIcon("arrow")}
                    </Button>
                  </CustomTooltip>
                  <CustomTooltip content="Draw" hotkey="D">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMode("draw")}
                      className={cn(mode === "draw" && "bg-muted")}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CustomTooltip>
                  <Separator orientation="vertical" className="h-7! my-auto" />
                  <CustomTooltip content="Undo" hotkey="⌘Z">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleUndo}
                      disabled={undoCount === 0}
                    >
                      <Undo />
                    </Button>
                  </CustomTooltip>
                  <CustomTooltip content="Redo" hotkey="⌘⇧Z">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRedo}
                      disabled={redoCount === 0}
                    >
                      <Redo />
                    </Button>
                  </CustomTooltip>
                  <Separator orientation="vertical" className="h-7! my-auto" />
                  <DropdownMenu>
                    <CustomTooltip content="Export">
                      <DropdownMenuTrigger
                        render={
                          <Button size="icon" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </CustomTooltip>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => {
                          void downloadImage();
                        }}
                      >
                        <ImageDown className="mr-2 h-4 w-4" />
                        Export as image
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          void handleCopyJson();
                        }}
                      >
                        <ClipboardCopy className="mr-2 h-4 w-4" />
                        Copy as JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="mt-0">
                {showKeyNotice && (
                  <div className="mb-2 max-w-[360px] rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    The assistant needs a Vercel AI Gateway key —{" "}
                    <button
                      type="button"
                      className="underline"
                      onClick={() => setShowApiKeyModal(true)}
                    >
                      add yours
                    </button>{" "}
                    or set <code className="font-mono">AI_GATEWAY_API_KEY</code> on the server.
                  </div>
                )}
                <InputGroup className="min-w-[300px] pr-1">
                  <InputGroupTextarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={handleTextareaFocus}
                    placeholder="Describe what you want to create..."
                    disabled={isLoading}
                    rows={1}
                    className={cn(
                      "min-h-[24px] max-h-[120px] text-foreground overflow-y-auto p-2",
                      "placeholder:text-muted-foreground/50",
                    )}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      variant="secondary"
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </TabsContent>
              <TabsList>
                <CustomTooltip content="AI Mode">
                  <TabsTrigger
                    value="ai"
                    className={cn(
                      toolbarMode === "ai" &&
                        "bg-background shadow-sm dark:text-foreground dark:border-input dark:bg-input/30",
                    )}
                  >
                    <Sparkles className="h-3 w-3" />
                  </TabsTrigger>
                </CustomTooltip>
                <CustomTooltip content="Design Mode">
                  <TabsTrigger
                    value="design"
                    className={cn(
                      toolbarMode === "design" &&
                        "bg-background shadow-sm dark:text-foreground dark:border-input dark:bg-input/30",
                    )}
                  >
                    <PenTool className="h-3 w-3" />
                  </TabsTrigger>
                </CustomTooltip>
              </TabsList>
            </div>
          </Tabs>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={imageInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
              // readAsDataURL always yields a string result
              if (typeof reader.result !== "string") return;
              const img = new Image();
              img.addEventListener("load", () => {
                setPendingImageData({
                  url: img.src,
                  width: img.width,
                  height: img.height,
                });
                setMode("image");
              });
              img.src = reader.result;
            });
            reader.readAsDataURL(file);
            // reset input value
            e.target.value = "";
          }
        }}
      />
      <ApiKeyDialog open={showApiKeyModal} onOpenChange={setShowApiKeyModal} />
    </>
  );
}

export default EditorBottomToolbar;

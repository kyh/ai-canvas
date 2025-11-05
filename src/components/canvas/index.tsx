'use client';

import * as React from "react";
import { TbInfoTriangleFilled } from "react-icons/tb";
import EditorHeader from "./views/editor-header";
import EditorLeftSide from "./views/editor-left-side";
import EditorRightSide from "./views/editor-right-side";
import EditorCanvas from "./views/editor-canvas";
import { initializeEditorStore } from "./use-editor";
import { useIsMobile } from "./utils";
import AIPrompt from "../ai-prompt";
import type { Template } from "@/lib/schema";

interface CanvasProps {
  template?: Template;
}

function Canvas({ template }: CanvasProps) {
  const isMobile = useIsMobile();
  React.useLayoutEffect(() => {
    initializeEditorStore(template);
  }, [template]);

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-amber-100/50 p-4 text-center dark:bg-yellow-950/10">
        <TbInfoTriangleFilled className="size-10 text-yellow-600 dark:text-yellow-400" />
        <h1 className="text-xl font-semibold">Use desktop browser</h1>
        <p className="text-md text-foreground/60">
          The designer works best on a desktop browser.
        </p>
      </div>
    );
  }

  return (
    <div className="editor-canvas-wrapper h-screen bg-slate-100 dark:bg-slate-900">
      <EditorHeader />
      <div className="flex h-screen">
        <EditorLeftSide />
        <EditorCanvas />
        <EditorRightSide />
      </div>
      <AIPrompt />
    </div>
  );
}

export default Canvas;

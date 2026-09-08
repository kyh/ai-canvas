"use client";

import * as React from "react";
import EditorLeftSide from "./views/editor-left-side";
import EditorRightSide from "./views/editor-right-side";
import EditorCanvas from "./views/editor-canvas";
import EditorBottomToolbar from "./views/editor-bottom-toolbar";
import { initializeEditorStore } from "./use-editor";
import type { Template } from "@/lib/schema";

interface CanvasProps {
  template?: Template;
}

const Canvas = ({ template }: CanvasProps) => {
  React.useLayoutEffect(() => {
    initializeEditorStore(template);
  }, [template]);

  return (
    <div className="editor-canvas-wrapper h-screen bg-slate-100 dark:bg-slate-900">
      <div className="flex h-screen">
        <EditorLeftSide />
        <EditorCanvas />
        <EditorRightSide />
      </div>
      <EditorBottomToolbar />
    </div>
  );
};

export default Canvas;

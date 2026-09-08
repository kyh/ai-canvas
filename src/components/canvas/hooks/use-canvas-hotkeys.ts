import * as React from "react";
import { editorStoreApi } from "../use-editor";
import type { EditorStore } from "../use-editor";
import type Konva from "konva";

type EditorMode = EditorStore["canvas"]["mode"];

interface UseCanvasHotkeysOptions {
  setMode: (mode: EditorMode) => void;
  deleteSelectedBlocks: () => void;
  copySelectedBlocks: () => void;
  pasteBlocks: (position?: { x: number; y: number }) => void;
  stage: Konva.Stage | null;
  zoom: number;
}

const MODE_HOTKEYS = new Map<string, EditorMode>([
  ["a", "arrow"],
  ["d", "draw"],
  ["f", "frame"],
  ["t", "text"],
  ["v", "select"],
]);

const isEditableTarget = (target: EventTarget | null) => {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const { tagName } = target;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
};

const isTypingInto = (event: KeyboardEvent, state: EditorStore) =>
  isEditableTarget(event.target) || state.canvas.isTextEditing;

const getPointerPosition = (stage: Konva.Stage | null) => {
  if (!stage) {
    return null;
  }
  const pointer = stage.getPointerPosition();
  if (!pointer) {
    return null;
  }
  return pointer;
};

const toCanvasCoordinates = (
  stage: Konva.Stage,
  position: { x: number; y: number },
  zoom: number,
) => {
  const stagePos = stage.position();
  return {
    x: (position.x - stagePos.x) / zoom,
    y: (position.y - stagePos.y) / zoom,
  };
};

export const useCanvasHotkeys = ({
  setMode,
  deleteSelectedBlocks,
  copySelectedBlocks,
  pasteBlocks,
  stage,
  zoom,
}: UseCanvasHotkeysOptions) => {
  const spacePressedRef = React.useRef(false);
  const spacePrevModeRef = React.useRef<EditorMode | null>(null);

  React.useEffect(() => {
    const store = editorStoreApi;

    const selectAllBlocks = (state: EditorStore) => {
      const allBlockIds = state.blockOrder.flatMap((id) => {
        const block = state.blocksById[id];
        return block?.visible ? [block.id] : [];
      });
      if (allBlockIds.length > 0) {
        store.getState().setSelectedIds(allBlockIds);
      }
    };

    const pasteAtPointer = () => {
      const pointer = getPointerPosition(stage);
      const pastePosition =
        pointer && stage ? toCanvasCoordinates(stage, pointer, zoom) : undefined;
      pasteBlocks(pastePosition);
    };

    // Cmd/Ctrl combos; the browser keeps them inside inputs
    const handleCommandKey = (event: KeyboardEvent, state: EditorStore) => {
      if (isTypingInto(event, state)) {
        return;
      }
      switch (event.key.toLowerCase()) {
        case "a": {
          event.preventDefault();
          selectAllBlocks(state);
          break;
        }
        case "c": {
          if (state.selectedIds.length > 0) {
            event.preventDefault();
            copySelectedBlocks();
          }
          break;
        }
        case "v": {
          if (state.clipboard && state.clipboard.length > 0) {
            event.preventDefault();
            pasteAtPointer();
          }
          break;
        }
        default: {
          break;
        }
      }
    };

    const holdSpaceForMove = (state: EditorStore) => {
      if (spacePressedRef.current) {
        return;
      }
      spacePressedRef.current = true;
      spacePrevModeRef.current = state.canvas.mode;
      if (state.canvas.mode !== "move") {
        setMode("move");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      const state = store.getState();

      if (event.metaKey || event.ctrlKey) {
        handleCommandKey(event, state);
        return;
      }

      if (event.altKey || isTypingInto(event, state)) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        holdSpaceForMove(state);
        return;
      }

      const key = event.key.toLowerCase();
      const mode = MODE_HOTKEYS.get(key);
      if (mode) {
        setMode(mode);
        event.preventDefault();
        return;
      }

      if ((key === "backspace" || key === "delete") && state.selectedIds.length > 0) {
        event.preventDefault();
        deleteSelectedBlocks();
      }
    };

    const resetSpaceMode = () => {
      if (!spacePressedRef.current) {
        return;
      }
      spacePressedRef.current = false;
      const previousMode = spacePrevModeRef.current;
      spacePrevModeRef.current = null;
      if (!previousMode) {
        return;
      }
      const currentMode = store.getState().canvas.mode;
      if (currentMode !== previousMode) {
        setMode(previousMode);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        resetSpaceMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", resetSpaceMode);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", resetSpaceMode);
    };
  }, [deleteSelectedBlocks, setMode, copySelectedBlocks, pasteBlocks, stage, zoom]);
};

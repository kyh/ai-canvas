import { generateId } from "@/lib/id-generator";
import { htmlBlockSchema } from "@/lib/schema";
import { LOADING_HTML } from "@/components/canvas/utils/loading-html";
import {
  LOADING_HTML_BLOCK_WIDTH,
  LOADING_HTML_BLOCK_HEIGHT,
  getCanvasCenterPosition,
} from "@/components/canvas/utils/constants";
import type { SelectionBounds } from "@/lib/types";

/**
 * Creates a loading HTML block with a spinner.
 * Used to show a placeholder while HTML is being generated.
 */
export function createLoadingBlock(selectionBounds?: SelectionBounds) {
  const centerPos = getCanvasCenterPosition(
    LOADING_HTML_BLOCK_WIDTH,
    LOADING_HTML_BLOCK_HEIGHT
  );
  const x = selectionBounds
    ? selectionBounds.x + selectionBounds.width + 30
    : centerPos.x;
  const y = selectionBounds ? selectionBounds.y : centerPos.y;

  const block = {
    type: "html" as const,
    label: "Building...",
    x,
    y,
    width: LOADING_HTML_BLOCK_WIDTH,
    height: LOADING_HTML_BLOCK_HEIGHT,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    visible: true,
    opacity: 100,
    html: LOADING_HTML,
    background: "#ffffff",
    border: {
      color: "#d1d5db",
      width: 1,
    },
    radius: { tl: 16, tr: 16, br: 16, bl: 16 },
    id: generateId(),
  };

  return htmlBlockSchema.parse(block);
}


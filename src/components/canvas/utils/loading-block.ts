import { generateId } from "@/lib/id-generator";
import { htmlBlockSchema } from "@/lib/schema";
import type { SelectionBounds } from "@/lib/types";
import {
  getCanvasCenterPosition,
  LOADING_HTML_BLOCK_HEIGHT,
  LOADING_HTML_BLOCK_WIDTH,
} from "./constants";
import { LOADING_HTML } from "./loading-html";

/**
 * Creates a spinner placeholder html block. The toolbar adds it the moment
 * the agent requests a `build_html_block` call (via the `actions.requested`
 * stream event) and swaps it for the real block when the tool result lands.
 * Positioned next to the selection when one exists, otherwise centered —
 * mirroring the placement rule the agent follows.
 */
export function createLoadingBlock(selectionBounds: SelectionBounds | null) {
  const centerPosition = getCanvasCenterPosition(
    LOADING_HTML_BLOCK_WIDTH,
    LOADING_HTML_BLOCK_HEIGHT,
  );
  const x = selectionBounds ? selectionBounds.x + selectionBounds.width + 30 : centerPosition.x;
  const y = selectionBounds ? selectionBounds.y : centerPosition.y;

  return htmlBlockSchema.parse({
    type: "html",
    id: generateId(),
    label: "HTML",
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
    border: { color: "#d1d5db", width: 1 },
    radius: { tl: 16, tr: 16, br: 16, bl: 16 },
  });
}

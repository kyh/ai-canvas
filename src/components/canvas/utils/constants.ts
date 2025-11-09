/**
 * Canvas and block dimension constants
 */

export const CANVAS_DEFAULT_WIDTH = 1280;
export const CANVAS_DEFAULT_HEIGHT = 720;

export const LOADING_HTML_BLOCK_WIDTH = 400;
export const LOADING_HTML_BLOCK_HEIGHT = 300;

export const EXPORT_PADDING = 20;

/**
 * Calculate center position for a block on the default canvas
 */
export function getCanvasCenterPosition(
  blockWidth: number,
  blockHeight: number
) {
  return {
    x: (CANVAS_DEFAULT_WIDTH - blockWidth) / 2,
    y: (CANVAS_DEFAULT_HEIGHT - blockHeight) / 2,
  };
}

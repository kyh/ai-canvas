import type Konva from "konva";
import type { IEditorSize } from "@/lib/schema";

export interface ViewportContext {
  stage: Konva.Stage | null;
  stagePosition: { x: number; y: number } | null;
  zoom: number;
  containerSize: { width: number; height: number };
  canvasSize: IEditorSize;
}

export const centerBlockInCanvas = (size: IEditorSize, width: number, height: number) => ({
  x: Math.round(size.width / 2 - width / 2),
  y: Math.round(size.height / 2 - height / 2),
});

export const centerStageWithinContainer = ({
  canvasSize,
  containerSize,
  zoom,
}: {
  canvasSize: IEditorSize;
  containerSize: { width: number; height: number };
  zoom: number;
}) => ({
  x: Math.round((containerSize.width - canvasSize.width * zoom) / 2),
  y: Math.round((containerSize.height - canvasSize.height * zoom) / 2),
});

export const centerBlockInViewport = (context: ViewportContext, width: number, height: number) => {
  const { stage, stagePosition, zoom, containerSize, canvasSize } = context;
  if (!stage) {
    return centerBlockInCanvas(canvasSize, width, height);
  }
  const containerWidth = stage.width() || containerSize.width;
  const containerHeight = stage.height() || containerSize.height;
  const currentZoom = zoom || 1;
  const currentStagePosition = stagePosition ?? stage.position();
  if (containerWidth <= 0 || containerHeight <= 0 || currentZoom <= 0) {
    return centerBlockInCanvas(canvasSize, width, height);
  }
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const canvasX = (centerX - currentStagePosition.x) / currentZoom;
  const canvasY = (centerY - currentStagePosition.y) / currentZoom;
  if (!Number.isFinite(canvasX) || !Number.isFinite(canvasY)) {
    return centerBlockInCanvas(canvasSize, width, height);
  }
  return {
    x: Math.round(canvasX - width / 2),
    y: Math.round(canvasY - height / 2),
  };
};

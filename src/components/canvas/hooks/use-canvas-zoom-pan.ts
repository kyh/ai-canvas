import * as React from "react";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
type CanvasPointer = { x: number; y: number };

interface UseCanvasZoomPanArgs {
  stageRef: React.RefObject<Konva.Stage | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  stagePosition: { x: number; y: number } | null;
  zoom: number;
  containerSize: { width: number; height: number };
  setStageZoom: (zoom: number) => void;
  setStagePosition: (position: { x: number; y: number }) => void;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5;

export const useCanvasZoomPan = ({
  stageRef,
  containerRef,
  stagePosition,
  zoom,
  containerSize,
  setStageZoom,
  setStagePosition,
}: UseCanvasZoomPanArgs) => {
  const applyZoom = React.useCallback(
    (nextZoom: number, pivot?: CanvasPointer) => {
      const clamped = Math.min(Math.max(nextZoom, MIN_ZOOM), MAX_ZOOM);
      const stage = stageRef.current;
      if (!stage) {
        setStageZoom(clamped);
        return;
      }
      const position = stagePosition ?? stage.position();
      const oldZoom = zoom;
      const pivotPoint =
        pivot ??
        (() => {
          const container = containerRef.current;
          if (!container) {
            return { x: position.x, y: position.y };
          }
          return { x: containerSize.width / 2, y: containerSize.height / 2 };
        })();
      const mousePointTo = {
        x: (pivotPoint.x - position.x) / oldZoom,
        y: (pivotPoint.y - position.y) / oldZoom,
      };
      const newPosition = {
        x: pivotPoint.x - mousePointTo.x * clamped,
        y: pivotPoint.y - mousePointTo.y * clamped,
      };
      setStageZoom(clamped);
      setStagePosition(newPosition);
    },
    [
      containerRef,
      containerSize.height,
      containerSize.width,
      setStagePosition,
      setStageZoom,
      stagePosition,
      stageRef,
      zoom,
    ],
  );

  const handleWheel = React.useCallback(
    (event: KonvaEventObject<WheelEvent>) => {
      const stage = stageRef.current;
      if (!stage) {
        return;
      }

      const { evt } = event;
      const deltaX = evt.deltaX;
      const deltaY = evt.deltaY;
      const deltaZ = evt.deltaZ ?? 0;
      const isPinchGesture =
        evt.ctrlKey || Math.abs(deltaZ) > Math.max(Math.abs(deltaX), Math.abs(deltaY));

      if (isPinchGesture) {
        evt.preventDefault();
        const pointer = stage.getPointerPosition();
        if (!pointer) {
          return;
        }
        const scaleBy = evt.deltaMode === WheelEvent.DOM_DELTA_LINE ? 1.06 : 1.02;
        const direction = deltaY > 0 ? -1 : 1;
        const nextScale = direction > 0 ? zoom * scaleBy : zoom / scaleBy;
        applyZoom(nextScale, pointer);
        return;
      }

      evt.preventDefault();
      const position = stagePosition ?? stage.position();
      const factor = evt.deltaMode === WheelEvent.DOM_DELTA_LINE ? 30 : 0.6;
      const newPosition = {
        x: position.x - deltaX * factor,
        y: position.y - deltaY * factor,
      };
      setStagePosition(newPosition);
    },
    [applyZoom, setStagePosition, stagePosition, stageRef, zoom],
  );

  return React.useMemo(
    () => ({
      applyZoom,
      handleWheel,
    }),
    [applyZoom, handleWheel],
  );
};

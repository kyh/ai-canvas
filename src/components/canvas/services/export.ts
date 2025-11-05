import type Konva from "konva";
import type { IEditorBlocks, IEditorSize } from "@/lib/schema";
import { loadFontsForBlocks } from "./fonts";

export const captureStageAsImage = async (
  stage: Konva.Stage | null,
  blocks: IEditorBlocks[]
): Promise<string | null> => {
  if (!stage) {
    return null;
  }
  await loadFontsForBlocks(blocks);
  const dataUrl = stage.toDataURL({ pixelRatio: window.devicePixelRatio || 1 });
  return dataUrl;
};

export const downloadStageAsImage = async (
  stage: Konva.Stage,
  blocks: IEditorBlocks[]
) => {
  await loadFontsForBlocks(blocks);
  const dataUrl = stage.toDataURL({ pixelRatio: window.devicePixelRatio || 1 });
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "canvas.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportCanvasAsJson = ({
  blocks,
  size,
  background,
}: {
  blocks: IEditorBlocks[];
  size: IEditorSize;
  background?: string;
}) => {
  const data = JSON.stringify(
    {
      blocks,
      size,
      background,
    },
    null,
    2
  );
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "canvas.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

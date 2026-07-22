import { fontsList } from "../controls/components/textControls/fonts";
import type { IEditorBlockText, IEditorBlocks } from "@/lib/schema";

const loadedFontWeights = new Map<string, Set<string>>();

const ensureFontStyleElement = () => {
  if (typeof document === "undefined") {
    return null;
  }
  const existing = document.getElementById("dynamic-font-loader") as HTMLStyleElement | null;
  if (existing) {
    return existing;
  }
  const style = document.createElement("style");
  style.id = "dynamic-font-loader";
  document.head.appendChild(style);
  return style;
};

const loadFontFamily = async (fontKey: string, weights: string[]) => {
  if (!weights.length || typeof document === "undefined") {
    return;
  }

  const uniqueRequestedWeights = Array.from(new Set(weights));
  const cachedWeights = loadedFontWeights.get(fontKey) ?? new Set<string>();
  const weightsToLoad = uniqueRequestedWeights.filter((weight) => !cachedWeights.has(weight));

  if (!weightsToLoad.length) {
    return;
  }

  try {
    const fontObject = await fontsList.find((font) => font.family === fontKey)?.load();
    if (!fontObject) {
      throw new Error(`Font ${fontKey} not found`);
    }

    const fontInfo = fontObject.getInfo();
    if (!fontInfo) {
      throw new Error(`Font ${fontKey} not loaded`);
    }

    const cssRules: string[] = [];
    const loadPromises: Promise<void>[] = [];

    for (const weight of weightsToLoad) {
      const fontFace = fontInfo.fonts?.normal?.[weight];
      if (!fontFace) {
        continue;
      }
      const fontUrl = fontFace?.latin;
      if (!fontUrl) {
        continue;
      }

      const font = new FontFace(fontKey, `url(${fontUrl})`, {
        weight: weight.toString(),
        style: "normal",
      });

      const loadPromise = font.load().then((loadedFont) => void document.fonts.add(loadedFont));
      loadPromises.push(loadPromise);

      cssRules.push(`
        @font-face {
          font-family: '${fontKey}';
          src: url('${fontUrl}');
          font-weight: ${weight};
          font-style: normal;
        }
      `);
    }

    if (!loadPromises.length) {
      return;
    }

    await Promise.all(loadPromises);
    await document.fonts.ready;

    const styleElement = ensureFontStyleElement();
    if (styleElement && cssRules.length) {
      styleElement.textContent = [styleElement.textContent ?? "", cssRules.join("\n")]
        .filter(Boolean)
        .join("\n");
    }

    const updatedWeights = cachedWeights;
    weightsToLoad.forEach((weight) => updatedWeights.add(weight));
    loadedFontWeights.set(fontKey, updatedWeights);
  } catch {
    // ignore font load errors
  }
};

export const loadFontsForBlocks = async (blocks: IEditorBlocks[]) => {
  const textBlocks = blocks.filter((block) => block.type === "text") as IEditorBlockText[];
  const fontWeightMap = new Map<string, Set<string>>();

  textBlocks.forEach((block) => {
    const weightSet = fontWeightMap.get(block.font.family) ?? new Set<string>();
    weightSet.add(block.font.weight);
    fontWeightMap.set(block.font.family, weightSet);
  });

  for (const [font, weights] of fontWeightMap.entries()) {
    await loadFontFamily(font, Array.from(weights));
  }
};

export const clearLoadedFontsCache = () => {
  loadedFontWeights.clear();
};

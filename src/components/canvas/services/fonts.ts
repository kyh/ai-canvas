import { fontsList } from "../controls/components/textControls/fonts";
import type { IEditorBlocks } from "@/lib/schema";

const loadedFontWeights = new Map<string, Set<string>>();

const ensureFontStyleElement = () => {
  if (typeof document === "undefined") {
    return null;
  }
  const existing = document.querySelector("#dynamic-font-loader");
  if (existing instanceof HTMLStyleElement) {
    return existing;
  }
  const style = document.createElement("style");
  style.id = "dynamic-font-loader";
  document.head.append(style);
  return style;
};

const loadFontFamily = async (fontKey: string, weights: string[]) => {
  if (!weights.length || typeof document === "undefined") {
    return;
  }

  const uniqueRequestedWeights = [...new Set(weights)];
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
        style: "normal",
        weight: weight.toString(),
      });

      const loadPromise = (async () => {
        document.fonts.add(await font.load());
      })();
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
    for (const weight of weightsToLoad) {
      updatedWeights.add(weight);
    }
    loadedFontWeights.set(fontKey, updatedWeights);
  } catch {
    // ignore font load errors
  }
};

export const loadFontsForBlocks = async (blocks: IEditorBlocks[]) => {
  const textBlocks = blocks.filter((block) => block.type === "text");
  const fontWeightMap = new Map<string, Set<string>>();

  for (const block of textBlocks) {
    const weightSet = fontWeightMap.get(block.font.family) ?? new Set<string>();
    weightSet.add(block.font.weight);
    fontWeightMap.set(block.font.family, weightSet);
  }

  for (const [font, weights] of fontWeightMap.entries()) {
    await loadFontFamily(font, [...weights]);
  }
};

export const clearLoadedFontsCache = () => {
  loadedFontWeights.clear();
};

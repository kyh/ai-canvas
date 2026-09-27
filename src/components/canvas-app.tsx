"use client";

import Canvas from "@/components/canvas";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { demoTemplate1 } from "@/data/template-1";

export const CanvasApp = () => (
  <ThemeProvider>
    <TooltipProvider>
      <Canvas template={demoTemplate1} />
    </TooltipProvider>
  </ThemeProvider>
);

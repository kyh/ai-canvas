"use client";

import { ThemeProvider } from "../components/theme-provider";
import { demoTemplate1 } from "../data/template-1";
import Canvas from "../components/canvas";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function Page() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Canvas template={demoTemplate1} />
      </TooltipProvider>
    </ThemeProvider>
  );
}

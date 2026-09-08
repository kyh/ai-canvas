"use client";

import { ThemeProvider } from "../components/theme-provider";
import { demoTemplate1 } from "../data/template-1";
import Canvas from "../components/canvas";
import { TooltipProvider } from "@/components/ui/tooltip";

const Page = () => (
  <ThemeProvider>
    <TooltipProvider>
      <Canvas template={demoTemplate1} />
    </TooltipProvider>
  </ThemeProvider>
);

export default Page;

'use client';

import { ThemeProvider } from "../components/theme-provider";
import Canvas from "../components/canvas";
import useEditor from "../components/canvas/use-editor";
import { demoTemplate1 } from "../data/template-1";
import type { Template } from "../components/canvas/editor-types";

export default function Page() {
  const editor = useEditor(demoTemplate1 as Template);

  // use this to export the template
  // editor.exportToJson();
  return (
    <ThemeProvider>
      <Canvas editor={editor} />
    </ThemeProvider>
  );
}

import type { IEditorBlockText } from "@/lib/schema";
import { textAlignSchema } from "@/lib/schema";
import {
  AlignLeft as TextAlignLeftIcon,
  AlignCenter as TextAlignCenterIcon,
  AlignRight as TextAlignRightIcon,
  AlignJustify as TextAlignJustifyIcon,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ControllerRow from "../controller-row";
import { selectTextBlock, useEditorStore } from "@/components/canvas/use-editor";

interface TextAlignControlProps {
  blockId: string;
  block?: IEditorBlockText;
  className?: string;
}

function TextAlignControl({ blockId, block, className }: TextAlignControlProps) {
  const storeBlock = useEditorStore(selectTextBlock(blockId));
  const resolvedBlock = block ?? storeBlock;
  const updateBlockValues = useEditorStore((state) => state.updateBlockValues);
  if (!resolvedBlock) {
    return null;
  }
  return (
    <ControllerRow label="Align" className={className} contentClassName="justify-between">
      <Tabs
        value={resolvedBlock.textAlign}
        className="w-full"
        onValueChange={(e) => {
          const parsed = textAlignSchema.safeParse(e);
          if (!parsed.success) {
            return;
          }
          updateBlockValues(blockId, { textAlign: parsed.data });
        }}
      >
        <TabsList>
          <TabsTrigger value="left">
            <TextAlignLeftIcon className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="center">
            <TextAlignCenterIcon className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="right">
            <TextAlignRightIcon className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="justify">
            <TextAlignJustifyIcon className="h-3 w-3" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </ControllerRow>
  );
}

export default TextAlignControl;

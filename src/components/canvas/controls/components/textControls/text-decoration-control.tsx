import type { IEditorBlockText } from "@/lib/schema";
import { textDecorationSchema } from "@/lib/schema";
import ControllerRow from "../controller-row";
import { selectTextBlock, useEditorStore } from "@/components/canvas/use-editor";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

interface TextDecorationControlProps {
  blockId: string;
  block?: IEditorBlockText;
  className?: string;
}

function TextDecorationControl({ blockId, block, className }: TextDecorationControlProps) {
  const storeBlock = useEditorStore(selectTextBlock(blockId));
  const resolvedBlock = block ?? storeBlock;
  const updateBlockValues = useEditorStore((state) => state.updateBlockValues);
  if (!resolvedBlock) {
    return null;
  }
  return (
    <ControllerRow label="Decoration" className={className} contentClassName="justify-between">
      <NativeSelect
        name="textDecoration"
        id="textDecoration"
        value={resolvedBlock.textDecoration || "inherit"}
        onChange={(e) => {
          const parsed = textDecorationSchema.safeParse(e.target.value);
          if (!parsed.success) {
            return;
          }
          updateBlockValues(blockId, { textDecoration: parsed.data });
        }}
      >
        <NativeSelectOption value="inherit">Default</NativeSelectOption>
        <NativeSelectOption value="overline">Overline</NativeSelectOption>
        <NativeSelectOption value="line-through">Line Through</NativeSelectOption>
        <NativeSelectOption value="underline">Underline</NativeSelectOption>
      </NativeSelect>
    </ControllerRow>
  );
}

export default TextDecorationControl;

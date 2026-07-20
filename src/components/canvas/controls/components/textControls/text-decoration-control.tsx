import type { IEditorBlockText, ITextDecoration } from "@/lib/schema";
import ControllerRow from "../controller-row";
import { useEditorStore } from "@/components/canvas/use-editor";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

interface TextDecorationControlProps {
  blockId: string;
  block?: IEditorBlockText;
  className?: string;
}

function TextDecorationControl({ blockId, block, className }: TextDecorationControlProps) {
  const storeBlock = useEditorStore(
    (state) => state.blocksById[blockId] as IEditorBlockText | undefined,
  );
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
          updateBlockValues(blockId, {
            textDecoration: e.target.value as ITextDecoration,
          });
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

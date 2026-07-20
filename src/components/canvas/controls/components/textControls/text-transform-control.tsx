import type { IEditorBlockText, ITextTransform } from "@/lib/schema";
import ControllerRow from "../controller-row";
import { useEditorStore } from "@/components/canvas/use-editor";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

interface TextTransformControlProps {
  blockId: string;
  block?: IEditorBlockText;
  className?: string;
}

function TextTransformControl({ blockId, block, className }: TextTransformControlProps) {
  const storeBlock = useEditorStore(
    (state) => state.blocksById[blockId] as IEditorBlockText | undefined,
  );
  const resolvedBlock = block ?? storeBlock;
  const updateBlockValues = useEditorStore((state) => state.updateBlockValues);
  if (!resolvedBlock) {
    return null;
  }
  return (
    <ControllerRow label="Transform" className={className} contentClassName="justify-between">
      <NativeSelect
        name="textTransform"
        id="textTransform"
        value={resolvedBlock.textTransform || "inherit"}
        onChange={(e) => {
          updateBlockValues(blockId, {
            textTransform: e.target.value as ITextTransform,
          });
        }}
      >
        <NativeSelectOption value="inherit">Default</NativeSelectOption>
        <NativeSelectOption value="capitalize">Capitalize</NativeSelectOption>
        <NativeSelectOption value="uppercase">Uppercase</NativeSelectOption>
        <NativeSelectOption value="lowercase">Lowercase</NativeSelectOption>
      </NativeSelect>
    </ControllerRow>
  );
}

export default TextTransformControl;

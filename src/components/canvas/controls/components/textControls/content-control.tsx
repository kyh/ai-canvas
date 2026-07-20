import type { IEditorBlockText } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import ControllerRow from "../controller-row";
import { useEditorStore } from "@/components/canvas/use-editor";

interface ContentControlProps {
  blockId: string;
  block?: IEditorBlockText;
  className?: string;
}

function ContentControl({ blockId, block, className }: ContentControlProps) {
  const storeBlock = useEditorStore(
    (state) => state.blocksById[blockId] as IEditorBlockText | undefined,
  );
  const resolvedBlock = block ?? storeBlock;
  const updateBlockValues = useEditorStore((state) => state.updateBlockValues);

  return (
    <ControllerRow label="Content" className={className} contentClassName="gap-3">
      <Input
        value={resolvedBlock?.text ?? ""}
        onChange={(event) => {
          if (!resolvedBlock) {
            return;
          }
          const nextText = event.target.value;
          const lines = nextText.split(/\n/).length;
          const nextHeight = Math.max(resolvedBlock.lineHeight, lines * resolvedBlock.lineHeight);
          updateBlockValues(blockId, {
            text: nextText,
            height: nextHeight,
          });
        }}
      />
    </ControllerRow>
  );
}

export default ContentControl;

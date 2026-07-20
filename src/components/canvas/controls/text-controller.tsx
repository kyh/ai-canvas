import type { IEditorBlockText } from "@/lib/schema";
import ColorControl from "./components/color-control";
import ControllerBox from "./components/controller-box";
import ContentControl from "./components/textControls/content-control";
import FontControl from "./components/textControls/font-picker";
import FontSizeControl from "./components/textControls/font-size-control";
import LetterSpacingControl from "./components/textControls/letter-spacing-control";
import LineHeightControl from "./components/textControls/line-height-control";
import TextAlignControl from "./components/textControls/text-align-control";
import TextDecorationControl from "./components/textControls/text-decoration-control";
import TextTransformControl from "./components/textControls/text-transform-control";
import { useEditorStore } from "@/components/canvas/use-editor";

interface TextControllerProps {
  blockId: string;
  block?: IEditorBlockText;
  className?: string;
}

function TextController({ blockId, block, className }: TextControllerProps) {
  const storeBlock = useEditorStore(
    (state) => state.blocksById[blockId] as IEditorBlockText | undefined,
  );
  const resolvedBlock = block ?? storeBlock;
  const updateBlockValues = useEditorStore((state) => state.updateBlockValues);

  if (!resolvedBlock) {
    return null;
  }

  return (
    <ControllerBox title="Text" className={className}>
      <ContentControl blockId={blockId} block={resolvedBlock} />
      <FontControl blockId={blockId} block={resolvedBlock} />
      <FontSizeControl blockId={blockId} block={resolvedBlock} />
      <LineHeightControl blockId={blockId} block={resolvedBlock} />
      <LetterSpacingControl blockId={blockId} block={resolvedBlock} />
      <ColorControl
        name="Color"
        disableGradient
        value={resolvedBlock.color}
        onChange={(color) => {
          updateBlockValues(blockId, {
            color,
          });
        }}
        className="justify-between"
      />
      <TextAlignControl blockId={blockId} block={resolvedBlock} />
      <TextTransformControl blockId={blockId} block={resolvedBlock} />
      <TextDecorationControl blockId={blockId} block={resolvedBlock} />
    </ControllerBox>
  );
}

export default TextController;

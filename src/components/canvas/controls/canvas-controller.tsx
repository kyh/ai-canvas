import { NumberInput } from "@/components/ui/input";
import ControllerBox from "./components/controller-box";
import ColorControl from "./components/color-control";
import ControllerRow from "./components/controller-row";
import { useEditorStore } from "@/components/canvas/use-editor";
import { useShallow } from "zustand/react/shallow";

function CanvasController({ className }: { className?: string }) {
  const [size, updateCanvasSize, setCanvasBackground, background] = useEditorStore(
    useShallow((state) => [
      state.canvas.size,
      state.updateCanvasSize,
      state.setCanvasBackground,
      state.canvas.background,
    ]),
  );

  return (
    <ControllerBox title="Canvas" className={className}>
      <ControllerRow label="Size" contentClassName="gap-3">
        <NumberInput
          leftChild={<span className="text-xs text-muted-foreground">W</span>}
          value={size.width}
          onChange={(e) => {
            if (!Number.isNaN(e)) {
              updateCanvasSize({ width: e });
            }
          }}
          min={2}
        />
        <NumberInput
          leftChild={<span className="text-xs text-muted-foreground">H</span>}
          value={size.height}
          onChange={(e) => {
            if (!Number.isNaN(e)) {
              updateCanvasSize({ height: e });
            }
          }}
          min={2}
        />
      </ControllerRow>
      <ColorControl
        name="Fill"
        value={background}
        onChange={(e) => {
          setCanvasBackground(e);
        }}
        className="justify-between"
      />
    </ControllerBox>
  );
}

export default CanvasController;

import { Plus as PlusIcon, Minus as MinusIcon } from "lucide-react";
import { ButtonGroup } from "@/components/ui/buttons-group";
import { Button } from "@/components/ui/button";
import CustomTooltip from "@/components/ui/tooltip";

function ZoomHandler({
  zoomIn,
  zoomOut,
  resetZoom,
}: {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}) {
  return (
    <div className="absolute bottom-4 right-4 bg-background">
      <ButtonGroup>
        <CustomTooltip content="Zoom Out">
          <Button variant="outline" size="icon" onClick={zoomOut}>
            <MinusIcon />
          </Button>
        </CustomTooltip>
        <CustomTooltip content="Zoom In">
          <Button variant="outline" size="icon" onClick={zoomIn}>
            <PlusIcon />
          </Button>
        </CustomTooltip>
        <CustomTooltip content="Reset Zoom">
          <Button variant="outline" onClick={resetZoom}>
            Reset
          </Button>
        </CustomTooltip>
      </ButtonGroup>
    </div>
  );
}

export default ZoomHandler;

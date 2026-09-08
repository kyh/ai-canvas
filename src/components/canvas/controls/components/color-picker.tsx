import ReactGPicker from "react-gcolor-picker";

const CustomColorPicker = ({
  value,
  onChange,
  disableGradient,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  disableGradient?: boolean;
}) => (
  <div className="colorPicker">
    <ReactGPicker
      colorBoardHeight={120}
      format="hex"
      gradient={disableGradient !== true}
      value={value || "#000000"}
      onChange={onChange}
      popupWidth={267}
      showAlpha
      solid
    />
  </div>
);

export default CustomColorPicker;

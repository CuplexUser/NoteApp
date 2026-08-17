const COLORS = ["#f5222d", "#fa8c16", "#fadb14", "#52c41a", "#1677ff", "#722ed1", "#8c8c8c"];

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

export default function ColorSwatchPicker({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {COLORS.map((color) => (
        <div
          key={color}
          onClick={() => onChange?.(color)}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: color,
            cursor: "pointer",
            border: value === color ? "2px solid #000" : "2px solid transparent",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
          }}
        />
      ))}
    </div>
  );
}

export { COLORS };

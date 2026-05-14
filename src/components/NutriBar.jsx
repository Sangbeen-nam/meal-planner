import { fmtN } from "../utils/nutrition";

export function NutriBar({ label, value, goal, unit, color }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div style={{ flex: 1, minWidth: 52 }}>
      <div style={{ fontSize: 11, color: "#666", marginBottom: 2, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color }}>{fmtN(value)}{unit}</div>
      <div style={{ height: 6, background: "#e8e8e8", borderRadius: 4, marginTop: 3, overflow: "hidden" }}>
        <div style={{ height: 6, width: `${pct}%`, background: color, borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 11, color: pct >= 80 ? color : "#999", marginTop: 2, fontWeight: 600 }}>{pct}%</div>
    </div>
  );
}

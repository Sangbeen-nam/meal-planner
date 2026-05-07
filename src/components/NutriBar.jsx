import { fmtN } from "../utils/nutrition";

export function NutriBar({ label, value, goal, unit, color }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div style={{ flex: 1, minWidth: 52 }}>
      <div style={{ fontSize: 10, color: "#aaa", marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color }}>{fmtN(value)}{unit}</div>
      <div style={{ height: 5, background: "#f0f0f0", borderRadius: 4, marginTop: 3, overflow: "hidden" }}>
        <div style={{ height: 5, width: `${pct}%`, background: color, borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 9, color: pct >= 80 ? color : "#ccc", marginTop: 2 }}>{pct}%</div>
    </div>
  );
}

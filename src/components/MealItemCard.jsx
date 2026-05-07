import { diffColor } from "../data/constants";

export function MealItemCard({ emoji, label, item, color, onRecipe, onReplace }) {
  if (!item) return null;
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "12px 14px", marginBottom: 8, border: `1.5px solid ${color}22`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 2 }}>{emoji} {label}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#222", marginBottom: 3 }}>
            {item.name}{item.isProcessed && <span style={{ fontSize: 11, marginLeft: 5, background: "#fef9c3", color: "#92400e", border: "1px solid #fde68a", borderRadius: 6, padding: "1px 5px", fontWeight: 600, verticalAlign: "middle" }}>🏭 가공</span>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#bbb" }}>⏱ {item.time}분</span>
            <span style={{ fontSize: 11, color: diffColor(item.diff) }}>● {item.diff}</span>
            <span style={{ fontSize: 11, color: "#bbb" }}>🔥 {item.cal}kcal</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0, marginLeft: 10 }}>
          <button onClick={onReplace} title="이 메뉴만 교체" style={{ background: "#f3f4f6", color: "#888", border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 9px", fontSize: 13, cursor: "pointer" }}>🔄</button>
          <button onClick={onRecipe} style={{ background: color, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>조리법</button>
        </div>
      </div>
    </div>
  );
}

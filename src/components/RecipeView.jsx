import { AGE_ORDER, AGE_LABELS, AGE_COLORS, diffColor } from "../data/constants";
import { fmtN } from "../utils/nutrition";

export function RecipeView({ item, onBack }) {
  if (!item) return null;
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 14, fontFamily: "inherit" }}>← 식단표로 돌아가기</button>

      <div style={{ background: "#fff", borderRadius: 20, padding: 16, boxShadow: "0 4px 24px rgba(255,107,107,0.1)", border: "1px solid #ffe0e0", marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#222", marginBottom: 6 }}>{item.name}</div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: "#aaa" }}>⏱ {item.time ?? "-"}분</span>
          <span style={{ fontSize: 11, color: "#aaa" }}>🔥 {item.cal ?? "-"}kcal</span>
          <span style={{ fontSize: 11, color: diffColor(item.diff) }}>● {item.diff ?? "-"}</span>
          <span style={{ fontSize: 11, color: "#ff8e53", fontWeight: 600 }}>👤 1인분</span>
          {item.safeFor && (() => {
            const idx = AGE_ORDER.indexOf(item.safeFor);
            if (idx < 0) return null;
            return <span style={{ fontSize: 11, background: AGE_COLORS[idx] + "44", color: "#555", border: `1px solid ${AGE_COLORS[idx]}`, borderRadius: 20, padding: "1px 8px", fontWeight: 600 }}>✅ {AGE_LABELS[idx]}부터 OK</span>;
          })()}
        </div>

        {item.serving && (
          <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", borderRadius: 12, padding: "11px 13px", marginBottom: 13, border: "1px solid #ffd0b0" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#e55", marginBottom: 7 }}>⚖️ 1인분 재료 정량</div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.9 }}>
              {(item.serving?.split(", ") ?? []).map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 1 }}>
                  <span style={{ color: "#ff8e53", fontSize: 10, marginTop: 4, flexShrink: 0 }}>●</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "#bbb", marginTop: 6 }}>💡 아이 나이에 따라 70~80% 양으로 조절해주세요</div>
          </div>
        )}

        <div style={{ background: "#f8f8ff", borderRadius: 12, padding: "10px 12px", marginBottom: 13 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 7 }}>🧬 1인분 영양 정보</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {[["단백질", item.nutrition?.protein, "g", "#6366f1"], ["칼슘", item.nutrition?.calcium, "mg", "#22c55e"], ["철분", item.nutrition?.iron, "mg", "#f59e0b"], ["비타민C", item.nutrition?.vitC, "mg", "#ef4444"], ["식이섬유", item.nutrition?.fiber, "g", "#8b5cf6"]].map(([n, v, u, c]) => (
              <div key={n} style={{ background: "#fff", border: `1px solid ${c}33`, borderRadius: 8, padding: "4px 9px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#bbb" }}>{n}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{fmtN(v)}{u}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e55", marginBottom: 7 }}>🥕 필요한 재료</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(item.ingredients ?? []).map(ing => (
              <span key={ing} style={{ background: "#fff8f0", border: "1px solid #ffd0b0", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#d4601a" }}>{ing}</span>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: "#e55", marginBottom: 9 }}>👩‍🍳 상세 조리 순서</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {(item.steps ?? []).map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 12px", borderRadius: 12, background: i % 2 === 0 ? "#fff8f0" : "#f0f8ff" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#ff6b6b,#ff8e53)", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {item.isProcessed && (
        <div style={{ background: "#fefce8", border: "1.5px solid #fde047", borderRadius: 14, padding: "11px 14px", marginBottom: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
          <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.7 }}>가공식품이 포함된 메뉴예요. 나트륨이 높을 수 있으니 <strong>주 1~2회 적당히</strong> 활용하세요.</div>
        </div>
      )}
      <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", border: "1px solid #ffe0e0", borderRadius: 14, padding: "11px 14px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#e55", marginBottom: 4 }}>💡 엄마 팁</div>
        <div style={{ fontSize: 12, color: "#888", lineHeight: 1.8 }}>재료를 잘게 다지거나 좋아하는 소스를 곁들이면 편식하는 아이도 잘 먹어요. 처음 접하는 재료는 소량부터 시도해보세요 🌟<br /><span style={{ color: "#f59e0b", fontWeight: 600 }}>아이 연령에 따라 1인분의 70~80% 양으로 조절하는 것을 권장해요.</span></div>
      </div>
    </div>
  );
}

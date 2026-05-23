import { AGE_ORDER, AGE_LABELS, AGE_COLORS, diffColor } from "../data/constants";
import { fmtN } from "../utils/nutrition";
import { getCoupangLink } from "../data/coupangLinks";

export function RecipeView({ item, onBack }) {
  if (!item) return null;
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 14, fontFamily: "inherit" }}>← 식단표로 돌아가기</button>

      <div style={{ background: "#fff", borderRadius: 20, padding: 16, boxShadow: "0 4px 24px rgba(255,107,107,0.1)", border: "1px solid #ffe0e0", marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#222", marginBottom: 8 }}>{item.name}</div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: "#666" }}>⏱ {item.time ?? "-"}분</span>
          <span style={{ fontSize: 13, color: "#666" }}>🔥 {item.cal ?? "-"}kcal</span>
          <span style={{ fontSize: 13, color: diffColor(item.diff), fontWeight: 600 }}>● {item.diff ?? "-"}</span>
          <span style={{ fontSize: 13, color: "#ff8e53", fontWeight: 700 }}>👤 1인분</span>
          {item.safeFor && (() => {
            const idx = AGE_ORDER.indexOf(item.safeFor);
            if (idx < 0) return null;
            return <span style={{ fontSize: 12, background: AGE_COLORS[idx] + "44", color: "#444", border: `1px solid ${AGE_COLORS[idx]}`, borderRadius: 20, padding: "2px 10px", fontWeight: 700 }}>✅ {AGE_LABELS[idx]}부터 OK</span>;
          })()}
        </div>

        {item.serving && (
          <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", borderRadius: 12, padding: "13px 15px", marginBottom: 14, border: "1px solid #ffd0b0" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#d94f00", marginBottom: 9 }}>⚖️ 1인분 재료 정량</div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 2.0 }}>
              {(item.serving?.split(", ") ?? []).map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 2 }}>
                  <span style={{ color: "#ff8e53", fontSize: 12, marginTop: 4, flexShrink: 0 }}>●</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 8, fontWeight: 500 }}>💡 아이 나이에 따라 70~80% 양으로 조절해주세요</div>
          </div>
        )}

        <div style={{ background: "#f3f4ff", borderRadius: 12, padding: "13px 14px", marginBottom: 14, border: "1px solid #d4d7ff" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#4b51cc", marginBottom: 10 }}>🧬 1인분 영양 정보</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {[["단백질", item.nutrition?.protein, "g", "#6366f1"], ["칼슘", item.nutrition?.calcium, "mg", "#16a34a"], ["철분", item.nutrition?.iron, "mg", "#d97706"], ["비타민C", item.nutrition?.vitC, "mg", "#dc2626"], ["식이섬유", item.nutrition?.fiber, "g", "#7c3aed"]].map(([n, v, u, c]) => (
              <div key={n} style={{ background: "#fff", border: `1.5px solid ${c}55`, borderRadius: 10, padding: "6px 11px", textAlign: "center", minWidth: 56 }}>
                <div style={{ fontSize: 11, color: "#777", marginBottom: 2, fontWeight: 600 }}>{n}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{fmtN(v)}{u}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 6, textAlign: "right" }}>출처: 식품안전처 DB</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#d94f00", marginBottom: 9 }}>🥕 필요한 재료</div>
          <div style={{ background: "#fff8f0", borderRadius: 12, border: "1px solid #ffc49a", overflow: "hidden" }}>
            {(item.ingredients ?? []).map((ing, i) => (
              <div key={ing} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderTop: i > 0 ? "1px solid #ffe5cc" : "none", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ color: "#ff8e53", fontSize: 11, flexShrink: 0 }}>●</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#c05000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ing}</span>
                </div>
                <a
                  href={getCoupangLink(ing)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "6px 13px", borderRadius: 20, background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  🛒 구매하기
                </a>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#bbb", marginTop: 5, textAlign: "right" }}>
            쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다
          </div>
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: "#d94f00", marginBottom: 10 }}>👩‍🍳 상세 조리 순서</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(item.steps ?? []).map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 13px", borderRadius: 12, background: i % 2 === 0 ? "#fff8f0" : "#f0f8ff" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#ff6b6b,#ff8e53)", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</div>
              <div style={{ fontSize: 14, color: "#333", lineHeight: 1.75 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {item.isProcessed && (
        <div style={{ background: "#fefce8", border: "1.5px solid #fde047", borderRadius: 14, padding: "12px 15px", marginBottom: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <div style={{ fontSize: 13, color: "#92400e", lineHeight: 1.75, fontWeight: 500 }}>가공식품이 포함된 메뉴예요. 나트륨이 높을 수 있으니 <strong>주 1~2회 적당히</strong> 활용하세요.</div>
        </div>
      )}
      <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", border: "1px solid #ffe0e0", borderRadius: 14, padding: "13px 15px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#d94f00", marginBottom: 6 }}>💡 엄마 팁</div>
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.85 }}>재료를 잘게 다지거나 좋아하는 소스를 곁들이면 편식하는 아이도 잘 먹어요. 처음 접하는 재료는 소량부터 시도해보세요 🌟<br /><span style={{ color: "#c07a00", fontWeight: 700 }}>아이 연령에 따라 1인분의 70~80% 양으로 조절하는 것을 권장해요.</span></div>
      </div>
    </div>
  );
}

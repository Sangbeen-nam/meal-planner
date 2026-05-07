import { DAYS, MEALS } from "../data/constants";

export function ShoppingList({ meal, weekPlan, showWeeklyShop, setShowWeeklyShop, checkedItems, toggleCheck, onClear }) {
  const mealIngredients = [...new Set([meal.rice, meal.soup, ...meal.sides].flatMap(i => i?.ingredients || []))];

  return (
    <>
      <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", border: "1px solid #ffd8d0", borderRadius: 16, padding: "12px 14px", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e55" }}>🛒 장보기 목록</div>
          <div style={{ fontSize: 10, color: "#bbb" }}>클릭 시 쿠팡 로켓프레시</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {mealIngredients.map(ing => (
            <a key={ing}
              href={`https://www.coupang.com/np/search?q=${encodeURIComponent(ing + " 로켓프레시")}&channel=user&isPriorityMobileWeb=true`}
              target="_blank" rel="noreferrer"
              onClick={e => { e.preventDefault(); toggleCheck(ing); window.open(e.currentTarget.href, "_blank"); }}
              style={{ background: checkedItems.includes(ing) ? "#f0fdf4" : "#fff", border: `1px solid ${checkedItems.includes(ing) ? "#86efac" : "#ffc0a0"}`, borderRadius: 8, padding: "4px 9px", fontSize: 12, color: checkedItems.includes(ing) ? "#16a34a" : "#e55", textDecoration: checkedItems.includes(ing) ? "line-through" : "none", display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
              {checkedItems.includes(ing) ? "✅" : ""}{ing}<span style={{ fontSize: 10, color: "#bbb" }}>↗</span>
            </a>
          ))}
        </div>
        {checkedItems.length > 0 && (
          <button onClick={onClear} style={{ marginTop: 7, fontSize: 10, color: "#bbb", background: "none", border: "none", cursor: "pointer", padding: 0 }}>✕ 체크 전체 해제</button>
        )}
        <div style={{ marginTop: 8, fontSize: 10, color: "#ddd", borderTop: "1px dashed #fde8d8", paddingTop: 7 }}>※ 쿠팡 파트너스 링크는 추후 적용 예정</div>
      </div>

      <button onClick={() => setShowWeeklyShop(v => !v)} style={{ width: "100%", padding: "11px", borderRadius: 14, fontSize: 13, fontWeight: 700, background: showWeeklyShop ? "#fff7ed" : "#fff", color: "#f97316", border: "2px solid #fed7aa", cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>
        📋 {showWeeklyShop ? "주간 장보기 목록 닫기" : "주간 전체 장보기 목록 보기"}
      </button>

      {showWeeklyShop && (() => {
        const allIngs = [...new Set(DAYS.flatMap(d => MEALS.flatMap(m => {
          const ml = weekPlan[d][m];
          return [ml.rice, ml.soup, ...ml.sides].flatMap(i => i?.ingredients || []);
        })))];
        return (
          <div style={{ background: "linear-gradient(135deg,#fffbeb,#fff7ed)", border: "1px solid #fed7aa", borderRadius: 16, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#c2410c", marginBottom: 8 }}>📋 이번 주 전체 재료 ({allIngs.length}가지)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {allIngs.map(ing => (
                <a key={ing}
                  href={`https://www.coupang.com/np/search?q=${encodeURIComponent(ing + " 로켓프레시")}&channel=user&isPriorityMobileWeb=true`}
                  target="_blank" rel="noreferrer"
                  onClick={e => { e.preventDefault(); toggleCheck(ing); window.open(e.currentTarget.href, "_blank"); }}
                  style={{ background: checkedItems.includes(ing) ? "#f0fdf4" : "#fff", border: `1px solid ${checkedItems.includes(ing) ? "#86efac" : "#fed7aa"}`, borderRadius: 8, padding: "4px 9px", fontSize: 12, color: checkedItems.includes(ing) ? "#16a34a" : "#c2410c", textDecoration: checkedItems.includes(ing) ? "line-through" : "none", display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
                  {checkedItems.includes(ing) ? "✅" : ""}{ing}<span style={{ fontSize: 10, color: "#bbb" }}>↗</span>
                </a>
              ))}
            </div>
            {checkedItems.length > 0 && (
              <button onClick={onClear} style={{ marginTop: 7, fontSize: 10, color: "#bbb", background: "none", border: "none", cursor: "pointer", padding: 0 }}>✕ 체크 전체 해제</button>
            )}
          </div>
        );
      })()}
    </>
  );
}

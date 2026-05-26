import { useState } from "react";
import { DAYS } from "../data/constants";
import { getCoupangLink } from "../data/coupangLinks";
import { gaEvent } from "../utils/analytics";

export function ShoppingList({ meal, weekPlan, showWeeklyShop, setShowWeeklyShop, checkedItems, toggleCheck, onClear }) {
  const [weeklyChecked, setWeeklyChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mp_weekly_checked") || "[]"); }
    catch { return []; }
  });

  const toggleWeeklyCheck = (ing) => {
    setWeeklyChecked(prev => {
      const next = prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing];
      localStorage.setItem("mp_weekly_checked", JSON.stringify(next));
      return next;
    });
  };

  const clearWeeklyChecked = () => {
    setWeeklyChecked([]);
    localStorage.removeItem("mp_weekly_checked");
  };


  const mealIngredients = [...new Set(
    [meal.rice, meal.soup, ...(meal.sides || [])].flatMap(i => i?.ingredients || [])
  )];

  // 선택된 끼니만 존재하는 plan 구조에 안전하게 접근
  const allWeeklyIngs = weekPlan ? [...new Set(
    DAYS.flatMap(d => {
      if (!weekPlan[d]) return [];
      return Object.values(weekPlan[d]).flatMap(ml => {
        if (!ml) return [];
        return [ml.rice, ml.soup, ...(ml.sides || [])].flatMap(i => i?.ingredients || []);
      });
    })
  )] : [];

  return (
    <>
      {/* 끼니별 장보기 목록 */}
      <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", border: "1px solid #ffd8d0", borderRadius: 16, padding: "12px 14px", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e55" }}>🛒 장보기 목록</div>
          <div style={{ fontSize: 10, color: "#bbb" }}>클릭 시 쿠팡 로켓프레시 ↗</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {mealIngredients.map(ing => {
            const link = getCoupangLink(ing);
            const checked = checkedItems.includes(ing);
            const baseStyle = { borderRadius: 8, padding: "4px 9px", fontSize: 12, display: "flex", alignItems: "center", gap: 3 };
            return link ? (
              <a key={ing}
                href={link}
                target="_blank" rel="noreferrer"
                onClick={e => { e.preventDefault(); toggleCheck(ing); gaEvent('coupang_click', { ingredient: ing, list: 'daily' }); if (typeof window !== 'undefined' && window.gtag) { window.gtag('event', 'coupang_link_clicked', { ingredient: ing }); } window.open(link, "_blank"); }}
                style={{ ...baseStyle, background: checked ? "#f0fdf4" : "#fff", border: `1px solid ${checked ? "#86efac" : "#ffc0a0"}`, color: checked ? "#16a34a" : "#e55", textDecoration: checked ? "line-through" : "none", cursor: "pointer" }}>
                {checked ? "✅" : ""}{ing}<span style={{ fontSize: 10, color: "#bbb" }}>↗</span>
              </a>
            ) : (
              <span key={ing}
                style={{ ...baseStyle, background: "#f9f9f9", border: "1px solid #e0e0e0", color: "#999", cursor: "default", opacity: 0.5 }}>
                {ing}<span style={{ fontSize: 9, color: "#bbb" }}>준비중</span>
              </span>
            );
          })}
        </div>
        {checkedItems.length > 0 && (
          <button onClick={onClear} style={{ marginTop: 7, fontSize: 10, color: "#bbb", background: "none", border: "none", cursor: "pointer", padding: 0 }}>✕ 체크 전체 해제</button>
        )}
      </div>

      {/* 주간 전체 장보기 목록 토글 버튼 */}
      <button
        onClick={() => setShowWeeklyShop(v => !v)}
        style={{ width: "100%", padding: "12px", borderRadius: 14, fontSize: 13, fontWeight: 700, background: "#fff", color: "#f97316", border: "2px solid #fed7aa", cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>
        📋 {showWeeklyShop ? "주간 장보기 목록 닫기 ▲" : "이번 주 전체 장보기 목록 ▼"}
      </button>

      {/* 주간 전체 장보기 패널 */}
      {showWeeklyShop && (
        <div style={{ background: "linear-gradient(135deg,#fffbeb,#fff7ed)", border: "1px solid #fed7aa", borderRadius: 16, padding: "14px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#c2410c" }}>
              📋 이번 주 전체 재료 ({allWeeklyIngs.length}가지)
            </div>
            {weeklyChecked.length > 0 && (
              <button onClick={clearWeeklyChecked} style={{ fontSize: 10, color: "#bbb", background: "none", border: "none", cursor: "pointer", padding: 0 }}>✕ 전체 해제</button>
            )}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {allWeeklyIngs.map(ing => (
              <a key={ing}
                href={getCoupangLink(ing)}
                target="_blank" rel="noreferrer"
                onClick={e => { e.preventDefault(); toggleWeeklyCheck(ing); gaEvent('coupang_click', { ingredient: ing, list: 'weekly' }); if (typeof window !== 'undefined' && window.gtag) { window.gtag('event', 'coupang_link_clicked', { ingredient: ing }); } window.open(e.currentTarget.href, "_blank"); }}
                style={{ background: weeklyChecked.includes(ing) ? "#f0fdf4" : "#fff", border: `1px solid ${weeklyChecked.includes(ing) ? "#86efac" : "#fed7aa"}`, borderRadius: 8, padding: "5px 10px", fontSize: 12, color: weeklyChecked.includes(ing) ? "#16a34a" : "#c2410c", textDecoration: weeklyChecked.includes(ing) ? "line-through" : "none", display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
                {weeklyChecked.includes(ing) ? "✅" : ""}{ing}<span style={{ fontSize: 10, color: "#bbb" }}>↗</span>
              </a>
            ))}
          </div>

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed #fde8c0", fontSize: 10, color: "#d4a06a", lineHeight: 1.6 }}>
            ※ 위 링크는 쿠팡파트너스 활동의 일환으로, 이를 통해 일정액의 수수료를 제공받습니다.
          </div>
        </div>
      )}
    </>
  );
}

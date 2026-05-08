import { useState } from "react";
import { DAYS, MEALS, FOOD_PREFS, INGREDIENT_GROUPS, AGE_GROUPS, ALLERGY_OPTIONS } from "./data/constants";
import { calcMealGoal, fmtN } from "./utils/nutrition";
import { getMinAgeIndex, generateWeekPlan, pickOne, pickTwoSides, handleReplaceItem } from "./utils/mealPicker";
import { RICE_DB } from "./data/riceDB";
import { SOUP_DB } from "./data/soupDB";
import { NutriBar } from "./components/NutriBar";
import { MealItemCard } from "./components/MealItemCard";
import { RecipeView } from "./components/RecipeView";
import { ShoppingList } from "./components/ShoppingList";
import PrivacyPolicy from "./components/PrivacyPolicy.jsx";

const ONBOARDING_SLIDES = [
  {
    emoji: "👶",
    title: "연령대 선택",
    desc: "아이 나이를 선택하면\n연령에 맞는 안전한 식단만 나와요",
  },
  {
    emoji: "🥦",
    title: "냉장고 재료 활용",
    desc: "있는 재료를 선택하면\n그 재료가 들어간 메뉴를\n우선으로 추천해요",
  },
  {
    emoji: "🍱",
    title: "식단 자동 생성",
    desc: "요일·끼니별로 식단을 확인하고\n마음에 안 들면 🔄 버튼으로\n바로 바꿀 수 있어요",
  },
  {
    emoji: "🛒",
    title: "장보기 목록",
    desc: "필요한 재료를 한눈에 확인하고\n클릭 한 번으로 바로 구매할 수 있어요",
  },
];

export default function MealPlanner() {
  const [step, setStep] = useState(() => {
    try {
      const plan = JSON.parse(localStorage.getItem("mp_weekplan") || "null");
      return plan ? "planner" : "pref";
    } catch { return "pref"; }
  });
  const [selectedAges, setAges] = useState(() => { try { return JSON.parse(localStorage.getItem("mp_ages") || "[]"); } catch { return []; } });
  const [selectedFoods, setFoods] = useState(() => { try { return JSON.parse(localStorage.getItem("mp_foods") || "[]"); } catch { return []; } });
  const [selectedIngreds, setIngreds] = useState(() => { try { return JSON.parse(localStorage.getItem("mp_ingreds") || "[]"); } catch { return []; } });
  const [selectedAllergies, setAllergies] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [weekPlan, setWeekPlan] = useState(() => { try { return JSON.parse(localStorage.getItem("mp_weekplan") || "null"); } catch { return null; } });
  const [activeDay, setActiveDay] = useState("월");
  const [activeMeal, setActiveMeal] = useState("아침");
  const [viewRecipe, setViewRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWeeklyShop, setShowWeeklyShop] = useState(false);
  const [checkedItems, setCheckedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mp_checked") || "[]"); } catch { return []; }
  });
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("mp_onboarding_done"));
  const [onboardingSlide, setOnboardingSlide] = useState(0);

  const saveAll = (ages, foods, ingreds, plan, checked) => {
    localStorage.setItem("mp_ages",     JSON.stringify(ages));
    localStorage.setItem("mp_foods",    JSON.stringify(foods));
    localStorage.setItem("mp_ingreds",  JSON.stringify(ingreds));
    if (plan) localStorage.setItem("mp_weekplan", JSON.stringify(plan));
    localStorage.setItem("mp_checked",  JSON.stringify(checked));
  };

  const toggleArr   = (setArr, val, key) => setArr(prev => {
    const next = prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val];
    if (key) localStorage.setItem(key, JSON.stringify(next));
    return next;
  });
  const toggleCheck = ing => setCheckedItems(prev => {
    const next = prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing];
    localStorage.setItem("mp_checked", JSON.stringify(next));
    return next;
  });

  const mealGoal = calcMealGoal(selectedAges);
  const allIngredNames = INGREDIENT_GROUPS.flatMap(g => g.items.map(x => x.n));
  const allergenIngredients = ALLERGY_OPTIONS.filter(a => selectedAllergies.includes(a.id)).flatMap(a => a.ingredients);

  const handleAddCustom = () => {
    const t = customInput.trim();
    if (!t) return;
    if (!selectedIngreds.includes(t)) {
      setIngreds(prev => {
        const next = [...prev, t];
        localStorage.setItem("mp_ingreds", JSON.stringify(next));
        return next;
      });
    }
    setCustomInput("");
  };

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const plan = generateWeekPlan(selectedFoods, selectedIngreds, selectedAges, allergenIngredients);
      setWeekPlan(plan);
      localStorage.setItem("mp_weekplan", JSON.stringify(plan));
      setStep("planner");
      setLoading(false);
    }, 900);
  };

  const handleRegenMeal = () => {
    const minAgeIndex = getMinAgeIndex(selectedAges);
    const rice  = pickOne(RICE_DB, selectedFoods, selectedIngreds, [], minAgeIndex, allergenIngredients);
    const soup  = pickOne(SOUP_DB, selectedFoods, selectedIngreds, [], minAgeIndex, allergenIngredients);
    const sides = pickTwoSides(selectedFoods, selectedIngreds, [], minAgeIndex, allergenIngredients);
    setWeekPlan(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[activeDay][activeMeal] = { rice, soup, sides };
      localStorage.setItem("mp_weekplan", JSON.stringify(next));
      return next;
    });
  };

  const onReplaceItem = (type) => {
    const minAgeIndex = getMinAgeIndex(selectedAges);
    setWeekPlan(prev => {
      const next = handleReplaceItem(prev, activeDay, activeMeal, type, selectedFoods, selectedIngreds, minAgeIndex, allergenIngredients);
      localStorage.setItem("mp_weekplan", JSON.stringify(next));
      return next;
    });
  };

  const finishOnboarding = () => {
    localStorage.setItem("mp_onboarding_done", "1");
    setShowOnboarding(false);
    setOnboardingSlide(0);
  };

  const openHelp = () => {
    setOnboardingSlide(0);
    setShowOnboarding(true);
  };

  const ms = m => m === "아침" ? { bg: "#fffbeb", badge: "#fde68a", text: "#92400e", icon: "🌅" }
    : m === "점심" ? { bg: "#f0fdf4", badge: "#bbf7d0", text: "#14532d", icon: "☀️" }
    : { bg: "#eff6ff", badge: "#bfdbfe", text: "#1e3a8a", icon: "🌙" };

  const renderOnboarding = () => {
    const slide = ONBOARDING_SLIDES[onboardingSlide];
    const isLast  = onboardingSlide === ONBOARDING_SLIDES.length - 1;
    const isFirst = onboardingSlide === 0;
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#fff", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 28px", fontFamily: "Georgia, serif" }}>
        <button
          onClick={finishOnboarding}
          style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: "#ccc", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
        >
          건너뛰기
        </button>

        <div style={{ fontSize: 64, marginBottom: 28, lineHeight: 1 }}>{slide.emoji}</div>

        <div style={{ fontSize: 18, fontWeight: 700, color: "#ff6b6b", marginBottom: 16, textAlign: "center" }}>
          {slide.title}
        </div>

        <div style={{ fontSize: 13, color: "#999", textAlign: "center", lineHeight: 2.1, whiteSpace: "pre-line" }}>
          {slide.desc}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 40, marginBottom: 28 }}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === onboardingSlide ? "#ff6b6b" : "#e0e0e0", transition: "background 0.2s" }} />
          ))}
        </div>

        {isLast ? (
          <button
            onClick={finishOnboarding}
            style={{ width: "100%", maxWidth: 280, padding: "16px", borderRadius: 20, background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(255,107,107,0.35)" }}
          >
            시작하기!
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 280 }}>
            {!isFirst && (
              <button
                onClick={() => setOnboardingSlide(prev => prev - 1)}
                style={{ flex: 1, padding: "13px", borderRadius: 16, background: "#f5f5f5", color: "#bbb", border: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
              >
                이전
              </button>
            )}
            <button
              onClick={() => setOnboardingSlide(prev => prev + 1)}
              style={{ flex: 1, padding: "13px", borderRadius: 16, background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              다음
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(150deg,#fff8f2 0%,#ffecd8 40%,#f8f0ff 100%)", fontFamily: "Georgia, serif" }}>
      {showOnboarding && renderOnboarding()}

      <div style={{ background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", padding: "14px 16px 10px", boxShadow: "0 4px 20px rgba(255,107,107,0.28)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🍱</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>우리 아이 주간 식단표</div>
            <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 11 }}>밥 · 국 · 반찬 2가지 균형 식단</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button onClick={openHelp} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "5px 11px", fontSize: 11, cursor: "pointer" }}>❓</button>
            {step !== "pref" && (
              <button onClick={() => setStep("pref")} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "5px 11px", fontSize: 11, cursor: "pointer" }}>⚙️ 설정</button>
            )}
          </div>
        </div>
      </div>

      {(step === "planner" || step === "recipe") && (
        <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button
            onClick={() => setStep("pref")}
            style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, padding: 0 }}
          >
            ← 설정으로
          </button>
          <div style={{ fontSize: 12, color: "#bbb" }}>
            {step === "planner" ? `${activeDay}요일 ${activeMeal}` : "조리법"}
          </div>
        </div>
      )}

      <div style={{ padding: "14px 12px 60px" }}>
        {step === "pref" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.08)", border: "1px solid #ffe4e0" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e55", marginBottom: 2 }}>👶 자녀 연령대 선택</div>
              <div style={{ fontSize: 11, color: "#bbb", marginBottom: 12 }}>여러 명이면 모두 선택 · 연령에 맞지 않는 매운·짠·딱딱한 음식은 자동 제외돼요</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {AGE_GROUPS.map(g => {
                  const sel = selectedAges.includes(g.id);
                  return (
                    <button key={g.id} onClick={() => toggleArr(setAges, g.id, "mp_ages")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: sel ? `${g.color}28` : "#fafafa", border: sel ? `2px solid ${g.color}` : "2px solid #f0f0f0", transition: "all 0.15s" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: sel ? g.color : "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{g.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: sel ? "#444" : "#888" }}>{g.label} <span style={{ fontSize: 11, fontWeight: 400, color: "#bbb" }}>({g.range})</span></div>
                        <div style={{ fontSize: 10, color: "#ccc", marginTop: 1 }}>단백질 {g.daily.protein}g · 칼슘 {g.daily.calcium}mg · 철분 {g.daily.iron}mg</div>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: sel ? g.color : "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {sel && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedAges.length > 0 && (
                <div style={{ marginTop: 12, background: "linear-gradient(135deg,#fff7ed,#fdf4ff)", borderRadius: 12, padding: "10px 13px", border: "1px solid #fed7aa" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#c2410c", marginBottom: 6 }}>📊 한 끼 평균 영양 목표 ({selectedAges.length}명 기준)</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[["단백질", mealGoal.protein, "g", "#6366f1"], ["칼슘", mealGoal.calcium, "mg", "#22c55e"], ["철분", mealGoal.iron, "mg", "#f59e0b"], ["비타민C", mealGoal.vitC, "mg", "#ef4444"], ["식이섬유", mealGoal.fiber, "g", "#8b5cf6"]].map(([n, v, u, c]) => (
                      <div key={n} style={{ background: "#fff", border: `1px solid ${c}33`, borderRadius: 8, padding: "4px 9px", textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: "#bbb" }}>{n}/끼</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{fmtN(v)}{u}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 14px rgba(239,68,68,0.08)", border: "1.5px solid #fecaca" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", marginBottom: 2 }}>⚠️ 알레르기 재료 선택</div>
              <div style={{ fontSize: 11, color: "#bbb", marginBottom: 10 }}>선택한 재료가 포함된 메뉴는 식단에서 자동 제외돼요</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {ALLERGY_OPTIONS.map(a => {
                  const sel = selectedAllergies.includes(a.id);
                  return <button key={a.id} onClick={() => toggleArr(setAllergies, a.id)} style={{ padding: "7px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: sel ? "#fee2e2" : "#fff8f0", color: sel ? "#dc2626" : "#999", border: sel ? "1.5px solid #dc2626" : "1px solid #eee", fontWeight: sel ? 700 : 400 }}>{a.emoji} {a.label}</button>;
                })}
              </div>
              {selectedAllergies.length > 0 && (
                <div style={{ marginTop: 10, background: "#fef2f2", borderRadius: 10, padding: "8px 12px", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13 }}>🚫</span>
                  <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>제외 재료: {allergenIngredients.join(", ")}</div>
                </div>
              )}
            </div>

            <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.07)", border: "1px solid #ffe4e0" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e55", marginBottom: 2 }}>🍽️ 선호 음식 종류</div>
              <div style={{ fontSize: 11, color: "#ccc", marginBottom: 10 }}>여러 개 선택 가능 · 없으면 전체 반영</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {FOOD_PREFS.map(f => (
                  <button key={f.id} onClick={() => toggleArr(setFoods, f.id, "mp_foods")} style={{ padding: "7px 11px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: selectedFoods.includes(f.id) ? "#ff6b6b" : "#fff8f0", color: selectedFoods.includes(f.id) ? "#fff" : "#999", border: selectedFoods.includes(f.id) ? "1px solid #ff6b6b" : "1px solid #eee", fontWeight: selectedFoods.includes(f.id) ? 700 : 400 }}>{f.e} {f.id}</button>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.07)", border: "1px solid #ffe4e0" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e55", marginBottom: 2 }}>🥦 냉장고 재료 선택</div>
              <div style={{ fontSize: 11, color: "#ccc", marginBottom: 12 }}>카테고리별로 있는 재료를 골라주세요</div>
              {INGREDIENT_GROUPS.map(grp => (
                <div key={grp.group} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", marginBottom: 7 }}>{grp.group}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {grp.items.map(item => (
                      <button key={item.n} onClick={() => toggleArr(setIngreds, item.n, "mp_ingreds")} style={{ padding: "6px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: selectedIngreds.includes(item.n) ? "#ff8e53" : "#fff8f0", color: selectedIngreds.includes(item.n) ? "#fff" : "#999", border: selectedIngreds.includes(item.n) ? "1px solid #ff8e53" : "1px solid #eee", fontWeight: selectedIngreds.includes(item.n) ? 700 : 400 }}>{item.e} {item.n}</button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: 12, borderTop: "1px dashed #f0e0d0" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", marginBottom: 7 }}>✏️ 직접 입력</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={customInput} onChange={e => setCustomInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddCustom()} placeholder="재료명 입력 후 추가" style={{ flex: 1, padding: "9px 12px", borderRadius: 12, border: "1.5px solid #ffd0b0", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff8f0", color: "#444" }} />
                  <button onClick={handleAddCustom} style={{ padding: "9px 14px", borderRadius: 12, background: "#ff8e53", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>추가</button>
                </div>
                {selectedIngreds.filter(i => !allIngredNames.includes(i)).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {selectedIngreds.filter(i => !allIngredNames.includes(i)).map(i => (
                      <span key={i} style={{ background: "#fff0e8", border: "1px solid #ff8e53", borderRadius: 20, padding: "4px 10px", fontSize: 12, color: "#ff8e53", display: "flex", alignItems: "center", gap: 4 }}>
                        {i}<button onClick={() => setIngreds(prev => { const next = prev.filter(v => v !== i); localStorage.setItem("mp_ingreds", JSON.stringify(next)); return next; })} style={{ background: "none", border: "none", color: "#ff8e53", cursor: "pointer", fontSize: 12, padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedIngreds.length > 0 && (
              <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", border: "1px solid #ffd8d0", borderRadius: 14, padding: "11px 14px", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#e55", marginBottom: 7 }}>✅ 선택된 재료 ({selectedIngreds.length}개)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {selectedIngreds.map(i => (
                    <span key={i} style={{ background: "#fff", border: "1px solid #ffc0a0", borderRadius: 8, padding: "3px 9px", fontSize: 11, color: "#e55", display: "flex", alignItems: "center", gap: 3 }}>
                      {i}<button onClick={() => setIngreds(prev => { const next = prev.filter(v => v !== i); localStorage.setItem("mp_ingreds", JSON.stringify(next)); return next; })} style={{ background: "none", border: "none", color: "#ffb0a0", cursor: "pointer", fontSize: 11, padding: 0 }}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleGenerate} disabled={loading} style={{ width: "100%", padding: "15px", borderRadius: 16, fontSize: 15, fontWeight: 700, background: loading ? "#ddd" : "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", cursor: loading ? "default" : "pointer", boxShadow: "0 4px 18px rgba(255,107,107,0.3)", fontFamily: "inherit" }}>
              {loading ? "🍳 맞춤 식단 생성 중..." : "✨ 이번 주 균형 식단 만들기"}
            </button>

            {selectedAllergies.length > 0 && (
              <div style={{ marginTop: 12, background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 14, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 3 }}>알레르기 주의사항</div>
                  <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.7 }}>심각한 알레르기가 있는 경우 반드시 전문의와 상담하세요.</div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "planner" && weekPlan && (() => {
          const meal = weekPlan[activeDay][activeMeal];
          const nutri = [meal.rice, meal.soup, ...meal.sides].filter(Boolean).reduce((acc, item) => ({
            protein: acc.protein + (item.nutrition?.protein || 0), calcium: acc.calcium + (item.nutrition?.calcium || 0),
            iron: acc.iron + (item.nutrition?.iron || 0), vitC: acc.vitC + (item.nutrition?.vitC || 0),
            fiber: acc.fiber + (item.nutrition?.fiber || 0), cal: acc.cal + (item.cal || 0),
          }), { protein: 0, calcium: 0, iron: 0, vitC: 0, fiber: 0, cal: 0 });
          const style = ms(activeMeal);
          const selGroups = AGE_GROUPS.filter(g => selectedAges.includes(g.id));
          return (
            <div>
              {selGroups.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {selGroups.map(g => <div key={g.id} style={{ background: `${g.color}28`, border: `1px solid ${g.color}`, borderRadius: 20, padding: "3px 9px", fontSize: 11, fontWeight: 700, color: "#555" }}>{g.emoji} {g.label}</div>)}
                  {selGroups.length > 1 && <div style={{ background: "#f3f4f6", borderRadius: 20, padding: "3px 9px", fontSize: 10, color: "#aaa" }}>평균 영양목표</div>}
                </div>
              )}
              <div style={{ display: "flex", gap: 5, marginBottom: 10, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                {DAYS.map(d => <button key={d} onClick={() => setActiveDay(d)} style={{ minWidth: 36, padding: "6px 8px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, background: activeDay === d ? "#ff6b6b" : "#fff", color: activeDay === d ? "#fff" : "#ccc", border: activeDay === d ? "1px solid #ff6b6b" : "1px solid #eee", boxShadow: activeDay === d ? "0 2px 8px rgba(255,107,107,0.28)" : "none" }}>{d}</button>)}
              </div>
              <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
                {MEALS.map(m => { const s = ms(m); return <button key={m} onClick={() => setActiveMeal(m)} style={{ flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: activeMeal === m ? s.badge : "#fff", color: activeMeal === m ? s.text : "#ccc", border: activeMeal === m ? `1.5px solid ${s.text}55` : "1px solid #eee" }}>{s.icon} {m}</button>; })}
              </div>
              <div style={{ background: style.bg, borderRadius: 16, padding: "11px 15px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${style.text}22` }}>
                <div>
                  <div style={{ fontSize: 10, color: "#aaa" }}>{activeDay}요일 {activeMeal} 총 열량</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: style.text }}>{nutri.cal} <span style={{ fontSize: 12, fontWeight: 400 }}>kcal</span></div>
                  <div style={{ fontSize: 10, color: "#bbb", marginTop: 1 }}>밥+국+반찬2가지 · 1인분 기준</div>
                </div>
                <span style={{ fontSize: 28 }}>{style.icon}</span>
              </div>
              <div style={{ background: "#fff", borderRadius: 16, padding: "12px 14px", marginBottom: 11, border: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 9 }}>🧬 한 끼 영양 충족률</div>
                <div style={{ display: "flex", gap: 7 }}>
                  <NutriBar label="단백질" value={nutri.protein} goal={mealGoal.protein} unit="g" color="#6366f1" />
                  <NutriBar label="칼슘" value={nutri.calcium} goal={mealGoal.calcium} unit="mg" color="#22c55e" />
                  <NutriBar label="철분" value={nutri.iron} goal={mealGoal.iron} unit="mg" color="#f59e0b" />
                  <NutriBar label="비타민C" value={nutri.vitC} goal={mealGoal.vitC} unit="mg" color="#ef4444" />
                  <NutriBar label="식이섬유" value={nutri.fiber} goal={mealGoal.fiber} unit="g" color="#8b5cf6" />
                </div>
              </div>
              <MealItemCard emoji="🍚" label="밥 / 덮밥" item={meal.rice} color="#f97316" onRecipe={() => { setViewRecipe(meal.rice); setStep("recipe"); }} onReplace={() => onReplaceItem("rice")} />
              <MealItemCard emoji="🍲" label="국 / 찌개" item={meal.soup} color="#3b82f6" onRecipe={() => { setViewRecipe(meal.soup); setStep("recipe"); }} onReplace={() => onReplaceItem("soup")} />
              {meal.sides.map((side, i) => (
                <MealItemCard key={i} emoji="🥗" label={`반찬 ${i + 1} (${side.nutriType})`} item={side} color={i === 0 ? "#8b5cf6" : "#22c55e"} onRecipe={() => { setViewRecipe(side); setStep("recipe"); }} onReplace={() => onReplaceItem(`side${i}`)} />
              ))}
              <ShoppingList meal={meal} weekPlan={weekPlan} showWeeklyShop={showWeeklyShop} setShowWeeklyShop={setShowWeeklyShop} checkedItems={checkedItems} toggleCheck={toggleCheck} onClear={() => setCheckedItems([])} />
              <button onClick={handleRegenMeal} style={{ width: "100%", padding: "13px", borderRadius: 14, fontSize: 13, fontWeight: 700, background: "#fff", color: "#ff6b6b", border: "2px solid #ff6b6b", cursor: "pointer", fontFamily: "inherit" }}>🔄 이 끼니 다시 뽑기</button>
            </div>
          );
        })()}

        {step === "recipe" && <RecipeView item={viewRecipe} onBack={() => setStep("planner")} />}

        {step === "privacy" && <PrivacyPolicy onBack={() => setStep("pref")} />}

        {step !== "privacy" && (
          <div style={{ marginTop: 20 }}>
            <div style={{ background: "#fff8f0", border: "1px solid #ffd0b0", borderRadius: 12, padding: "12px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>📢</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e55", marginBottom: 5 }}>쿠팡파트너스 수수료 고지</div>
                <p style={{ fontSize: 12, color: "#666", lineHeight: 1.8, margin: 0 }}>
                  본 서비스의 장보기 링크는 쿠팡파트너스 활동의 일환으로 운영되며, 이를 통해 일정액의 수수료를 제공받을 수 있습니다. 단, 상품 가격 및 구매 조건은 고객님께 동일하게 적용됩니다.
                </p>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #eee" }}>
              <div style={{ display: "flex" }}>
                <button
                  onClick={() => setStep("privacy")}
                  style={{ flex: 1, padding: "12px 8px", background: "#fff", border: "none", borderRight: "1px solid #eee", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}
                >
                  <div style={{ fontSize: 16, marginBottom: 3 }}>📋</div>
                  <div style={{ fontSize: 11, color: "#999", fontWeight: 600 }}>개인정보처리방침</div>
                </button>
                <a
                  href="mailto:skatkdqla173123@gmail.com"
                  style={{ flex: 1, padding: "12px 8px", background: "#fff", textDecoration: "none", display: "block", textAlign: "center" }}
                >
                  <div style={{ fontSize: 16, marginBottom: 3 }}>💬</div>
                  <div style={{ fontSize: 11, color: "#999", fontWeight: 600 }}>문의하기</div>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

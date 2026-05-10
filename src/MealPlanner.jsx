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
  { emoji: "👶", title: "아이 정보 입력",    desc: "생년월일과 알레르기 정보를 저장하면\n맞춤 식단이 더 정확해져요" },
  { emoji: "🥦", title: "냉장고 재료 활용", desc: "있는 재료를 선택하면\n그 재료가 들어간 메뉴를\n우선으로 추천해요" },
  { emoji: "🍱", title: "식단 자동 생성",  desc: "요일·끼니별로 식단을 확인하고\n마음에 안 들면 🔄 버튼으로\n바로 바꿀 수 있어요" },
  { emoji: "🛒", title: "장보기 목록",    desc: "필요한 재료를 한눈에 확인하고\n클릭 한 번으로 바로 구매할 수 있어요" },
];

const CHILD_LABELS = ["첫째", "둘째", "셋째"];

const LOADING_MESSAGES = [
  "냉장고 재료를 스캔하고 있어요 🥦",
  "영양소를 계산하고 있어요 🧬",
  "아이 맞춤 식단을 완성하고 있어요 🍱",
];

const MEAL_INFO = {
  "아침": { icon: "🌅", bg: "#fffbeb", badge: "#fde68a", text: "#92400e" },
  "점심": { icon: "☀️", bg: "#f0fdf4", badge: "#bbf7d0", text: "#14532d" },
  "저녁": { icon: "🌙", bg: "#eff6ff", badge: "#bfdbfe", text: "#1e3a8a" },
};

const BIRTH_YEARS = Array.from({ length: 11 }, (_, i) => 2015 + i);
const BIRTH_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function calcAgeFromBirth(year, month) {
  if (!year || !month) return null;
  const y = parseInt(year), m = parseInt(month);
  if (isNaN(y) || isNaN(m) || y < 2000 || y > 2030 || m < 1 || m > 12) return null;
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m) age--;
  return age >= 0 ? age : null;
}

function ageGroupFromAge(age) {
  if (age === null || age === undefined) return null;
  if (age <= 2)  return "baby";
  if (age <= 5)  return "toddler";
  if (age <= 8)  return "kid1";
  if (age <= 11) return "kid2";
  return "teen";
}

export default function MealPlanner() {
  // ── core state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mp_weekplan") || "null") ? "planner" : "profile"; }
    catch { return "profile"; }
  });

  const [selectedAges, setAges] = useState(() => {
    try {
      const profs = JSON.parse(localStorage.getItem("mp_profiles") || "[]");
      const ages = [...new Set(profs.filter(Boolean).map(p => ageGroupFromAge(calcAgeFromBirth(p.birthYear, p.birthMonth))).filter(Boolean))];
      return ages.length > 0 ? ages : JSON.parse(localStorage.getItem("mp_ages") || "[]");
    } catch { return []; }
  });

  const [selectedFoods,   setFoods]   = useState(() => { try { return JSON.parse(localStorage.getItem("mp_foods")   || "[]"); } catch { return []; } });
  const [selectedIngreds, setIngreds] = useState(() => { try { return JSON.parse(localStorage.getItem("mp_ingreds") || "[]"); } catch { return []; } });

  const [selectedAllergies, setAllergies] = useState(() => {
    try {
      const profs = JSON.parse(localStorage.getItem("mp_profiles") || "[]");
      return [...new Set(profs.filter(Boolean).flatMap(p => p.allergies || []))];
    } catch { return []; }
  });

  const [selectedMeals, setSelectedMeals] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mp_meals") || '["아침","저녁"]'); }
    catch { return ["아침", "저녁"]; }
  });

  const [customInput,    setCustomInput]   = useState("");
  const [weekPlan,       setWeekPlan]      = useState(() => { try { return JSON.parse(localStorage.getItem("mp_weekplan") || "null"); } catch { return null; } });
  const [activeDay,      setActiveDay]     = useState("월");
  const [activeMeal,     setActiveMeal]    = useState(() => {
    try { const m = JSON.parse(localStorage.getItem("mp_meals") || '["아침","저녁"]'); return m[0] || "아침"; } catch { return "아침"; }
  });
  const [viewRecipe,     setViewRecipe]    = useState(null);
  const [loading,        setLoading]       = useState(false);
  const [loadingStage,   setLoadingStage]  = useState(0);
  const [loadingFade,    setLoadingFade]   = useState(true);
  const [showWeeklyShop, setShowWeeklyShop] = useState(false);
  const [checkedItems,   setCheckedItems]  = useState(() => { try { return JSON.parse(localStorage.getItem("mp_checked") || "[]"); } catch { return []; } });

  // ── onboarding ────────────────────────────────────────────────────────────
  const [showOnboarding,  setShowOnboarding]  = useState(() => !localStorage.getItem("mp_onboarding_done"));
  const [onboardingSlide, setOnboardingSlide] = useState(0);

  // ── profile edit state ───────────────────────────────────────────────────
  const [profiles,       setProfiles]       = useState(() => { try { return JSON.parse(localStorage.getItem("mp_profiles") || "[]"); } catch { return []; } });
  const [profileTab,     setProfileTab]     = useState(0);
  const [editBirthYear,  setEditBirthYear]  = useState(() => { try { return JSON.parse(localStorage.getItem("mp_profiles") || "[]")[0]?.birthYear  || ""; } catch { return ""; } });
  const [editBirthMonth, setEditBirthMonth] = useState(() => { try { return JSON.parse(localStorage.getItem("mp_profiles") || "[]")[0]?.birthMonth || ""; } catch { return ""; } });
  const [editAllergies,  setEditAllergies]  = useState(() => { try { return JSON.parse(localStorage.getItem("mp_profiles") || "[]")[0]?.allergies     || []; } catch { return []; } });
  const [editAvoids,     setEditAvoids]     = useState(() => { try { return JSON.parse(localStorage.getItem("mp_profiles") || "[]")[0]?.avoidedIngreds || []; } catch { return []; } });
  const [editFoodPrefs,  setEditFoodPrefs]  = useState(() => { try { return JSON.parse(localStorage.getItem("mp_profiles") || "[]")[0]?.foodPrefs      || []; } catch { return []; } });

  // ── derived ───────────────────────────────────────────────────────────────
  const avoidedIngreds      = profiles.filter(Boolean).flatMap(p => p.avoidedIngreds || []);
  const allergenIngredients = ALLERGY_OPTIONS.filter(a => selectedAllergies.includes(a.id)).flatMap(a => a.ingredients);
  const mealGoal            = calcMealGoal(selectedAges);
  const allIngredNames      = INGREDIENT_GROUPS.flatMap(g => g.items.map(x => x.n));

  // ── helpers ───────────────────────────────────────────────────────────────
  const toggleArr = (setArr, val, key) => setArr(prev => {
    const next = prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val];
    if (key) localStorage.setItem(key, JSON.stringify(next));
    return next;
  });
  const toggleCheck = ing => setCheckedItems(prev => {
    const next = prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing];
    localStorage.setItem("mp_checked", JSON.stringify(next));
    return next;
  });
  const ms = m => MEAL_INFO[m] || MEAL_INFO["저녁"];

  // ── onboarding render ─────────────────────────────────────────────────────
  const finishOnboarding = () => {
    localStorage.setItem("mp_onboarding_done", "1");
    setShowOnboarding(false);
    setOnboardingSlide(0);
  };

  const renderOnboarding = () => {
    const slide  = ONBOARDING_SLIDES[onboardingSlide];
    const isLast  = onboardingSlide === ONBOARDING_SLIDES.length - 1;
    const isFirst = onboardingSlide === 0;
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#fff", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 28px", fontFamily: "Georgia, serif" }}>
        <button onClick={finishOnboarding} style={{ position: "absolute", top: 18, right: 18, background: "none", border: "none", color: "#ccc", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>건너뛰기</button>
        <div style={{ fontSize: 64, marginBottom: 28, lineHeight: 1 }}>{slide.emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#ff6b6b", marginBottom: 16, textAlign: "center" }}>{slide.title}</div>
        <div style={{ fontSize: 13, color: "#999", textAlign: "center", lineHeight: 2.1, whiteSpace: "pre-line" }}>{slide.desc}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 40, marginBottom: 28 }}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i === onboardingSlide ? "#ff6b6b" : "#e0e0e0", transition: "background 0.2s" }} />
          ))}
        </div>
        {isLast ? (
          <button onClick={finishOnboarding} style={{ width: "100%", maxWidth: 280, padding: "16px", borderRadius: 20, background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(255,107,107,0.35)" }}>시작하기!</button>
        ) : (
          <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 280 }}>
            {!isFirst && (
              <button onClick={() => setOnboardingSlide(p => p - 1)} style={{ flex: 1, padding: "13px", borderRadius: 16, background: "#f5f5f5", color: "#bbb", border: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>이전</button>
            )}
            <button onClick={() => setOnboardingSlide(p => p + 1)} style={{ flex: 1, padding: "13px", borderRadius: 16, background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>다음</button>
          </div>
        )}
      </div>
    );
  };

  // ── profile logic ─────────────────────────────────────────────────────────
  const applyAllProfiles = (allProfiles) => {
    const filled = allProfiles.filter(Boolean);
    if (!filled.length) return;
    const ages  = [...new Set(filled.map(p => ageGroupFromAge(calcAgeFromBirth(p.birthYear, p.birthMonth))).filter(Boolean))];
    const algys = [...new Set(filled.flatMap(p => p.allergies  || []))];
    const foods = [...new Set(filled.flatMap(p => p.foodPrefs  || []))];
    if (ages.length)  { setAges(ages);   localStorage.setItem("mp_ages",  JSON.stringify(ages));  }
    setAllergies(algys);
    if (foods.length) { setFoods(foods); localStorage.setItem("mp_foods", JSON.stringify(foods)); }
  };

  const loadProfileIntoEdit = (idx, allProfiles) => {
    const p = allProfiles[idx];
    setEditBirthYear(p?.birthYear     || "");
    setEditBirthMonth(p?.birthMonth   || "");
    setEditAllergies(p?.allergies     || []);
    setEditAvoids(p?.avoidedIngreds   || []);
    setEditFoodPrefs(p?.foodPrefs     || []);
  };

  const handleProfileTabClick = (idx) => {
    setProfileTab(idx);
    loadProfileIntoEdit(idx, profiles);
    if (profiles[idx]) applyAllProfiles(profiles);
  };

  const handleAddProfileTab = () => {
    setProfileTab(profiles.length);
    setEditBirthYear(""); setEditBirthMonth("");
    setEditAllergies([]); setEditAvoids([]); setEditFoodPrefs([]);
  };

  const handleResetProfile = (idx) => {
    if (!window.confirm("이 프로필을 초기화할까요?")) return;
    const next = profiles.filter((_, i) => i !== idx);
    setProfiles(next);
    localStorage.setItem("mp_profiles", JSON.stringify(next));
    const newTab = Math.min(profileTab, Math.max(0, next.length - 1));
    setProfileTab(newTab);
    if (next.length > 0) {
      loadProfileIntoEdit(newTab, next);
      applyAllProfiles(next);
    } else {
      setEditBirthYear(""); setEditBirthMonth("");
      setEditAllergies([]); setEditAvoids([]); setEditFoodPrefs([]);
    }
  };

  const handleDeleteAllProfiles = () => {
    if (!window.confirm("저장된 프로필을 모두 삭제할까요?")) return;
    localStorage.removeItem("mp_profiles");
    setProfiles([]);
    setProfileTab(0);
    setEditBirthYear(""); setEditBirthMonth("");
    setEditAllergies([]); setEditAvoids([]); setEditFoodPrefs([]);
    setAges([]);
    setAllergies([]);
  };

  const saveCurrentProfile = () => {
    const profile = {
      birthYear: editBirthYear, birthMonth: editBirthMonth,
      allergies: editAllergies, avoidedIngreds: editAvoids, foodPrefs: editFoodPrefs,
    };
    const next = [...profiles];
    next[profileTab] = profile;
    setProfiles(next);
    localStorage.setItem("mp_profiles", JSON.stringify(next));
    return next;
  };

  const handleNextFromProfile = () => {
    const hasData = editBirthYear || editBirthMonth || editAllergies.length > 0 || editAvoids.length > 0 || editFoodPrefs.length > 0;
    if (hasData || profiles[profileTab]) {
      applyAllProfiles(saveCurrentProfile());
    } else {
      applyAllProfiles(profiles);
    }
    setStep("mealtype");
  };

  const handleQuickStart = () => {
    applyAllProfiles(profiles);
    setStep("fridge");
  };

  const editAge      = calcAgeFromBirth(editBirthYear, editBirthMonth);
  const editAgeGroup = ageGroupFromAge(editAge);
  const editAgeLabel = editAge !== null
    ? `만 ${editAge}세 (${AGE_GROUPS.find(g => g.id === editAgeGroup)?.label || ""}) ${AGE_GROUPS.find(g => g.id === editAgeGroup)?.emoji || ""}`
    : "";

  // ── generation logic ──────────────────────────────────────────────────────
  const handleAddCustom = () => {
    const t = customInput.trim();
    if (!t) return;
    if (!selectedIngreds.includes(t)) {
      setIngreds(prev => { const next = [...prev, t]; localStorage.setItem("mp_ingreds", JSON.stringify(next)); return next; });
    }
    setCustomInput("");
  };

  const handleGenerate = () => {
    const mealsToUse = selectedMeals.length > 0 ? selectedMeals : ["아침", "점심", "저녁"];
    setLoading(true);
    setLoadingStage(0);
    setLoadingFade(true);

    const fadeNext = (nextStage, delay) => {
      setTimeout(() => {
        setLoadingFade(false);
        setTimeout(() => { setLoadingStage(nextStage); setLoadingFade(true); }, 180);
      }, delay);
    };
    fadeNext(1, 800);
    fadeNext(2, 1600);

    setTimeout(() => {
      const plan = generateWeekPlan(selectedFoods, selectedIngreds, selectedAges, allergenIngredients, avoidedIngreds, mealsToUse);
      setWeekPlan(plan);
      localStorage.setItem("mp_weekplan", JSON.stringify(plan));
      setActiveMeal(mealsToUse[0]);
      setStep("planner");
      setLoading(false);
    }, 2400);
  };

  const handleRegenMeal = () => {
    const minAgeIndex = getMinAgeIndex(selectedAges);
    const rice  = pickOne(RICE_DB, selectedFoods, selectedIngreds, [], minAgeIndex, allergenIngredients, avoidedIngreds);
    const soup  = pickOne(SOUP_DB, selectedFoods, selectedIngreds, [], minAgeIndex, allergenIngredients, avoidedIngreds);
    const sides = pickTwoSides(selectedFoods, selectedIngreds, [], minAgeIndex, allergenIngredients, avoidedIngreds);
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
      const next = handleReplaceItem(prev, activeDay, activeMeal, type, selectedFoods, selectedIngreds, minAgeIndex, allergenIngredients, avoidedIngreds);
      localStorage.setItem("mp_weekplan", JSON.stringify(next));
      return next;
    });
  };

  // ── progress bar ──────────────────────────────────────────────────────────
  const renderProgress = (cur) => {
    const STEP_ORDER = ["profile", "mealtype", "fridge"];
    const idx = STEP_ORDER.indexOf(cur);
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 28 }}>
        {STEP_ORDER.map((_, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i <= idx ? "#ff6b6b" : "#e0e0e0", transition: "background 0.3s" }} />
        ))}
      </div>
    );
  };

  // ── loading overlay ───────────────────────────────────────────────────────
  const renderLoadingOverlay = () => {
    if (!loading) return null;
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.97)", zIndex: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>🍱</div>
        <div style={{ opacity: loadingFade ? 1 : 0, transition: "opacity 0.18s ease", fontSize: 16, fontWeight: 700, color: "#ff6b6b", textAlign: "center", padding: "0 32px", lineHeight: 1.6 }}>
          {LOADING_MESSAGES[loadingStage]}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
          {LOADING_MESSAGES.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i <= loadingStage ? "#ff6b6b" : "#e0e0e0", transition: "background 0.3s" }} />
          ))}
        </div>
      </div>
    );
  };

  // ── Step 1: 아이 정보 ─────────────────────────────────────────────────────
  const renderProfileStep = () => {
    const filledProfiles = profiles.filter(p => p && (p.birthYear || p.allergies?.length || p.avoidedIngreds?.length));
    return (
      <div>
        {renderProgress("profile")}

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#333", marginBottom: 6 }}>우리 아이를 소개해주세요 👶</div>
          <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7 }}>아이 정보를 저장하면 다음부터 바로 시작할 수 있어요</div>
        </div>

        {/* Quick start card for returning users */}
        {filledProfiles.length > 0 && (
          <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", border: "2px solid #ff8e53", borderRadius: 18, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ff6b6b", marginBottom: 10 }}>👋 저장된 프로필이 있어요!</div>
            {profiles.map((p, i) => {
              if (!p) return null;
              const age = calcAgeFromBirth(p.birthYear, p.birthMonth);
              const ag  = ageGroupFromAge(age);
              const agLabel = age !== null ? `만 ${age}세 (${AGE_GROUPS.find(g => g.id === ag)?.label || ""})` : "";
              return (
                <div key={i} style={{ fontSize: 12, color: "#888", marginBottom: 5, lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 700, color: "#ff8e53" }}>{CHILD_LABELS[i]}</span>
                  {agLabel ? ` · ${agLabel}` : ""}
                  {p.allergies?.length ? ` · ${p.allergies.join(", ")} 알레르기` : ""}
                  {p.avoidedIngreds?.length ? ` · ${p.avoidedIngreds.slice(0, 3).join(", ")}${p.avoidedIngreds.length > 3 ? " 외" : ""} 기피` : ""}
                </div>
              );
            })}
            <button onClick={handleQuickStart} style={{ marginTop: 14, width: "100%", padding: "13px", borderRadius: 13, background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 12px rgba(255,107,107,0.28)" }}>
              이 프로필로 바로 시작하기 →
            </button>
          </div>
        )}

        {/* Profile editor card */}
        <div style={{ background: "#fff", borderRadius: 18, padding: 18, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.08)", border: "1.5px solid #ffd0b0", position: "relative" }}>
          {profiles.length > 0 && (
            <button onClick={handleDeleteAllProfiles}
              style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: "#ccc", fontSize: 10, cursor: "pointer", fontFamily: "inherit", padding: "2px 4px", lineHeight: 1.2 }}>
              전체 삭제
            </button>
          )}
          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
            {profiles.map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <button onClick={() => handleProfileTabClick(i)}
                  style={{ padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: profileTab === i ? "#ff6b6b" : "#fff", color: profileTab === i ? "#fff" : "#aaa", border: profileTab === i ? "1.5px solid #ff6b6b" : "1.5px solid #eee" }}>
                  {CHILD_LABELS[i]}
                </button>
                <button onClick={() => handleResetProfile(i)}
                  style={{ background: "none", border: "none", color: "#ccc", fontSize: 11, cursor: "pointer", fontFamily: "inherit", padding: "2px 4px", lineHeight: 1.2 }}>
                  🗑️ 초기화
                </button>
              </div>
            ))}
            {profiles.length < 3 && (
              <button onClick={handleAddProfileTab}
                style={{ padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: profileTab === profiles.length ? "#ff6b6b" : "#fff8f0", color: profileTab === profiles.length ? "#fff" : "#ff8e53", border: profileTab === profiles.length ? "1.5px solid #ff6b6b" : "1.5px dashed #ff8e53" }}>
                + 추가
              </button>
            )}
          </div>

          {/* Birth date dropdowns */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 10 }}>📅 생년월일</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <select value={editBirthYear} onChange={e => setEditBirthYear(e.target.value)}
                style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #ffd0b0", fontSize: 14, fontFamily: "inherit", background: "#fff8f0", color: editBirthYear ? "#444" : "#bbb", outline: "none", cursor: "pointer" }}>
                <option value="">년도 선택</option>
                {BIRTH_YEARS.map(y => <option key={y} value={String(y)}>{y}년</option>)}
              </select>
              <select value={editBirthMonth} onChange={e => setEditBirthMonth(e.target.value)}
                style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #ffd0b0", fontSize: 14, fontFamily: "inherit", background: "#fff8f0", color: editBirthMonth ? "#444" : "#bbb", outline: "none", cursor: "pointer" }}>
                <option value="">월 선택</option>
                {BIRTH_MONTHS.map(m => <option key={m} value={String(m)}>{String(m).padStart(2, "0")}월</option>)}
              </select>
              {editAgeLabel && (
                <span style={{ fontSize: 13, color: "#ff6b6b", fontWeight: 700, background: "#fff0ee", borderRadius: 10, padding: "5px 12px", border: "1px solid #ffccc8" }}>
                  {editAgeLabel}
                </span>
              )}
            </div>
          </div>

          {/* Allergies */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 10 }}>우리 아이가 피해야 할 것이 있나요?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {ALLERGY_OPTIONS.map(a => {
                const sel = editAllergies.includes(a.id);
                return (
                  <button key={a.id}
                    onClick={() => setEditAllergies(prev => prev.includes(a.id) ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                    style={{ padding: "7px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: sel ? "#fee2e2" : "#fff8f0", color: sel ? "#dc2626" : "#999", border: sel ? "1.5px solid #dc2626" : "1px solid #eee", fontWeight: sel ? 700 : 400 }}>
                    {a.emoji} {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avoided ingredients */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 4 }}>우리 아이가 싫어하는 재료가 있나요?</div>
            <div style={{ fontSize: 11, color: "#ccc", marginBottom: 8 }}>선택하면 해당 재료가 든 메뉴는 식단에서 자동 제외돼요</div>
            <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexWrap: "wrap", gap: 5, padding: "8px", border: "1px solid #f0f0f0", borderRadius: 12, background: "#fafafa" }}>
              {INGREDIENT_GROUPS.flatMap(grp => grp.items).map(item => {
                const sel = editAvoids.includes(item.n);
                return (
                  <button key={item.n}
                    onClick={() => setEditAvoids(prev => prev.includes(item.n) ? prev.filter(x => x !== item.n) : [...prev, item.n])}
                    style={{ padding: "4px 9px", borderRadius: 16, fontSize: 11, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, background: sel ? "#fef3c7" : "#fff", color: sel ? "#b45309" : "#ccc", border: sel ? "1.5px solid #d97706" : "1px solid #eee", fontWeight: sel ? 700 : 400 }}>
                    {item.e} {item.n}
                  </button>
                );
              })}
            </div>
            {editAvoids.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 11, color: "#d97706", fontWeight: 700 }}>
                🚫 제외: {editAvoids.join(", ")}
              </div>
            )}
          </div>
        </div>

        {/* Bottom buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={() => setStep("mealtype")}
            style={{ flex: 1, padding: "14px", borderRadius: 14, background: "none", color: "#bbb", border: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            건너뛰기
          </button>
          <button onClick={handleNextFromProfile}
            style={{ flex: 2, padding: "14px", borderRadius: 14, background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 14px rgba(255,107,107,0.28)" }}>
            다음 →
          </button>
        </div>
      </div>
    );
  };

  // ── Step 2: 식사 맞춤화 ───────────────────────────────────────────────────
  const renderMealtypeStep = () => (
    <div>
      {renderProgress("mealtype")}

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#333", marginBottom: 6 }}>어떤 식사를 계획하시나요? 🍽️</div>
        <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7 }}>필요한 식사만 선택하면 식단이 더 간단해져요</div>
      </div>

      {/* Meal selection */}
      <div style={{ background: "#fff", borderRadius: 18, padding: 18, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.08)", border: "1px solid #ffe4e0" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#e55", marginBottom: 4 }}>🍽️ 식사 선택</div>
        <div style={{ fontSize: 11, color: "#ccc", marginBottom: 12 }}>복수 선택 가능</div>
        <div style={{ display: "flex", gap: 8 }}>
          {MEALS.map(m => {
            const info = ms(m);
            const sel = selectedMeals.includes(m);
            return (
              <button key={m} onClick={() => {
                setSelectedMeals(prev => {
                  const next = prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m];
                  const ordered = MEALS.filter(meal => next.includes(meal));
                  localStorage.setItem("mp_meals", JSON.stringify(ordered));
                  return ordered;
                });
              }}
                style={{ flex: 1, padding: "16px 8px", borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: sel ? info.badge : "#fafafa", color: sel ? info.text : "#ccc", border: sel ? `2px solid ${info.text}55` : "2px solid #f0f0f0", transition: "all 0.15s" }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{info.icon}</div>
                {m}
              </button>
            );
          })}
        </div>
        {selectedMeals.length === 0 && (
          <div style={{ marginTop: 10, fontSize: 11, color: "#ef4444", textAlign: "center" }}>최소 1개 이상 선택해주세요</div>
        )}
      </div>

      {/* Food preferences */}
      <div style={{ background: "#fff", borderRadius: 18, padding: 18, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.07)", border: "1px solid #ffe4e0" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#e55", marginBottom: 2 }}>좋아하는 음식이 있나요?</div>
        <div style={{ fontSize: 11, color: "#ccc", marginBottom: 10 }}>여러 개 선택 가능 · 없으면 전체 반영</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {FOOD_PREFS.map(f => (
            <button key={f.id} onClick={() => toggleArr(setFoods, f.id, "mp_foods")}
              style={{ padding: "7px 11px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: selectedFoods.includes(f.id) ? "#ff6b6b" : "#fff8f0", color: selectedFoods.includes(f.id) ? "#fff" : "#999", border: selectedFoods.includes(f.id) ? "1px solid #ff6b6b" : "1px solid #eee", fontWeight: selectedFoods.includes(f.id) ? 700 : 400 }}>
              {f.e} {f.id}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={() => setStep("profile")}
          style={{ flex: 1, padding: "14px", borderRadius: 14, background: "#f5f5f5", color: "#aaa", border: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          ← 이전
        </button>
        <button onClick={() => setStep("fridge")} disabled={selectedMeals.length === 0}
          style={{ flex: 2, padding: "14px", borderRadius: 14, background: selectedMeals.length === 0 ? "#e0e0e0" : "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: selectedMeals.length === 0 ? "default" : "pointer", fontFamily: "inherit", boxShadow: selectedMeals.length === 0 ? "none" : "0 3px 14px rgba(255,107,107,0.28)" }}>
          다음 →
        </button>
      </div>
    </div>
  );

  // ── Step 3: 냉장고 재료 ───────────────────────────────────────────────────
  const renderFridgeStep = () => (
    <div>
      {renderProgress("fridge")}

      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#333", marginBottom: 6 }}>냉장고에 뭐가 있나요? 🥦</div>
      </div>

      {/* Info box */}
      <div style={{ background: "#fff8f0", border: "1.5px solid #ffd0b0", borderRadius: 14, padding: "14px 16px", marginBottom: 18, lineHeight: 1.9 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#c2410c", marginBottom: 2 }}>냉장고에 잠들어 있는 재료들을 깨워볼까요? 🥦</div>
        <div style={{ fontSize: 12, color: "#999" }}>지금 있는 재료로 식단을 짜드려요!</div>
        <div style={{ fontSize: 12, color: "#999" }}>없는 재료는 나중에 장보기 목록에서 쿠팡으로 바로 구매할 수 있어요 🛒</div>
      </div>

      {/* Ingredient groups */}
      <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.07)", border: "1px solid #ffe4e0" }}>
        {INGREDIENT_GROUPS.map(grp => (
          <div key={grp.group} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", marginBottom: 7 }}>{grp.group}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {grp.items.map(item => (
                <button key={item.n} onClick={() => toggleArr(setIngreds, item.n, "mp_ingreds")}
                  style={{ padding: "6px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: selectedIngreds.includes(item.n) ? "#ff8e53" : "#fff8f0", color: selectedIngreds.includes(item.n) ? "#fff" : "#999", border: selectedIngreds.includes(item.n) ? "1px solid #ff8e53" : "1px solid #eee", fontWeight: selectedIngreds.includes(item.n) ? 700 : 400 }}>
                  {item.e} {item.n}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Custom input */}
        <div style={{ paddingTop: 12, borderTop: "1px dashed #f0e0d0" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", marginBottom: 7 }}>✏️ 직접 입력</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={customInput} onChange={e => setCustomInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddCustom()}
              placeholder="재료명 입력 후 추가"
              style={{ flex: 1, padding: "9px 12px", borderRadius: 12, border: "1.5px solid #ffd0b0", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff8f0", color: "#444" }} />
            <button onClick={handleAddCustom}
              style={{ padding: "9px 14px", borderRadius: 12, background: "#ff8e53", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
              추가
            </button>
          </div>
          {selectedIngreds.filter(i => !allIngredNames.includes(i)).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {selectedIngreds.filter(i => !allIngredNames.includes(i)).map(i => (
                <span key={i} style={{ background: "#fff0e8", border: "1px solid #ff8e53", borderRadius: 20, padding: "4px 10px", fontSize: 12, color: "#ff8e53", display: "flex", alignItems: "center", gap: 4 }}>
                  {i}
                  <button onClick={() => setIngreds(prev => { const next = prev.filter(v => v !== i); localStorage.setItem("mp_ingreds", JSON.stringify(next)); return next; })}
                    style={{ background: "none", border: "none", color: "#ff8e53", cursor: "pointer", fontSize: 12, padding: 0 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected ingredients summary */}
      {selectedIngreds.length > 0 && (
        <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", border: "1px solid #ffd8d0", borderRadius: 14, padding: "11px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#e55", marginBottom: 7 }}>✅ 선택된 재료 ({selectedIngreds.length}개)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {selectedIngreds.map(i => (
              <span key={i} style={{ background: "#fff", border: "1px solid #ffc0a0", borderRadius: 8, padding: "3px 9px", fontSize: 11, color: "#e55", display: "flex", alignItems: "center", gap: 3 }}>
                {i}
                <button onClick={() => setIngreds(prev => { const next = prev.filter(v => v !== i); localStorage.setItem("mp_ingreds", JSON.stringify(next)); return next; })}
                  style={{ background: "none", border: "none", color: "#ffb0a0", cursor: "pointer", fontSize: 11, padding: 0 }}>×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Avoided ingreds notice */}
      {avoidedIngreds.length > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 16 }}>🙅</span>
          <div style={{ fontSize: 11, color: "#b45309", fontWeight: 700 }}>기피 재료 제외 중: {[...new Set(avoidedIngreds)].join(", ")}</div>
        </div>
      )}

      {/* Allergy notice */}
      {selectedAllergies.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 14, padding: "12px 14px", marginBottom: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", marginBottom: 3 }}>알레르기 주의사항</div>
            <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.7 }}>심각한 알레르기가 있는 경우 반드시 전문의와 상담하세요.</div>
          </div>
        </div>
      )}

      {/* Bottom buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={() => setStep("mealtype")}
          style={{ flex: 1, padding: "14px", borderRadius: 14, background: "#f5f5f5", color: "#aaa", border: "none", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          ← 이전
        </button>
        <button onClick={handleGenerate}
          style={{ flex: 3, padding: "16px", borderRadius: 14, fontSize: 15, fontWeight: 700, background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 18px rgba(255,107,107,0.3)", fontFamily: "inherit" }}>
          ✨ 우리 아이 맞춤 식단 완성하기!
        </button>
      </div>
    </div>
  );

  // ── render ────────────────────────────────────────────────────────────────
  const mealsInPlan = weekPlan?.["월"] ? MEALS.filter(m => weekPlan["월"][m] !== undefined) : selectedMeals;
  const safeMeal    = mealsInPlan.includes(activeMeal) ? activeMeal : (mealsInPlan[0] || activeMeal);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(150deg,#fff8f2 0%,#ffecd8 40%,#f8f0ff 100%)", fontFamily: "Georgia, serif" }}>
      {showOnboarding && renderOnboarding()}
      {renderLoadingOverlay()}

      {/* Header */}
      <div style={{ background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", padding: "14px 16px 10px", boxShadow: "0 4px 20px rgba(255,107,107,0.28)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🍱</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>우리 아이 주간 식단표</div>
            <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 11 }}>밥 · 국 · 반찬 2가지 균형 식단</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button onClick={() => { setOnboardingSlide(0); setShowOnboarding(true); }} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "5px 11px", fontSize: 11, cursor: "pointer" }}>❓</button>
            {(step === "planner" || step === "recipe") && (
              <button onClick={() => setStep("profile")} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "5px 11px", fontSize: 11, cursor: "pointer" }}>⚙️ 설정</button>
            )}
          </div>
        </div>
      </div>

      {/* Back bar */}
      {(step === "planner" || step === "recipe") && (
        <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setStep("profile")} style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, padding: 0 }}>← 설정으로</button>
          <div style={{ fontSize: 12, color: "#bbb" }}>{step === "planner" ? `${activeDay}요일 ${safeMeal}` : "조리법"}</div>
        </div>
      )}

      <div style={{ padding: "14px 12px 60px" }}>
        {step === "profile"  && renderProfileStep()}
        {step === "mealtype" && renderMealtypeStep()}
        {step === "fridge"   && renderFridgeStep()}

        {/* Planner */}
        {step === "planner" && weekPlan && (() => {
          const meal = weekPlan[activeDay]?.[safeMeal];
          if (!meal) return null;
          const nutri = [meal.rice, meal.soup, ...meal.sides].filter(Boolean).reduce((acc, item) => ({
            protein: acc.protein + (item.nutrition?.protein || 0),
            calcium: acc.calcium + (item.nutrition?.calcium || 0),
            iron:    acc.iron    + (item.nutrition?.iron    || 0),
            vitC:    acc.vitC    + (item.nutrition?.vitC    || 0),
            fiber:   acc.fiber   + (item.nutrition?.fiber   || 0),
            cal:     acc.cal     + (item.cal || 0),
          }), { protein: 0, calcium: 0, iron: 0, vitC: 0, fiber: 0, cal: 0 });
          const style = ms(safeMeal);
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
                {mealsInPlan.map(m => { const s = ms(m); return <button key={m} onClick={() => setActiveMeal(m)} style={{ flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: safeMeal === m ? s.badge : "#fff", color: safeMeal === m ? s.text : "#ccc", border: safeMeal === m ? `1.5px solid ${s.text}55` : "1px solid #eee" }}>{s.icon} {m}</button>; })}
              </div>
              <div style={{ background: style.bg, borderRadius: 16, padding: "11px 15px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${style.text}22` }}>
                <div>
                  <div style={{ fontSize: 10, color: "#aaa" }}>{activeDay}요일 {safeMeal} 총 열량</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: style.text }}>{nutri.cal} <span style={{ fontSize: 12, fontWeight: 400 }}>kcal</span></div>
                  <div style={{ fontSize: 10, color: "#bbb", marginTop: 1 }}>밥+국+반찬2가지 · 1인분 기준</div>
                </div>
                <span style={{ fontSize: 28 }}>{style.icon}</span>
              </div>
              <div style={{ background: "#fff", borderRadius: 16, padding: "12px 14px", marginBottom: 11, border: "1px solid #f0f0f0" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#999", marginBottom: 9 }}>🧬 한 끼 영양 충족률</div>
                <div style={{ display: "flex", gap: 7 }}>
                  <NutriBar label="단백질" value={nutri.protein} goal={mealGoal.protein} unit="g"  color="#6366f1" />
                  <NutriBar label="칼슘"   value={nutri.calcium} goal={mealGoal.calcium} unit="mg" color="#22c55e" />
                  <NutriBar label="철분"   value={nutri.iron}    goal={mealGoal.iron}    unit="mg" color="#f59e0b" />
                  <NutriBar label="비타민C" value={nutri.vitC}   goal={mealGoal.vitC}    unit="mg" color="#ef4444" />
                  <NutriBar label="식이섬유" value={nutri.fiber} goal={mealGoal.fiber}   unit="g"  color="#8b5cf6" />
                </div>
              </div>
              <MealItemCard emoji="🍚" label="밥 / 덮밥"  item={meal.rice} color="#f97316" onRecipe={() => { setViewRecipe(meal.rice); setStep("recipe"); }} onReplace={() => onReplaceItem("rice")} />
              <MealItemCard emoji="🍲" label="국 / 찌개"  item={meal.soup} color="#3b82f6" onRecipe={() => { setViewRecipe(meal.soup); setStep("recipe"); }} onReplace={() => onReplaceItem("soup")} />
              {meal.sides.map((side, i) => (
                <MealItemCard key={i} emoji="🥗" label={`반찬 ${i + 1} (${side.nutriType})`} item={side} color={i === 0 ? "#8b5cf6" : "#22c55e"} onRecipe={() => { setViewRecipe(side); setStep("recipe"); }} onReplace={() => onReplaceItem(`side${i}`)} />
              ))}
              <ShoppingList meal={meal} weekPlan={weekPlan} showWeeklyShop={showWeeklyShop} setShowWeeklyShop={setShowWeeklyShop} checkedItems={checkedItems} toggleCheck={toggleCheck} onClear={() => setCheckedItems([])} />
              <button onClick={handleRegenMeal} style={{ width: "100%", padding: "13px", borderRadius: 14, fontSize: 13, fontWeight: 700, background: "#fff", color: "#ff6b6b", border: "2px solid #ff6b6b", cursor: "pointer", fontFamily: "inherit" }}>🔄 이 끼니 다시 뽑기</button>
            </div>
          );
        })()}

        {step === "recipe"  && <RecipeView item={viewRecipe} onBack={() => setStep("planner")} />}
        {step === "privacy" && <PrivacyPolicy onBack={() => setStep("profile")} />}

        {/* Footer */}
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
                <button onClick={() => setStep("privacy")} style={{ flex: 1, padding: "12px 8px", background: "#fff", border: "none", borderRight: "1px solid #eee", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>📋</div>
                  <div style={{ fontSize: 11, color: "#999", fontWeight: 600 }}>개인정보처리방침</div>
                </button>
                <a href="mailto:skatkdqla173123@gmail.com" style={{ flex: 1, padding: "12px 8px", background: "#fff", textDecoration: "none", display: "block", textAlign: "center" }}>
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

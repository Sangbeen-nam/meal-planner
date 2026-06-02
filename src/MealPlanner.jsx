import { useState, useRef, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { gaEvent } from "./utils/analytics";
import { DAYS, MEALS, FOOD_PREFS, INGREDIENT_GROUPS, AGE_GROUPS, ALLERGY_OPTIONS, SHOW_COUPANG } from "./data/constants";
import { calcMealGoal, fmtN } from "./utils/nutrition";
import { getMinAgeIndex, generateWeekPlan, pickOne, pickTwoSides, handleReplaceItem } from "./utils/mealPicker";
import { RICE_DB } from "./data/riceDB";
import { SOUP_DB } from "./data/soupDB";
import { NutriBar } from "./components/NutriBar";
import { MealItemCard } from "./components/MealItemCard";
import { RecipeView } from "./components/RecipeView";
import { ShoppingList } from "./components/ShoppingList";
import PrivacyPolicy from "./components/PrivacyPolicy.jsx";
import AboutPage from "./components/AboutPage.jsx";
import TermsPage from "./components/TermsPage.jsx";
import { getCoupangLink } from "./data/coupangLinks";
import BlogPost from "./blog/BlogPost";
import BlogList from "./blog/BlogList";

const NUTRITION_GUIDES = [
  {
    emoji: "🍼", label: "영아 (0~2세)", color: "#f9a8d4",
    title: "이유식·죽 중심의 부드러운 식단",
    points: [
      "생후 6개월부터 이유식을 시작하며, 쌀미음→야채죽→진밥 순서로 진행해요.",
      "철분이 풍부한 쇠고기, 닭고기를 곱게 갈아 이유식에 활용하세요.",
      "계란·우유·밀 등 주요 알레르기 식품은 한 번에 하나씩 도입하고 반응을 살펴보세요.",
      "돌 이전에는 꿀·생우유·염분·설탕을 주지 않아요.",
      "하루 단백질 목표: 15g / 칼슘: 400mg / 철분: 6mg",
    ],
  },
  {
    emoji: "🐣", label: "유아 (3~5세)", color: "#fdba74",
    title: "다양한 식재료 경험과 편식 예방",
    points: [
      "밥·국·반찬 형태의 규칙적인 식사 패턴을 만들어주세요.",
      "색깔 채소(당근·브로콜리·파프리카)를 매일 1가지 이상 포함해요.",
      "편식하는 아이에게는 좋아하는 음식과 섞어서 조리하면 효과적이에요.",
      "성장에 필요한 칼슘 보충을 위해 우유·두부·멸치를 자주 활용하세요.",
      "하루 단백질 목표: 20g / 칼슘: 600mg / 철분: 7mg",
    ],
  },
  {
    emoji: "🎒", label: "초등 저학년 (6~8세)", color: "#86efac",
    title: "뼈 성장·집중력을 위한 균형 식단",
    points: [
      "뼈 성장을 위한 칼슘 섭취가 중요해지는 시기예요. 하루 700mg을 목표로 해요.",
      "아침 식사를 거르지 않도록 영양 밀도 높은 메뉴를 준비하면 집중력에 도움이 돼요.",
      "철분 결핍 빈혈 예방을 위해 쇠고기·달걀·시금치를 주 3회 이상 활용하세요.",
      "비타민C(귤·파프리카)와 함께 철분 식품을 먹으면 흡수율이 올라가요.",
      "하루 단백질 목표: 30g / 칼슘: 700mg / 철분: 8mg",
    ],
  },
  {
    emoji: "📚", label: "초등 고학년 (9~11세)", color: "#93c5fd",
    title: "활동량 증가에 맞춘 에너지 보충",
    points: [
      "운동량이 늘어나는 시기로 탄수화물(밥·고구마·고)과 단백질(닭·계란·두부)을 충분히 챙겨요.",
      "성장 급등기가 시작될 수 있어 칼슘 섭취를 하루 800mg 이상으로 높여가세요.",
      "패스트푸드·가공식품은 주 1~2회 이내로 제한하고 나트륨 섭취를 줄여요.",
      "충분한 식이섬유(야채·현미·콩류) 섭취로 변비를 예방해요.",
      "하루 단백질 목표: 40g / 칼슘: 800mg / 철분: 10mg",
    ],
  },
  {
    emoji: "🏃", label: "청소년 (12~18세)", color: "#c4b5fd",
    title: "급성장기, 칼슘·철분이 핵심",
    points: [
      "급성장기에 뼈 밀도를 높이는 시기로 칼슘이 하루 1,000mg으로 가장 많이 필요해요.",
      "여학생은 생리 시작 후 철분 결핍에 주의하고 적색육·달걀·해조류를 자주 먹어요.",
      "뇌 활동·수험 에너지를 위해 아침 식사와 단백질 보충이 필수예요.",
      "탄산음료·고당 식품 대신 물·유제품·과일로 수분과 영양을 채워요.",
      "하루 단백질 목표: 55g / 칼슘: 1,000mg / 철분: 14mg",
    ],
  },
];

function NutritionGuide() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#d94f00", marginBottom: 8 }}>📖 연령별 영양 가이드</div>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
        아이 성장 단계별 영양 목표와 식단 팁을 확인해보세요.
      </div>
      {NUTRITION_GUIDES.map((g, i) => (
        <div key={g.label} style={{ marginBottom: 8 }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: open === i ? "14px 14px 0 0" : 14, background: g.color + "33", border: `1px solid ${g.color}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
          >
            <span style={{ fontSize: 20 }}>{g.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>{g.label}</div>
              <div style={{ fontSize: 12, color: "#555" }}>{g.title}</div>
            </div>
            <span style={{ fontSize: 13, color: "#888" }}>{open === i ? "▲" : "▼"}</span>
          </button>
          {open === i && (
            <div style={{ background: "#fff", border: `1px solid ${g.color}`, borderTop: "none", borderRadius: "0 0 14px 14px", padding: "12px 14px" }}>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {g.points.map((pt, j) => (
                  <li key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7, fontSize: 13, color: "#333", lineHeight: 1.75 }}>
                    <span style={{ color: g.color.replace("33", ""), flexShrink: 0, marginTop: 2 }}>●</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
      <div style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginTop: 8 }}>
        ※ 한국 영양학회 기준 참고 / 정확한 영양 진단은 전문의와 상담하세요
      </div>
    </div>
  );
}

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

const DAY_DOW = { 월:1, 화:2, 수:3, 목:4, 금:5, 토:6, 일:0 };
const DAY_KOR = ["일","월","화","수","목","금","토"];

function getDateForDay(dayKor) {
  const today = new Date();
  const todayDow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((todayDow + 6) % 7));
  const target = new Date(monday);
  target.setDate(monday.getDate() + ((DAY_DOW[dayKor] + 6) % 7));
  return target;
}
function formatDateLabel(d) {
  return `${d.getMonth()+1}.${d.getDate()} (${DAY_KOR[d.getDay()]})`;
}
function formatDateFile(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const THIS_YEAR = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: THIS_YEAR - 2008 + 1 }, (_, i) => 2008 + i);
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
  const navigate = useNavigate();

  // ── core state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState(() => {
    try {
      if (JSON.parse(localStorage.getItem("mp_weekplan") || "null")) return "planner";
      if (localStorage.getItem("mp_landing_seen") === "true") return "profile";
      return "landing";
    } catch {
      return localStorage.getItem("mp_landing_seen") === "true" ? "profile" : "landing";
    }
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
  const [viewMode,       setViewMode]      = useState("daily"); // "daily" | "weekly"

  // ── onboarding ────────────────────────────────────────────────────────────
  const [showOnboarding,  setShowOnboarding]  = useState(false);
  const [onboardingSlide, setOnboardingSlide] = useState(0);

  // ── landing ───────────────────────────────────────────────────────────────
  const [sampleMeal, setSampleMeal] = useState(() => ({
    rice:  pickOne(RICE_DB, [], [], [], 1),
    soup:  pickOne(SOUP_DB, [], [], [], 1),
    sides: pickTwoSides([], [], [], 1),
  }));
  const [showCta,            setShowCta]            = useState(false);
  const [landingChecked,     setLandingChecked]     = useState([]);
  const [plannerShopChecked, setPlannerShopChecked] = useState([]);
  const [plannerShopScope,   setPlannerShopScope]   = useState("today");

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
  // ── localStorage 안전 래퍼 ────────────────────────────────────────────────
  const safeSet = (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch (e) { console.warn("localStorage 저장 실패:", key, e); }
  };

  const toggleArr = (setArr, val, key) => setArr(prev => {
    const next = prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val];
    if (key) safeSet(key, next);
    return next;
  });
  const toggleCheck = ing => setCheckedItems(prev => {
    const next = prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing];
    safeSet("mp_checked", next);
    return next;
  });
  const ms = m => MEAL_INFO[m] || MEAL_INFO["저녁"];

  const dailySaveRef  = useRef(null);
  const weeklySaveRef = useRef(null);
  const formRef       = useRef(null);

  const handleSaveImage = async (ref, filename) => {
    const view = filename.includes('주간') ? 'weekly' : 'daily';
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    let canvas;
    try {
      const { default: html2canvas } = await import("html2canvas");
      canvas = await html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    } catch (err) {
      console.error("html2canvas failed:", err);
      gaEvent('save_image_error', {
        view, reason: err?.message?.substring(0, 100) || 'canvas_error',
        is_ios: isIOS, stage: 'canvas',
      });
      alert("이미지 생성에 실패했어요. 다시 시도해주세요.");
      return;
    }

    if (isIOS) {
      try {
        const win = window.open();
        if (!win) {
          gaEvent('save_image_error', {
            view, reason: 'popup_blocked', is_ios: true, stage: 'legacy_popup'
          });
          alert("팝업이 차단되어 저장할 수 없어요. 팝업 허용 후 다시 시도해주세요.");
          return;
        }

        const dataUrl = canvas.toDataURL('image/png');

        win.document.write(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>우리 아이 식단표 - 길게 눌러 저장</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #fff; padding: 0; }
    .guide { position: sticky; top: 0; background: #FFF4ED; padding: 16px; text-align: center; font-size: 15px; font-weight: 700; color: #6B2F0A; border-bottom: 1px solid #FFD9C0; z-index: 10; }
    .img-wrap { padding: 16px; text-align: center; }
    img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .hint { padding: 16px; text-align: center; font-size: 12px; color: #888; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="guide">📸 이미지를 길게 눌러<br>"사진에 저장"을 선택하세요</div>
  <div class="img-wrap"><img src="${dataUrl}" alt="우리 아이 식단표"></div>
  <div class="hint">💡 메뉴가 안 뜨면 화면을 캡처(스크린샷)해도 됩니다</div>
</body>
</html>`);
        win.document.close();

        gaEvent('save_image', { view, method: 'ios_legacy' });
      } catch (err) {
        console.error("iOS legacy save failed:", err);
        gaEvent('save_image_error', {
          view, reason: err.message?.substring(0, 100) || 'legacy_failed',
          is_ios: true, stage: 'legacy',
        });
        alert("이미지 저장에 실패했어요. 다시 시도해주세요.");
      }
      return;
    }

    try {
      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
      gaEvent('save_image', { view, method: 'download' });
    } catch (err) {
      console.error("Download failed:", err);
      gaEvent('save_image_error', {
        view, reason: err.message?.substring(0, 100),
        is_ios: false, stage: 'download',
      });
      alert("이미지 저장에 실패했어요. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init('b6e09cf5c3a307c2db30c02d06258e2c');
    }
  }, []);

  useEffect(() => {
    if (step !== "landing") return;
    const t = setTimeout(() => setShowCta(true), 3000);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step === "landing") gaEvent('landing_view', {});
  }, [step]);

  const handleKakaoShare = () => {
    gaEvent('share_kakao');
    if (!window.Kakao) return;
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '우리 아이 이번 주 식단표 완성! 🍱',
        description: '균형잡힌 한 주 식단을 클릭 한 번으로 완성했어요. 우리아이 식단표 앱으로 만들어보세요!',
        imageUrl: 'https://mealplanner365.co.kr/og-image.png',
        imageWidth: 800,
        imageHeight: 400,
        link: {
          mobileWebUrl: 'https://mealplanner365.co.kr',
          webUrl: 'https://mealplanner365.co.kr',
        },
      },
      buttons: [
        {
          title: '식단표 만들러 가기',
          link: {
            mobileWebUrl: 'https://mealplanner365.co.kr',
            webUrl: 'https://mealplanner365.co.kr',
          },
        },
      ],
    });
  };

  const handleRegenDay = () => {
    gaEvent('meal_regen_day');
    const minAgeIndex = getMinAgeIndex(selectedAges);
    setWeekPlan(prev => {
      if (!prev?.[activeDay]) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      mealsInPlan.forEach(m => {
        if (!next[activeDay][m]) return;
        const rice  = pickOne(RICE_DB, selectedFoods, selectedIngreds, [], minAgeIndex, allergenIngredients, avoidedIngreds);
        const soup  = pickOne(SOUP_DB, selectedFoods, selectedIngreds, [], minAgeIndex, allergenIngredients, avoidedIngreds);
        const sides = pickTwoSides(selectedFoods, selectedIngreds, [], minAgeIndex, allergenIngredients, avoidedIngreds);
        next[activeDay][m] = { rice, soup, sides };
      });
      safeSet("mp_weekplan", next);
      return next;
    });
  };

  // ── onboarding render ─────────────────────────────────────────────────────
  const finishOnboarding = () => {
    gaEvent('onboarding_complete');
    try { localStorage.setItem("mp_onboarding_done", "1"); } catch(e) { console.warn("storage fail", e); }
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
    if (ages.length)  { setAges(ages);   safeSet("mp_ages", ages);  }
    setAllergies(algys);
    if (foods.length) { setFoods(foods); safeSet("mp_foods", foods); }
  };

  const loadProfileIntoEdit = (idx, allProfiles) => {
    const p = allProfiles[idx];
    setEditBirthYear(p?.birthYear     || "");
    setEditBirthMonth(p?.birthMonth   || "");
    setEditAllergies(p?.allergies     || []);
    setEditAvoids(p?.avoidedIngreds   || []);
    setEditFoodPrefs(p?.foodPrefs     || []);
  };

  const hasCurrentEdits = () =>
    editBirthYear || editBirthMonth || editAllergies.length > 0 || editAvoids.length > 0 || editFoodPrefs.length > 0;

  const handleProfileTabClick = (idx) => {
    let currentProfiles = profiles;
    if (hasCurrentEdits() || profiles[profileTab]) {
      currentProfiles = saveCurrentProfile();
    }
    setProfileTab(idx);
    loadProfileIntoEdit(idx, currentProfiles);
    if (currentProfiles[idx]) applyAllProfiles(currentProfiles);
  };

  const handleAddProfileTab = () => {
    gaEvent('profile_add');
    let currentProfiles = profiles;
    if (hasCurrentEdits() || profiles[profileTab]) {
      currentProfiles = saveCurrentProfile();
    }
    setProfileTab(currentProfiles.length);
    setEditBirthYear(""); setEditBirthMonth("");
    setEditAllergies([]); setEditAvoids([]); setEditFoodPrefs([]);
  };

  const handleResetProfile = (idx) => {
    if (!window.confirm("이 프로필을 초기화할까요?")) return;
    const next = profiles.filter((_, i) => i !== idx);
    setProfiles(next);
    safeSet("mp_profiles", next);
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
    safeSet("mp_profiles", next);
    return next;
  };

  const handleNextFromProfile = () => {
    const hasData = editBirthYear || editBirthMonth || editAllergies.length > 0 || editAvoids.length > 0 || editFoodPrefs.length > 0;
    if (hasData || profiles[profileTab]) {
      applyAllProfiles(saveCurrentProfile());
    } else {
      applyAllProfiles(profiles);
    }
    gaEvent('step_profile_complete');
    setStep("mealtype");
  };

  const handleQuickStart = () => {
    gaEvent('step_quickstart');
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
      setIngreds(prev => { const next = [...prev, t]; safeSet("mp_ingreds", next); return next; });
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
      try {
        const plan = generateWeekPlan(selectedFoods, selectedIngreds, selectedAges, allergenIngredients, avoidedIngreds, mealsToUse);
        setWeekPlan(plan);
        safeSet("mp_weekplan", plan);
        setActiveMeal(mealsToUse[0]);
        setStep("planner");
        gaEvent('meal_generate', { age_groups: selectedAges.join(','), meal_count: mealsToUse.length });
      } catch (e) {
        console.error("식단 생성 오류:", e);
        alert("식단 생성 중 오류가 발생했어요. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    }, 2400);
  };

  const onReplaceItem = (type, mealKey = activeMeal) => {
    gaEvent('meal_replace_item', { item_type: type });
    if (!weekPlan?.[activeDay]?.[mealKey]) return;
    const minAgeIndex = getMinAgeIndex(selectedAges);
    setWeekPlan(prev => {
      const next = handleReplaceItem(prev, activeDay, mealKey, type, selectedFoods, selectedIngreds, minAgeIndex, allergenIngredients, avoidedIngreds);
      safeSet("mp_weekplan", next);
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

  // ── Step 0: 랜딩 ──────────────────────────────────────────────────────────
  const renderLandingStep = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day   = today.getDate();
    const menuItems = [
      { emoji: "🍚", name: sampleMeal.rice?.name },
      { emoji: "🥣", name: sampleMeal.soup?.name },
      { emoji: "🥗", name: sampleMeal.sides?.[0]?.name },
      { emoji: "🍳", name: sampleMeal.sides?.[1]?.name },
    ].filter(item => item.name);
    const sampleIngreds = [...new Set([
      ...(sampleMeal.rice?.ingredients  || []),
      ...(sampleMeal.soup?.ingredients  || []),
      ...(sampleMeal.sides || []).flatMap(s => s?.ingredients || []),
    ])];
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#FFF4ED", borderRadius: 20, padding: 16 }}>
          {/* 배지 */}
          <div style={{ display: "inline-block", background: "#FFD9C0", color: "#6B2F0A", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
            오늘의 추천
          </div>
          {/* 제목 */}
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4, marginBottom: 4 }}>우리 아이를 위한</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4, marginBottom: 8 }}>{month}월 {day}일 식단</div>
          <div style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>오늘 뭐 먹이지 — 3초 만에 해결</div>
          {/* 메뉴 리스트 */}
          <div style={{ background: "#FFFFFF", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
            {menuItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: i < menuItems.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                <span style={{ fontSize: 15, color: "#333", fontWeight: 500 }}>{item.name}</span>
              </div>
            ))}
          </div>
          {SHOW_COUPANG && (<>
          {/* 구분선 */}
          <hr style={{ border: "none", borderTop: "1px solid #f0e0e0", margin: "0 0 16px" }} />
          {/* 장보기 카드 */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e55" }}>🛒 이 식단의 식재료</div>
              <div style={{ fontSize: 10, color: "#bbb" }}>클릭 시 쿠팡 로켓프레시 ↗</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {sampleIngreds.map(ing => {
                const link = getCoupangLink(ing);
                const checked = landingChecked.includes(ing);
                const baseStyle = { borderRadius: 8, padding: "4px 9px", fontSize: 12, display: "flex", alignItems: "center", gap: 3 };
                return link ? (
                  <a key={ing}
                    href={link}
                    target="_blank" rel="noreferrer"
                    onClick={e => {
                      e.preventDefault();
                      setLandingChecked(prev => prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]);
                      gaEvent('coupang_click', { ingredient: ing, list: 'landing' });
                      window.open(link, "_blank");
                    }}
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
          </div>
          {/* 공정위 문구 */}
          <div style={{ fontSize: 10, color: "#888", lineHeight: 1.6, marginBottom: 16 }}>
            이 페이지에는 쿠팡 파트너스 활동의 일환으로 수수료를 제공받는 링크가 포함되어 있습니다.
          </div>
          </>)}
          {/* CTA */}
          <div style={{ opacity: showCta ? 1 : 0, transition: "opacity 0.4s", marginBottom: 10 }}>
            <button
              onClick={() => { gaEvent('landing_cta_click', {}); localStorage.setItem("mp_landing_seen", "true"); setStep("profile"); }}
              style={{ width: "100%", background: "#FF6B6B", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              🥢 우리 아이 맞춤 식단 만들기 →
            </button>
          </div>
          {/* 새로고침 */}
          <div style={{ opacity: showCta ? 1 : 0, transition: "opacity 0.4s", textAlign: "center" }}>
            <button
              onClick={() => { gaEvent('landing_refresh_click', {}); setSampleMeal({ rice: pickOne(RICE_DB, [], [], [], 1), soup: pickOne(SOUP_DB, [], [], [], 1), sides: pickTwoSides([], [], [], 1) }); }}
              style={{ background: "transparent", border: "none", color: "#888", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
            >
              🔄 다른 식단 보기
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Planner 인라인 장보기 카드 ────────────────────────────────────────────
  const renderPlannerShopCard = () => {
    if (!SHOW_COUPANG) return null;
    const ingreds = plannerShopScope === "today"
      ? [...new Set(
          mealsInPlan.flatMap(m =>
            [weekPlan[activeDay]?.[m]?.rice,
             weekPlan[activeDay]?.[m]?.soup,
             ...(weekPlan[activeDay]?.[m]?.sides || [])]
            .filter(Boolean).flatMap(i => i.ingredients || [])
          )
        )]
      : [...new Set(
          DAYS.flatMap(d =>
            mealsInPlan.flatMap(m =>
              [weekPlan[d]?.[m]?.rice,
               weekPlan[d]?.[m]?.soup,
               ...(weekPlan[d]?.[m]?.sides || [])]
              .filter(Boolean).flatMap(i => i.ingredients || [])
            )
          )
        )];
    return (
      <div style={{ background: "#FFF4ED", borderRadius: 16, padding: "14px", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#e55", marginBottom: 3 }}>🛒 이 식단의 식재료 ({ingreds.length}종)</div>
        <div style={{ fontSize: 10, color: "#bbb", marginBottom: 10 }}>클릭 1번으로 쿠팡 로켓프레시 ↗</div>
        <div style={{ display: "flex", background: "#f0f0f0", borderRadius: 20, padding: 2, width: "fit-content", marginBottom: 10 }}>
          {[["today", "오늘"], ["week", "이번주"]].map(([val, label]) => (
            <button key={val} onClick={() => { setPlannerShopScope(val); gaEvent('shop_scope_change', { scope: val }); }}
              style={{ padding: "5px 14px", borderRadius: 18, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: plannerShopScope === val ? "#FF6B6B" : "transparent", color: plannerShopScope === val ? "#fff" : "#888", transition: "all 0.15s" }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {ingreds.map(ing => {
            const link = getCoupangLink(ing);
            const checked = plannerShopChecked.includes(ing);
            const baseStyle = { borderRadius: 8, padding: "4px 9px", fontSize: 12, display: "flex", alignItems: "center", gap: 3 };
            return link ? (
              <a key={ing}
                href={link}
                target="_blank" rel="noreferrer"
                onClick={e => {
                  e.preventDefault();
                  setPlannerShopChecked(prev => prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]);
                  gaEvent('coupang_click', { ingredient: ing, list: 'planner_inline' });
                  window.open(link, "_blank");
                }}
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
        <div style={{ fontSize: 10, color: "#888", lineHeight: 1.6 }}>
          이 페이지에는 쿠팡 파트너스 활동의 일환으로 수수료를 제공받는 링크가 포함되어 있습니다.
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
          <div style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>아이 정보를 저장하면 다음부터 바로 시작할 수 있어요</div>
        </div>

        {/* CTA Button */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => {
              gaEvent('profile_scroll_cta_click', { location: 'hero' });
              formRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            style={{ background: "#ff6b6b", color: "#fff", fontSize: 19, fontWeight: 700, padding: "16px 32px", borderRadius: 12, border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(255,107,107,0.3)", width: "100%", fontFamily: "inherit", transition: "transform 0.15s" }}
          >
            🍱 지금 우리아이 식단표 만들기 →
          </button>
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
                <div key={i} style={{ fontSize: 13, color: "#555", marginBottom: 5, lineHeight: 1.6 }}>
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
        <div ref={formRef} style={{ background: "#fff", borderRadius: 18, padding: 18, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.08)", border: "1.5px solid #ffd0b0", position: "relative" }}>
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
            <div style={{ fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 10 }}>📅 생년월일</div>
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
            <div style={{ fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 10 }}>우리 아이가 피해야 할 것이 있나요?</div>
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
            <div style={{ fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 4 }}>우리 아이가 싫어하는 재료가 있나요?</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>선택하면 해당 재료가 든 메뉴는 식단에서 자동 제외돼요</div>
            <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexWrap: "wrap", gap: 5, padding: "8px", border: "1px solid #f0f0f0", borderRadius: 12, background: "#fafafa" }}>
              {INGREDIENT_GROUPS.flatMap(grp => grp.items).map(item => {
                const sel = editAvoids.includes(item.n);
                return (
                  <button key={item.n}
                    onClick={() => setEditAvoids(prev => prev.includes(item.n) ? prev.filter(x => x !== item.n) : [...prev, item.n])}
                    style={{ padding: "5px 10px", borderRadius: 16, fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, background: sel ? "#fef3c7" : "#fff", color: sel ? "#b45309" : "#888", border: sel ? "1.5px solid #d97706" : "1px solid #ddd", fontWeight: sel ? 700 : 500 }}>
                    {item.e} {item.n}
                  </button>
                );
              })}
            </div>
            {editAvoids.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 13, color: "#d97706", fontWeight: 700 }}>
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

        <NutritionGuide />
      </div>
    );
  };

  // ── Step 2: 식사 맞춤화 ───────────────────────────────────────────────────
  const renderMealtypeStep = () => (
    <div>
      {renderProgress("mealtype")}

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#333", marginBottom: 6 }}>어떤 식사를 계획하시나요? 🍽️</div>
        <div style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>필요한 식사만 선택하면 식단이 더 간단해져요</div>
      </div>

      {/* Meal selection */}
      <div style={{ background: "#fff", borderRadius: 18, padding: 18, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.08)", border: "1px solid #ffe4e0" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#e55", marginBottom: 4 }}>🍽️ 식사 선택</div>
        <div style={{ fontSize: 13, color: "#777", marginBottom: 12, fontWeight: 500 }}>복수 선택 가능</div>
        <div style={{ display: "flex", gap: 8 }}>
          {MEALS.map(m => {
            const info = ms(m);
            const sel = selectedMeals.includes(m);
            return (
              <button key={m} onClick={() => {
                setSelectedMeals(prev => {
                  const next = prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m];
                  const ordered = MEALS.filter(meal => next.includes(meal));
                  safeSet("mp_meals", ordered);
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
          <div style={{ marginTop: 10, fontSize: 13, color: "#ef4444", textAlign: "center", fontWeight: 600 }}>최소 1개 이상 선택해주세요</div>
        )}
      </div>

      {/* Food preferences */}
      <div style={{ background: "#fff", borderRadius: 18, padding: 18, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.07)", border: "1px solid #ffe4e0" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#e55", marginBottom: 2 }}>좋아하는 음식이 있나요?</div>
        <div style={{ fontSize: 13, color: "#777", marginBottom: 10, fontWeight: 500 }}>여러 개 선택 가능 · 없으면 전체 반영</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {FOOD_PREFS.map(f => (
            <button key={f.id} onClick={() => toggleArr(setFoods, f.id, "mp_foods")}
              style={{ padding: "8px 13px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "inherit", background: selectedFoods.includes(f.id) ? "#ff6b6b" : "#fff8f0", color: selectedFoods.includes(f.id) ? "#fff" : "#666", border: selectedFoods.includes(f.id) ? "1px solid #ff6b6b" : "1px solid #ddd", fontWeight: selectedFoods.includes(f.id) ? 700 : 500 }}>
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

      {/* 끼니별 영양 포인트 */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#d94f00", marginBottom: 8 }}>⏰ 끼니별 영양 포인트</div>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>각 끼니는 아이의 성장과 학습에 서로 다른 역할을 해요.</div>
        {[
          { icon: "🌅", meal: "아침", bg: "#fffbeb", border: "#fde68a", text: "#92400e", tip: "아침 결식은 집중력·기억력 저하로 이어져요.", detail: "복합 탄수화물(잡곡밥, 고구마)과 단백질(달걀, 두유)을 함께 제공하면 혈당이 안정적으로 유지되어 오전 내내 집중력이 높아집니다." },
          { icon: "☀️", meal: "점심", bg: "#f0fdf4", border: "#bbf7d0", text: "#14532d", tip: "하루 에너지의 30~35%를 점심 한 끼에 채워요.", detail: "밥·국·반찬 2가지로 구성된 균형식이 이상적입니다. 철분과 아연이 풍부한 쇠고기, 굴, 견과류를 활용해 보세요." },
          { icon: "🌙", meal: "저녁", bg: "#eff6ff", border: "#bfdbfe", text: "#1e3a8a", tip: "소화를 돕고 수면 질을 높이는 저녁 식단이 중요해요.", detail: "트립토판이 풍부한 두부, 바나나, 우유는 숙면을 돕고 성장호르몬 분비를 촉진합니다. 튀긴 음식보다 찜·조림 요리를 권장해요." },
        ].map(({ icon, meal, bg, border, text, tip, detail }) => (
          <div key={meal} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: "13px 14px", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: text }}>{meal} — {tip}</span>
            </div>
            <div style={{ fontSize: 12, color: "#555", lineHeight: 1.75 }}>{detail}</div>
          </div>
        ))}
      </div>

      <NutritionGuide />
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
        <div style={{ fontSize: 13, color: "#555" }}>지금 있는 재료로 식단을 짜드려요!</div>
        <div style={{ fontSize: 13, color: "#555" }}>없는 재료는 나중에 장보기 목록에서 쿠팡으로 바로 구매할 수 있어요 🛒</div>
      </div>

      {/* Ingredient groups */}
      <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.07)", border: "1px solid #ffe4e0" }}>
        {INGREDIENT_GROUPS.map(grp => (
          <div key={grp.group} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 7 }}>{grp.group}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {grp.items.map(item => (
                <button key={item.n} onClick={() => toggleArr(setIngreds, item.n, "mp_ingreds")}
                  style={{ padding: "7px 11px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "inherit", background: selectedIngreds.includes(item.n) ? "#ff8e53" : "#fff8f0", color: selectedIngreds.includes(item.n) ? "#fff" : "#666", border: selectedIngreds.includes(item.n) ? "1px solid #ff8e53" : "1px solid #ddd", fontWeight: selectedIngreds.includes(item.n) ? 700 : 500 }}>
                  {item.e} {item.n}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Custom input */}
        <div style={{ paddingTop: 12, borderTop: "1px dashed #f0e0d0" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 7 }}>✏️ 직접 입력</div>
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
                  <button onClick={() => setIngreds(prev => { const next = prev.filter(v => v !== i); safeSet("mp_ingreds", next); return next; })}
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
          <div style={{ fontSize: 13, fontWeight: 700, color: "#e55", marginBottom: 7 }}>✅ 선택된 재료 ({selectedIngreds.length}개)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {selectedIngreds.map(i => (
              <span key={i} style={{ background: "#fff", border: "1px solid #ffc0a0", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#e55", display: "flex", alignItems: "center", gap: 3 }}>
                {i}
                <button onClick={() => setIngreds(prev => { const next = prev.filter(v => v !== i); safeSet("mp_ingreds", next); return next; })}
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
          <div style={{ fontSize: 13, color: "#b45309", fontWeight: 700 }}>기피 재료 제외 중: {[...new Set(avoidedIngreds)].join(", ")}</div>
        </div>
      )}

      {/* Allergy notice */}
      {selectedAllergies.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 14, padding: "12px 14px", marginBottom: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 3 }}>알레르기 주의사항</div>
            <div style={{ fontSize: 13, color: "#7f1d1d", lineHeight: 1.7 }}>심각한 알레르기가 있는 경우 반드시 전문의와 상담하세요.</div>
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

      {/* 재료별 핵심 영양 정보 */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#d94f00", marginBottom: 8 }}>🥦 재료별 핵심 영양 정보</div>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>냉장고 재료를 선택할 때 알아두면 유용한 영양 정보예요.</div>
        {[
          { emoji: "🥕", name: "당근", tip: "베타카로틴이 풍부해 면역력과 시력 발달에 도움. 기름과 함께 조리하면 흡수율이 높아져요." },
          { emoji: "🥦", name: "브로콜리", tip: "비타민C가 레몬의 2배, 칼슘·철분도 풍부. 살짝 데쳐 먹으면 영양 손실이 적어요." },
          { emoji: "🥚", name: "달걀", tip: "단백질·철분·아연이 골고루 들어있는 완전식품. 하루 1개면 충분한 영양을 보충할 수 있어요." },
          { emoji: "🐟", name: "생선류", tip: "EPA·DHA가 뇌 발달과 집중력에 도움. 주 2회 이상 식탁에 올려보세요." },
          { emoji: "🫘", name: "두부·콩류", tip: "식물성 단백질과 칼슘의 훌륭한 공급원. 유제품을 못 먹는 아이에게 좋은 대안이에요." },
          { emoji: "🍄", name: "버섯", tip: "식이섬유·비타민D가 풍부. 장 건강과 면역력 증진에 효과적이에요." },
        ].map(({ emoji, name, tip }) => (
          <div key={name} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 12px", background: "#f9fafb", borderRadius: 12, marginBottom: 6, border: "1px solid #f0f0f0" }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#444", marginBottom: 2 }}>{name}</div>
              <div style={{ fontSize: 12, color: "#666", lineHeight: 1.65 }}>{tip}</div>
            </div>
          </div>
        ))}
      </div>

      <NutritionGuide />
    </div>
  );

  // ── render ────────────────────────────────────────────────────────────────
  const mealsInPlan = weekPlan?.["월"] ? MEALS.filter(m => weekPlan["월"][m] !== undefined) : selectedMeals;
  const safeMeal    = mealsInPlan.includes(activeMeal) ? activeMeal : (mealsInPlan[0] || activeMeal);

  return (
    <Routes>
      <Route path="/about"      element={<AboutPage     onBack={() => navigate(-1)} />} />
      <Route path="/privacy"    element={<PrivacyPolicy onBack={() => navigate(-1)} />} />
      <Route path="/terms"      element={<TermsPage     onBack={() => navigate(-1)} />} />
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="*" element={
      <div style={{ minHeight: "100vh", background: "linear-gradient(150deg,#fff8f2 0%,#ffecd8 40%,#f8f0ff 100%)", fontFamily: "Georgia, serif" }}>
      {showOnboarding && renderOnboarding()}
      {renderLoadingOverlay()}

      {/* Header */}
      <div style={{ background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", padding: "14px 16px 10px", boxShadow: "0 4px 20px rgba(255,107,107,0.28)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🍱</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>우리 아이 주간 식단표</div>
            <div style={{ color: "rgba(255,255,255,0.92)", fontSize: 12 }}>밥 · 국 · 반찬 2가지 균형 식단</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button onClick={() => { gaEvent('help_open', {}); setOnboardingSlide(0); setShowOnboarding(true); }} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>❓</button>
            {(step === "planner" || step === "recipe") && (
              <button onClick={() => setStep("profile")} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>⚙️ 설정</button>
            )}
          </div>
        </div>
      </div>

      {/* Back bar */}
      {(step === "planner" || step === "recipe") && (
        <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setStep("profile")} style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, padding: 0 }}>← 설정으로</button>
          <div style={{ fontSize: 13, color: "#777" }}>{step === "planner" ? `${activeDay}요일 ${viewMode === "daily" ? "일간" : "주간"} 보기` : "조리법"}</div>
        </div>
      )}

      <div style={{ padding: "14px 12px 60px" }}>
        {step === "landing"  && renderLandingStep()}
        {step === "profile"  && renderProfileStep()}
        {step === "mealtype" && renderMealtypeStep()}
        {step === "fridge"   && renderFridgeStep()}

        {/* Planner */}
        {step === "planner" && weekPlan && (() => {
          const selGroups = AGE_GROUPS.filter(g => selectedAges.includes(g.id));
          const nMeals    = mealsInPlan.length || 1;

          const dailyNutri = mealsInPlan.reduce((acc, m) => {
            const meal = weekPlan[activeDay]?.[m];
            if (!meal) return acc;
            return [meal.rice, meal.soup, ...meal.sides].filter(Boolean).reduce((a, item) => ({
              protein: a.protein + (item.nutrition?.protein || 0),
              calcium: a.calcium + (item.nutrition?.calcium || 0),
              iron:    a.iron    + (item.nutrition?.iron    || 0),
              vitC:    a.vitC    + (item.nutrition?.vitC    || 0),
              fiber:   a.fiber   + (item.nutrition?.fiber   || 0),
              cal:     a.cal     + (item.cal || 0),
            }), acc);
          }, { protein: 0, calcium: 0, iron: 0, vitC: 0, fiber: 0, cal: 0 });

          return (
            <div>
              {/* 연령 배지 */}
              {selGroups.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {selGroups.map(g => <div key={g.id} style={{ background: `${g.color}28`, border: `1px solid ${g.color}`, borderRadius: 20, padding: "4px 11px", fontSize: 12, fontWeight: 700, color: "#444" }}>{g.emoji} {g.label}</div>)}
                  {selGroups.length > 1 && <div style={{ background: "#f3f4f6", borderRadius: 20, padding: "4px 11px", fontSize: 11, color: "#666" }}>평균 영양목표</div>}
                </div>
              )}

              {/* 일간/주간 토글 */}
              <div style={{ display: "flex", background: "#f0f0f0", borderRadius: 12, padding: 3, marginBottom: 12 }}>
                {[["daily","📅 일간 보기"],["weekly","📋 주간 보기"]].map(([mode, label]) => (
                  <button key={mode} onClick={() => { setViewMode(mode); gaEvent('view_mode_change', { mode }); }}
                    style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, background: viewMode === mode ? "#ff6b6b" : "transparent", color: viewMode === mode ? "#fff" : "#999", transition: "all 0.15s" }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* 요일 탭 */}
              <div style={{ display: "flex", gap: 5, marginBottom: 12, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                {DAYS.map(d => <button key={d} onClick={() => { setActiveDay(d); gaEvent('day_tab_click', { day: d }); }} style={{ minWidth: 36, padding: "6px 8px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, background: activeDay === d ? "#ff6b6b" : "#fff", color: activeDay === d ? "#fff" : "#ccc", border: activeDay === d ? "1px solid #ff6b6b" : "1px solid #eee", boxShadow: activeDay === d ? "0 2px 8px rgba(255,107,107,0.28)" : "none" }}>{d}</button>)}
              </div>

              {viewMode === "daily" ? (
                /* ── 일간 보기 ── */
                <div>
                  <div ref={dailySaveRef} style={{ background: "#fff", borderRadius: 16, padding: "14px 12px", border: "1px solid #f0f0f0" }}>
                    <div style={{ textAlign: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#ff6b6b" }}>🍱 우리 아이 주간 식단표</div>
                      <div style={{ fontSize: 15, color: "#666", marginTop: 2 }}>{formatDateLabel(getDateForDay(activeDay))} 식단</div>
                    </div>

                    {mealsInPlan.map(m => {
                      const meal = weekPlan[activeDay]?.[m];
                      if (!meal) return null;
                      const mStyle = ms(m);
                      const mealCal = [meal.rice, meal.soup, ...meal.sides].filter(Boolean)
                        .reduce((acc, item) => acc + (item.cal || 0), 0);
                      const items = [
                        { emoji: "🍚", label: "밥",    item: meal.rice,  type: "rice" },
                        { emoji: "🍲", label: "국",    item: meal.soup,  type: "soup" },
                        ...meal.sides.map((s, i) => ({ emoji: "🥗", label: `반찬${i + 1}`, item: s, type: `side${i}` })),
                      ];
                      return (
                        <div key={m} style={{ background: mStyle.bg, borderRadius: 14, padding: "13px 14px", marginBottom: 12, border: `1px solid ${mStyle.text}22` }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <span style={{ fontSize: 22 }}>{mStyle.icon}</span>
                              <span style={{ fontSize: 17, fontWeight: 700, color: mStyle.text }}>{m}</span>
                            </div>
                            <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>합계 {mealCal}kcal</span>
                          </div>
                          {items.map(({ emoji, label, item: it, type }) => it && (
                            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                              <span style={{ fontSize: 18, flexShrink: 0 }}>{emoji}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
                                <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{it.cal}kcal &nbsp;·&nbsp; 단백질 {it.nutrition?.protein ?? 0}g</div>
                              </div>
                              <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                                <button onClick={() => onReplaceItem(type, m)}
                                  style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid #e5e7eb", background: "#f3f4f6", color: "#888", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                  🔄 이 메뉴만 교체
                                </button>
                                <button onClick={() => { setViewRecipe(it); setStep("recipe"); gaEvent('view_recipe', { menu_name: it.name }); }}
                                  style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${mStyle.text}66`, background: "rgba(255,255,255,0.9)", color: mStyle.text, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                  조리법
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}

                    {/* 하루 영양 합계 */}
                    <div style={{ background: "#f8f8ff", borderRadius: 14, padding: "11px 13px", marginBottom: 10, border: "1px solid #ede9fe" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#444", marginBottom: 10 }}>🧬 오늘 하루 영양 합계</div>
                      <div style={{ display: "flex", gap: 7 }}>
                        <NutriBar label="단백질" value={dailyNutri.protein} goal={mealGoal.protein * nMeals} unit="g"  color="#6366f1" />
                        <NutriBar label="칼슘"   value={dailyNutri.calcium} goal={mealGoal.calcium * nMeals} unit="mg" color="#22c55e" />
                        <NutriBar label="철분"   value={dailyNutri.iron}    goal={mealGoal.iron * nMeals}    unit="mg" color="#f59e0b" />
                        <NutriBar label="비타민C" value={dailyNutri.vitC}   goal={mealGoal.vitC * nMeals}    unit="mg" color="#ef4444" />
                        <NutriBar label="식이섬유" value={dailyNutri.fiber} goal={mealGoal.fiber * nMeals}   unit="g"  color="#8b5cf6" />
                      </div>
                    </div>

                    {/* 워터마크 */}
                    <div style={{ textAlign: "center", paddingTop: 6, fontSize: 10, color: "#ccc" }}>
                      우리아이 식단표 앱 · mealplanner365.co.kr
                    </div>
                  </div>

                  {/* 장보기 목록 — renderPlannerShopCard()로 대체, 필요 시 아래 주석 해제 */}
                  {/* <ShoppingList meal={weekPlan[activeDay]?.[mealsInPlan[0]]} weekPlan={weekPlan} showWeeklyShop={showWeeklyShop} setShowWeeklyShop={setShowWeeklyShop} checkedItems={checkedItems} toggleCheck={toggleCheck} onClear={() => setCheckedItems([])} /> */}

                  {/* 버튼 */}
                  <div style={{ display: "flex", gap: 8, marginTop: 4, marginBottom: 12 }}>
                    <button onClick={handleRegenDay}
                      style={{ flex: 1, padding: "13px", borderRadius: 14, fontSize: 13, fontWeight: 700, background: "#fff", color: "#ff6b6b", border: "2px solid #ff6b6b", cursor: "pointer", fontFamily: "inherit" }}>
                      🔄 오늘 다시 뽑기
                    </button>
                    <button onClick={() => handleSaveImage(dailySaveRef, `식단표_${formatDateFile(getDateForDay(activeDay))}_${activeDay}.png`)}
                      style={{ flex: 1, padding: "13px", borderRadius: 14, fontSize: 13, fontWeight: 700, background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 12px rgba(255,107,107,0.3)" }}>
                      📸 오늘 식단 저장
                    </button>
                    <button onClick={handleKakaoShare} style={{ background: "#FEE500", color: "#3C1E1E", border: "none", borderRadius: 14, padding: "10px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", flexShrink: 0 }}>
                      <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png" alt="카카오" style={{ width: 20, height: 20 }} />
                      카카오톡 공유
                    </button>
                  </div>

                  {renderPlannerShopCard()}
                  <NutritionGuide />
                </div>
              ) : (
                /* ── 주간 보기 ── */
                <div>
                  {/* overflow 래퍼는 ref 바깥에 — html2canvas가 전체 7칸을 캡처할 수 있도록 */}
                  <div style={{ overflowX: "auto" }}>
                    <div ref={weeklySaveRef} style={{ background: "#fff", borderRadius: 16, padding: "16px 14px", border: "1px solid #f0f0f0", minWidth: "860px" }}>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "#e55", marginBottom: 12, textAlign: "center" }}>
                        🍱 {formatDateLabel(getDateForDay("월"))} ~ {formatDateLabel(getDateForDay("일"))} 식단
                      </div>
                      {selGroups.length > 0 && (
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12, justifyContent: "center" }}>
                          {selGroups.map(g => <div key={g.id} style={{ background: `${g.color}28`, border: `1px solid ${g.color}`, borderRadius: 20, padding: "4px 11px", fontSize: 12, fontWeight: 700, color: "#444" }}>{g.emoji} {g.label}</div>)}
                        </div>
                      )}
                      {/* 7칸 그리드 — overflow 없음, minWidth로 전체 표시 보장 */}
                      <div style={{ display: "flex", gap: 6 }}>
                        {DAYS.map(day => (
                          <div key={day}
                            onClick={() => { setActiveDay(day); setViewMode("daily"); }}
                            style={{ flex: 1, background: day === activeDay ? "#fff0ee" : "#fafafa", borderRadius: 12, padding: "10px 8px", border: day === activeDay ? "2px solid #ff8e53" : "1px solid #eee", cursor: "pointer" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: day === activeDay ? "#ff6b6b" : "#999", textAlign: "center", marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${day === activeDay ? "#ffd0b0" : "#eee"}` }}>
                              {day}요일
                            </div>
                            {mealsInPlan.map(m => {
                              const meal = weekPlan[day]?.[m];
                              if (!meal) return null;
                              const mStyle = ms(m);
                              return (
                                <div key={m} style={{ marginBottom: 8 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: mStyle.text, marginBottom: 3 }}>{mStyle.icon} {m}</div>
                                  {[meal.rice, meal.soup, ...meal.sides].filter(Boolean).map(item => (
                                    <div key={item.name} style={{ fontSize: 12, color: "#444", lineHeight: 1.6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                      · {item.name}
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      {/* 워터마크 */}
                      <div style={{ textAlign: "center", paddingTop: 12, fontSize: 11, color: "#ccc" }}>
                        우리아이 식단표 앱 · mealplanner365.co.kr
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={() => handleSaveImage(weeklySaveRef, `식단표_${formatDateFile(getDateForDay("월"))}_주간.png`)}
                      style={{ flex: 1, padding: "13px", borderRadius: 14, fontSize: 13, fontWeight: 700, background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 3px 12px rgba(255,107,107,0.3)" }}>
                      📸 주간 식단 저장
                    </button>
                    <button onClick={handleKakaoShare} style={{ background: "#FEE500", color: "#3C1E1E", border: "none", borderRadius: 14, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", flexShrink: 0 }}>
                      <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png" alt="카카오" style={{ width: 20, height: 20 }} />
                      카카오톡 공유
                    </button>
                  </div>

                  {renderPlannerShopCard()}
                  <NutritionGuide />
                </div>
              )}

              {/* 영양 정보 출처 */}
              <div style={{ marginTop: 16, padding: "12px 14px", background: "#f9f9f9", borderRadius: 12, border: "1px solid #eee" }}>
                <p style={{ fontSize: 11, color: "#999", lineHeight: 1.8, margin: 0 }}>
                  ⚠️ 영양 정보 출처: 식품의약품안전처 식품영양성분 DB, 한국영양학회 한국인 영양소 섭취기준(KDRI 2020)<br />
                  본 정보는 일반 참고용이며 의학적 진단을 대체하지 않습니다.
                </p>
              </div>
            </div>
          );
        })()}

        {step === "recipe"  && <RecipeView item={viewRecipe} onBack={() => setStep("planner")} />}

        {/* Footer */}
        {(
          <div style={{ marginTop: 20 }}>
            {/* 서비스 안내 */}
            <div style={{ background: "#f8f9ff", border: "1px solid #e0e7ff", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", marginBottom: 6 }}>ℹ️ 우리아이 식단표 서비스 안내</div>
              <p style={{ fontSize: 12, color: "#555", lineHeight: 1.8, margin: 0 }}>
                본 서비스는 영아(0~2세)부터 청소년(12~18세)까지 연령별 맞춤 주간 식단을 무료로 생성해드립니다.
                한국 영양학회 기준을 참고하여 밥·국·반찬 2가지 균형 식단을 제공하며, 알레르기 자동 필터 및 장보기 목록 기능을 포함합니다.
              </p>
            </div>
            {SHOW_COUPANG && (
            <div style={{ background: "#fff8f0", border: "1px solid #ffd0b0", borderRadius: 12, padding: "12px 16px", marginBottom: 10, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>📢</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e55", marginBottom: 5 }}>쿠팡파트너스 수수료 고지</div>
                <p style={{ fontSize: 12, color: "#555", lineHeight: 1.8, margin: 0 }}>
                  본 서비스의 장보기 링크는 쿠팡파트너스 활동의 일환으로 운영되며, 이를 통해 일정액의 수수료를 제공받습니다. 단, 상품 가격 및 구매 조건은 고객님께 동일하게 적용됩니다.
                </p>
              </div>
            </div>
            )}
            {/* 의료 면책 */}
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "10px 14px", marginBottom: 10 }}>
              <p style={{ fontSize: 12, color: "#78350f", lineHeight: 1.8, margin: 0 }}>
                ⚠️ <strong>의료 면책:</strong> 본 서비스의 식단 정보는 일반적인 참고 자료이며 의학적·영양학적 전문 진단을 대체하지 않습니다. 심각한 알레르기나 질환이 있는 경우 반드시 전문의와 상담하세요.
              </p>
            </div>
            {/* 운영자 정보 */}
            <div style={{ textAlign: "center", padding: "8px 0", marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "#888" }}>운영자: 남상빈 · <a href="mailto:skatkdqla173123@gmail.com" style={{ color: "#ff6b6b", textDecoration: "none" }}>skatkdqla173123@gmail.com</a></div>
            </div>
            {/* 메뉴 버튼 */}
            <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #eee" }}>
              <div style={{ display: "flex" }}>
                <button onClick={() => navigate("/about")} style={{ flex: 1, padding: "12px 4px", background: "#fff", border: "none", borderRight: "1px solid #eee", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>ℹ️</div>
                  <div style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>서비스 소개</div>
                </button>
                <button onClick={() => navigate("/terms")} style={{ flex: 1, padding: "12px 4px", background: "#fff", border: "none", borderRight: "1px solid #eee", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>📄</div>
                  <div style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>이용약관</div>
                </button>
                <button onClick={() => navigate("/privacy")} style={{ flex: 1, padding: "12px 4px", background: "#fff", border: "none", borderRight: "1px solid #eee", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>📋</div>
                  <div style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>개인정보처리방침</div>
                </button>
                <a href="mailto:skatkdqla173123@gmail.com" style={{ flex: 1, padding: "12px 4px", background: "#fff", textDecoration: "none", display: "block", textAlign: "center" }}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>💬</div>
                  <div style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>문의하기</div>
                </a>
              </div>
              <div style={{ borderTop: "1px solid #eee", display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => navigate("/blog")}
                  style={{ flex: 1, padding: "12px 4px", background: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}
                >
                  <div style={{ fontSize: 16, marginBottom: 3 }}>📝</div>
                  <div style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>식단 이야기</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    } />
    </Routes>
  );
}

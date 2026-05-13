import { AGE_ORDER, DAYS, MEALS } from "../data/constants";
import { RICE_DB } from "../data/riceDB";
import { SOUP_DB } from "../data/soupDB";
import { SIDE_DB } from "../data/sideDB";

export function getMinAgeIndex(ids) {
  if (!ids || ids.length === 0) return 0;
  const indices = ids.map(id => AGE_ORDER.indexOf(id)).filter(i => i >= 0);
  return indices.length > 0 ? Math.min(...indices) : 0;
}

export function isSafeForAge(item, minAgeIndex) {
  const idx = AGE_ORDER.indexOf(item.safeFor || "baby");
  return idx <= minAgeIndex;
}

export function isSafeForAllergy(item, allergenIngreds) {
  if (!allergenIngreds || allergenIngreds.length === 0) return true;
  return !item.ingredients.some(ing => allergenIngreds.includes(ing));
}

function isNotAvoided(item, avoidedIngreds) {
  if (!avoidedIngreds || avoidedIngreds.length === 0) return true;
  return !item.ingredients.some(ing => avoidedIngreds.includes(ing));
}

export function weightedRandom(scored) {
  const total = scored.reduce((s, x) => s + x.score, 0);
  if (total <= 0) return scored[scored.length - 1].item;
  let rand = Math.random() * total;
  for (const { item, score } of scored) {
    rand -= score;
    if (rand <= 0) return item;
  }
  return scored[scored.length - 1].item;
}

function scoreItem(item, prefs, ingreds, recentNames = [], recentIngreds = []) {
  let score = 10;

  // 최근 3일 나온 메뉴 → 점수 대폭 감소 (중복 방지 핵심)
  if (recentNames.includes(item.name)) score -= 25;

  // 최근 3일 나온 재료 포함 → 점수 감소
  const sharedIngreds = item.ingredients.filter(i => recentIngreds.includes(i));
  score -= sharedIngreds.length * 8;

  // 냉장고 재료 포함 → 점수 증가
  if (ingreds.length > 0) {
    score += item.ingredients.filter(i => ingreds.includes(i)).length * 20;
    if (prefs.length > 0 && item.tags && item.tags.some(t => prefs.includes(t))) score += 5;
  } else if (prefs.length > 0 && item.tags && item.tags.some(t => prefs.includes(t))) {
    score += 5;
  }

  // 점수가 0 이하가 되지 않도록 최솟값 보장
  return Math.max(score, 1);
}

export function pickOne(db, prefs, ingreds, usedNames = [], minAgeIndex = 0, allergenIngreds = [], avoidedIngreds = [], recentNames = [], recentIngreds = []) {
  const safe = db.filter(i => isSafeForAge(i, minAgeIndex) && isSafeForAllergy(i, allergenIngreds));
  const notAvoided = safe.filter(i => isNotAvoided(i, avoidedIngreds));
  const pool = notAvoided.length > 0 ? notAvoided : safe.length > 0 ? safe : db.filter(i => isSafeForAge(i, minAgeIndex));
  const unused = pool.filter(i => !usedNames.includes(i.name));
  const candidates = unused.length > 0 ? unused : pool.length > 0 ? pool : db.slice(0, 1);
  if (!candidates.length) return db[0];
  return weightedRandom(candidates.map(item => ({ item, score: scoreItem(item, prefs, ingreds, recentNames, recentIngreds) })));
}

export function pickTwoSides(prefs, ingreds, usedNames = [], minAgeIndex = 0, allergenIngreds = [], avoidedIngreds = [], recentNames = [], recentIngreds = []) {
  const safeP = SIDE_DB.filter(s => s.nutriType === "단백질" && isSafeForAge(s, minAgeIndex) && isSafeForAllergy(s, allergenIngreds));
  const safeV = SIDE_DB.filter(s => s.nutriType === "채소"   && isSafeForAge(s, minAgeIndex) && isSafeForAllergy(s, allergenIngreds));
  const baseP = safeP.filter(s => isNotAvoided(s, avoidedIngreds));
  const baseV = safeV.filter(s => isNotAvoided(s, avoidedIngreds));
  const poolP = (baseP.length > 0 ? baseP : safeP).filter(s => !usedNames.includes(s.name));
  const poolV = (baseV.length > 0 ? baseV : safeV).filter(s => !usedNames.includes(s.name));
  const candP = poolP.length > 0 ? poolP : (baseP.length > 0 ? baseP : safeP);
  const candV = poolV.length > 0 ? poolV : (baseV.length > 0 ? baseV : safeV);
  if (!candP.length && !candV.length) return [];
  const s1 = candP.length ? weightedRandom(candP.map(item => ({ item, score: scoreItem(item, prefs, ingreds, recentNames, recentIngreds) }))) : null;
  const candV2 = candV.filter(s => s.name !== s1?.name);
  const s2 = candV2.length ? weightedRandom(candV2.map(item => ({ item, score: scoreItem(item, prefs, ingreds, recentNames, recentIngreds) }))) : null;
  return [s1, s2].filter(Boolean);
}

// 최근 N일치 메뉴명·재료 추출 헬퍼
function getRecentHistory(plan, currentDay, days = 3) {
  const dayIndex = DAYS.indexOf(currentDay);
  const recentDays = DAYS.slice(Math.max(0, dayIndex - days), dayIndex);
  const recentNames = [];
  const recentIngreds = [];
  recentDays.forEach(d => {
    if (!plan[d]) return;
    Object.values(plan[d]).forEach(meal => {
      if (!meal) return;
      [meal.rice, meal.soup, ...(meal.sides || [])].filter(Boolean).forEach(item => {
        recentNames.push(item.name);
        (item.ingredients || []).forEach(ing => recentIngreds.push(ing));
      });
    });
  });
  return { recentNames, recentIngreds };
}

export function generateWeekPlan(prefs, ingreds, selectedAgeIds = [], allergenIngreds = [], avoidedIngreds = [], selectedMeals = ["아침","점심","저녁"]) {
  const minAgeIndex = getMinAgeIndex(selectedAgeIds);
  const mealsToGen = selectedMeals.length > 0 ? selectedMeals : MEALS;
  const plan = {};
  const usedRice = [], usedSoup = [], usedSides = [];

  DAYS.forEach(day => {
    plan[day] = {};
    // 이미 생성된 앞 날들 기준으로 최근 3일 히스토리 계산
    const { recentNames, recentIngreds } = getRecentHistory(plan, day, 3);

    mealsToGen.forEach(m => {
      const rice  = pickOne(RICE_DB, prefs, ingreds, usedRice,  minAgeIndex, allergenIngreds, avoidedIngreds, recentNames, recentIngreds);
      const soup  = pickOne(SOUP_DB, prefs, ingreds, usedSoup,  minAgeIndex, allergenIngreds, avoidedIngreds, recentNames, recentIngreds);
      const sides = pickTwoSides(prefs, ingreds, usedSides, minAgeIndex, allergenIngreds, avoidedIngreds, recentNames, recentIngreds);
      usedRice.push(rice.name);
      usedSoup.push(soup.name);
      sides.forEach(s => usedSides.push(s.name));
      plan[day][m] = { rice, soup, sides };
    });
  });
  return plan;
}

export function handleReplaceItem(prev, activeDay, activeMeal, type, prefs, ingreds, minAgeIndex, allergenIngreds, avoidedIngreds = []) {
  if (!prev?.[activeDay]?.[activeMeal]) return prev;
  const next = JSON.parse(JSON.stringify(prev));
  const meal = next[activeDay][activeMeal];

  // 교체 시에도 현재 주간 식단 기준 히스토리 반영
  const { recentNames, recentIngreds } = getRecentHistory(prev, activeDay, 3);

  if (type === "rice") {
    meal.rice = pickOne(RICE_DB, prefs, ingreds, [meal.rice?.name], minAgeIndex, allergenIngreds, avoidedIngreds, recentNames, recentIngreds);
  } else if (type === "soup") {
    meal.soup = pickOne(SOUP_DB, prefs, ingreds, [meal.soup?.name], minAgeIndex, allergenIngreds, avoidedIngreds, recentNames, recentIngreds);
  } else if (type === "side0") {
    const db = SIDE_DB.filter(s => s.nutriType === "단백질");
    meal.sides[0] = pickOne(db, prefs, ingreds, [meal.sides[0]?.name], minAgeIndex, allergenIngreds, avoidedIngreds, recentNames, recentIngreds) || meal.sides[0];
  } else if (type === "side1") {
    const db = SIDE_DB.filter(s => s.nutriType === "채소");
    meal.sides[1] = pickOne(db, prefs, ingreds, [meal.sides[1]?.name], minAgeIndex, allergenIngreds, avoidedIngreds, recentNames, recentIngreds) || meal.sides[1];
  }
  return next;
}

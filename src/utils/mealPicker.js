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
  let rand = Math.random() * total;
  for (const { item, score } of scored) {
    rand -= score;
    if (rand <= 0) return item;
  }
  return scored[scored.length - 1].item;
}

function scoreItem(item, prefs, ingreds) {
  let score = 1;
  if (ingreds.length > 0) {
    score += item.ingredients.filter(i => ingreds.includes(i)).length * 20;
    if (prefs.length > 0 && item.tags.some(t => prefs.includes(t))) score += 5;
  } else if (prefs.length > 0 && item.tags.some(t => prefs.includes(t))) {
    score += 5;
  }
  return score;
}

export function pickOne(db, prefs, ingreds, usedNames = [], minAgeIndex = 0, allergenIngreds = [], avoidedIngreds = []) {
  const safe = db.filter(i => isSafeForAge(i, minAgeIndex) && isSafeForAllergy(i, allergenIngreds));
  const notAvoided = safe.filter(i => isNotAvoided(i, avoidedIngreds));
  // fall back to safe (ignoring avoidance) if nothing passes
  const pool = notAvoided.length > 0 ? notAvoided : safe.length > 0 ? safe : db.filter(i => isSafeForAge(i, minAgeIndex));
  const unused = pool.filter(i => !usedNames.includes(i.name));
  const candidates = unused.length > 0 ? unused : pool.length > 0 ? pool : db.slice(0, 1);
  if (!candidates.length) return db[0];
  return weightedRandom(candidates.map(item => ({ item, score: scoreItem(item, prefs, ingreds) })));
}

export function pickTwoSides(prefs, ingreds, usedNames = [], minAgeIndex = 0, allergenIngreds = [], avoidedIngreds = []) {
  const safeP = SIDE_DB.filter(s => s.nutriType === "단백질" && isSafeForAge(s, minAgeIndex) && isSafeForAllergy(s, allergenIngreds));
  const safeV = SIDE_DB.filter(s => s.nutriType === "채소"   && isSafeForAge(s, minAgeIndex) && isSafeForAllergy(s, allergenIngreds));
  const baseP = safeP.filter(s => isNotAvoided(s, avoidedIngreds));
  const baseV = safeV.filter(s => isNotAvoided(s, avoidedIngreds));
  const poolP = (baseP.length > 0 ? baseP : safeP).filter(s => !usedNames.includes(s.name));
  const poolV = (baseV.length > 0 ? baseV : safeV).filter(s => !usedNames.includes(s.name));
  const candP = poolP.length > 0 ? poolP : (baseP.length > 0 ? baseP : safeP);
  const candV = poolV.length > 0 ? poolV : (baseV.length > 0 ? baseV : safeV);
  if (!candP.length && !candV.length) return [];
  const s1 = candP.length ? weightedRandom(candP.map(item => ({ item, score: scoreItem(item, prefs, ingreds) }))) : null;
  const candV2 = candV.filter(s => s.name !== s1?.name);
  const s2 = candV2.length ? weightedRandom(candV2.map(item => ({ item, score: scoreItem(item, prefs, ingreds) }))) : null;
  return [s1, s2].filter(Boolean);
}

export function generateWeekPlan(prefs, ingreds, selectedAgeIds = [], allergenIngreds = [], avoidedIngreds = []) {
  const minAgeIndex = getMinAgeIndex(selectedAgeIds);
  const plan = {};
  const usedRice = [], usedSoup = [], usedSides = [];
  DAYS.forEach(day => {
    plan[day] = {};
    MEALS.forEach(m => {
      const rice  = pickOne(RICE_DB, prefs, ingreds, usedRice,  minAgeIndex, allergenIngreds, avoidedIngreds);
      const soup  = pickOne(SOUP_DB, prefs, ingreds, usedSoup,  minAgeIndex, allergenIngreds, avoidedIngreds);
      const sides = pickTwoSides(prefs, ingreds, usedSides, minAgeIndex, allergenIngreds, avoidedIngreds);
      usedRice.push(rice.name);
      usedSoup.push(soup.name);
      sides.forEach(s => usedSides.push(s.name));
      plan[day][m] = { rice, soup, sides };
    });
  });
  return plan;
}

export function handleReplaceItem(prev, activeDay, activeMeal, type, prefs, ingreds, minAgeIndex, allergenIngreds, avoidedIngreds = []) {
  const next = JSON.parse(JSON.stringify(prev));
  const meal = next[activeDay][activeMeal];
  if (type === "rice") {
    meal.rice = pickOne(RICE_DB, prefs, ingreds, [meal.rice?.name], minAgeIndex, allergenIngreds, avoidedIngreds);
  } else if (type === "soup") {
    meal.soup = pickOne(SOUP_DB, prefs, ingreds, [meal.soup?.name], minAgeIndex, allergenIngreds, avoidedIngreds);
  } else if (type === "side0") {
    const db = SIDE_DB.filter(s => s.nutriType === "단백질");
    meal.sides[0] = pickOne(db, prefs, ingreds, [meal.sides[0]?.name], minAgeIndex, allergenIngreds, avoidedIngreds) || meal.sides[0];
  } else if (type === "side1") {
    const db = SIDE_DB.filter(s => s.nutriType === "채소");
    meal.sides[1] = pickOne(db, prefs, ingreds, [meal.sides[1]?.name], minAgeIndex, allergenIngreds, avoidedIngreds) || meal.sides[1];
  }
  return next;
}

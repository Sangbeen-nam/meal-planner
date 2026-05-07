import { AGE_GROUPS } from "../data/constants";

export function calcMealGoal(ids) {
  const g = ids && ids.length > 0 ? AGE_GROUPS.filter(a => ids.includes(a.id)) : [AGE_GROUPS[3]];
  const avg = k => Math.round(g.reduce((s, a) => s + a.daily[k], 0) / g.length);
  const avgF = k => Math.round(g.reduce((s, a) => s + a.daily[k], 0) / g.length * 10) / 10;
  return {
    protein: Math.round(avg("protein") / 3),
    calcium: Math.round(avg("calcium") / 3),
    iron: Math.round(avgF("iron") / 3 * 10) / 10,
    vitC: Math.round(avg("vitC") / 3),
    fiber: Math.round(avgF("fiber") / 3 * 10) / 10,
  };
}

export function calcNutri(meal) {
  return [meal.rice, meal.soup, ...meal.sides].filter(Boolean).reduce((acc, item) => ({
    protein: acc.protein + (item.nutrition?.protein || 0),
    calcium: acc.calcium + (item.nutrition?.calcium || 0),
    iron: acc.iron + (item.nutrition?.iron || 0),
    vitC: acc.vitC + (item.nutrition?.vitC || 0),
    fiber: acc.fiber + (item.nutrition?.fiber || 0),
    cal: acc.cal + (item.cal || 0),
  }), { protein: 0, calcium: 0, iron: 0, vitC: 0, fiber: 0, cal: 0 });
}

export const fmtN = v => typeof v === "number" && v % 1 !== 0 ? v.toFixed(1) : v;

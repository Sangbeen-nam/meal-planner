import { useState } from "react";

const DAYS = ["월","화","수","목","금","토","일"];
const MEALS = ["아침","점심","저녁"];

const FOOD_PREFS = [
  {id:"한식",e:"🍚"},{id:"일식",e:"🍣"},{id:"중식",e:"🥟"},{id:"분식",e:"🥙"},
  {id:"국/찌개",e:"🍲"},{id:"볶음",e:"🥘"},{id:"구이",e:"🔥"},{id:"찜",e:"♨️"},
  {id:"덮밥",e:"🍛"},{id:"양식/퓨전",e:"🍝"},{id:"면 요리",e:"🍜"},{id:"죽/스프",e:"🥣"},
  {id:"튀김/전",e:"🥞"},{id:"간식",e:"🍎"},
];

const INGREDIENT_GROUPS = [
  {group:"🥩 육류",items:[{n:"닭고기",e:"🍗"},{n:"돼지고기",e:"🥩"},{n:"소고기",e:"🐄"},{n:"닭가슴살",e:"🍗"},{n:"삼겹살",e:"🥓"},{n:"다진고기",e:"🥩"}]},
  {group:"🐟 해산물",items:[{n:"새우",e:"🦐"},{n:"참치",e:"🐟"},{n:"멸치",e:"🐠"},{n:"오징어",e:"🦑"},{n:"조개",e:"🦪"},{n:"연어",e:"🐡"},{n:"게맛살",e:"🦀"},{n:"전복",e:"🐚"},{n:"동태",e:"🐟"}]},
  {group:"🥦 채소",items:[{n:"브로콜리",e:"🥦"},{n:"시금치",e:"🥬"},{n:"당근",e:"🥕"},{n:"양파",e:"🧅"},{n:"감자",e:"🥔"},{n:"고구마",e:"🍠"},{n:"버섯",e:"🍄"},{n:"콩나물",e:"🌱"},{n:"애호박",e:"🥒"},{n:"파프리카",e:"🫑"},{n:"토마토",e:"🍅"},{n:"대파",e:"🌿"},{n:"양배추",e:"🥬"},{n:"깻잎",e:"🌿"},{n:"단호박",e:"🎃"},{n:"가지",e:"🍆"},{n:"무",e:"⬜"},{n:"연근",e:"🌾"},{n:"우엉",e:"🌿"},{n:"아욱",e:"🌿"}]},
  {group:"🥚 단백질/유제품",items:[{n:"계란",e:"🥚"},{n:"두부",e:"⬜"},{n:"치즈",e:"🧀"},{n:"우유",e:"🥛"},{n:"요거트",e:"🫙"}]},
  {group:"🌾 곡류/면류",items:[{n:"쌀",e:"🍚"},{n:"현미",e:"🌾"},{n:"면",e:"🍝"},{n:"당면",e:"🍜"},{n:"떡",e:"🍡"}]},
  {group:"🧄 양념/기타",items:[{n:"김치",e:"🌶️"},{n:"된장",e:"🟤"},{n:"고추장",e:"🔴"},{n:"간장",e:"🍶"},{n:"마늘",e:"🧄"},{n:"미역",e:"🌊"}]},
];

const AGE_GROUPS = [
  {id:"baby",   label:"영아",      range:"0~2세",  emoji:"🍼",color:"#f9a8d4",daily:{protein:15,calcium:400,iron:6, vitC:35,fiber:10}},
  {id:"toddler",label:"유아",      range:"3~5세",  emoji:"🐣",color:"#fdba74",daily:{protein:20,calcium:600,iron:7, vitC:45,fiber:15}},
  {id:"kid1",   label:"초등저학년",range:"6~8세",  emoji:"🎒",color:"#86efac",daily:{protein:30,calcium:700,iron:8, vitC:60,fiber:18}},
  {id:"kid2",   label:"초등고학년",range:"9~11세", emoji:"📚",color:"#93c5fd",daily:{protein:40,calcium:800,iron:10,vitC:70,fiber:20}},
  {id:"teen",   label:"청소년",    range:"12~18세",emoji:"🏃",color:"#c4b5fd",daily:{protein:55,calcium:1000,iron:14,vitC:90,fiber:25}},
];

const AGE_ORDER = ["baby","toddler","kid1","kid2","teen"];

const ALLERGY_OPTIONS = [
  { id: "계란",   label: "계란",      emoji: "🥚", ingredients: ["계란"] },
  { id: "우유",   label: "우유/유제품",emoji: "🥛", ingredients: ["우유", "치즈"] },
  { id: "밀",     label: "밀/글루텐", emoji: "🌾", ingredients: ["면", "당면"] },
  { id: "새우",   label: "새우",      emoji: "🦐", ingredients: ["새우"] },
  { id: "땅콩",   label: "땅콩",      emoji: "🥜", ingredients: ["땅콩"] },
];

function getMinAgeIndex(ids) {
  if (!ids || ids.length === 0) return 3;
  const indices = ids.map(id => AGE_ORDER.indexOf(id)).filter(i => i >= 0);
  return indices.length > 0 ? Math.min(...indices) : 3;
}

function isSafeForAge(item, minAgeIndex) {
  const idx = AGE_ORDER.indexOf(item.safeFor || "baby");
  return idx <= minAgeIndex;
}

function isSafeForAllergy(item, allergenIngreds) {
  if (!allergenIngreds || allergenIngreds.length === 0) return true;
  return !item.ingredients.some(ing => allergenIngreds.includes(ing));
}

function calcMealGoal(ids) {
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

// ── 밥/덮밥 DB ────────────────────────────────────────────────────────────────
const RICE_DB = [
  {name:"흰쌀밥",safeFor:"baby",tags:["한식"],ingredients:["쌀"],time:30,diff:"쉬움",cal:310,nutrition:{protein:6,calcium:5,iron:0.4,vitC:0,fiber:0.4},serving:"쌀 180g, 물 216ml",steps:["쌀 180g을 계량해 볼에 담는다","찬물로 2~3회 가볍게 씻어 뿌연 물을 버린다 — 너무 세게 씻으면 영양소가 손실됨","씻은 쌀에 물 216ml(쌀의 1.2배)를 넣고 20분 불린다","밥솥에 넣고 취사 버튼을 누른다","취사 완료 후 뚜껑을 열지 말고 5분 뜸을 들인다","주걱으로 아래위를 뒤집어 밥알을 살린다"]},
  {name:"현미잡곡밥",safeFor:"toddler",tags:["한식"],ingredients:["현미","쌀"],time:40,diff:"쉬움",cal:285,nutrition:{protein:7,calcium:18,iron:1.4,vitC:0,fiber:3.2},serving:"현미 90g + 백미 90g, 물 250ml",steps:["현미 90g을 찬물에 최소 2시간 불린다 — 현미는 껍질이 두꺼워 충분히 불려야 부드럽게 됨","백미 90g은 씻어 20분 불린다","불린 현미와 백미를 함께 밥솥에 넣는다","물 250ml를 넣는다","취사 후 10분 뜸을 들인다","아이가 거칠게 느낄 경우 현미 비율을 30%로 줄여도 좋다"]},
  {name:"콩밥",safeFor:"toddler",tags:["한식"],ingredients:["쌀"],time:35,diff:"쉬움",cal:295,nutrition:{protein:10,calcium:40,iron:1.8,vitC:0,fiber:3.5},serving:"쌀 150g + 검은콩 30g, 물 220ml",steps:["검은콩 30g을 찬물에 4시간 이상 불린다","쌀 150g을 씻어 20분 불린다","불린 쌀과 콩을 함께 밥솥에 담는다","물 220ml를 넣는다","취사 후 5분 뜸들인다","콩은 단백질과 철분이 풍부해 아이 성장에 매우 좋다"]},
  {name:"닭고기 덮밥",safeFor:"baby",tags:["한식","덮밥"],ingredients:["닭고기","양파","당근","쌀"],time:30,diff:"보통",cal:480,nutrition:{protein:28,calcium:40,iron:1.8,vitC:8,fiber:2.0},serving:"닭다리살 150g, 양파 1/2개(100g), 당근 50g, 간장 1큰술(15ml), 맛술 1/2큰술(7.5ml), 설탕 1/2작은술(2.5g), 참기름 1작은술(5ml)",steps:["닭다리살 150g을 한입 크기(3cm)로 썬다","양파 100g은 1cm 두께 반달모양, 당근 50g은 얇게 채썬다","간장 15ml, 맛술 7.5ml, 설탕 2.5g, 다진마늘 5g을 섞어 양념장을 만든다","팬에 참기름 5ml를 두르고 중불로 달군 뒤 닭고기를 3분 볶는다","양파와 당근을 넣고 2분 더 볶는다","양념장을 넣고 강불 2분, 중불 3분 더 조린다","밥 위에 올리고 달걀프라이를 얹는다"]},
  {name:"소불고기 덮밥",safeFor:"baby",tags:["한식","덮밥"],ingredients:["소고기","양파","버섯","쌀"],time:25,diff:"쉬움",cal:520,nutrition:{protein:30,calcium:25,iron:3.2,vitC:4,fiber:1.5},serving:"소고기(불고기용) 150g, 양파 1/2개(100g), 버섯 50g, 간장 1.5큰술(22ml), 설탕 1작은술(5g), 참기름 1작은술(5ml), 배즙 1큰술(15ml)",steps:["소고기 150g의 핏물을 키친타올로 닦는다","간장 22ml, 설탕 5g, 참기름 5ml, 배즙 15ml, 다진마늘 5g 양념에 30분 재운다 — 배즙은 고기를 부드럽게 함","팬을 강불로 달군 뒤 소고기를 1분 30초 볶는다","양파 100g, 버섯 50g을 넣고 중불 3분 더 볶는다","밥 위에 올리고 통깨를 뿌린다"]},
  {name:"참치마요 덮밥",safeFor:"toddler",tags:["한식","덮밥","일식"],ingredients:["참치","계란","쌀"],time:10,diff:"쉬움",cal:450,nutrition:{protein:24,calcium:30,iron:1.5,vitC:3,fiber:0.8},serving:"참치캔 1캔(100g), 마요네즈 1.5큰술(22g), 간장 1/2작은술(2.5ml), 계란 1개",steps:["참치캔을 체에 받쳐 기름을 완전히 뺀다","마요네즈 22g, 간장 2.5ml, 후추 약간을 넣고 섞는다","참치마요를 밥 위에 소복이 올린다","달걀을 반숙 프라이로 익혀 위에 얹는다","간장을 살짝 뿌려 완성한다"]},
  {name:"새우볶음밥",safeFor:"baby",tags:["한식","중식","덮밥"],ingredients:["새우","계란","쌀","당근","양파"],time:15,diff:"쉬움",cal:420,nutrition:{protein:20,calcium:60,iron:1.2,vitC:5,fiber:1.2},serving:"새우 80g, 계란 1개, 밥 200g, 당근 30g, 양파 50g, 간장 1큰술(15ml), 소금 1/4작은술",steps:["새우 80g의 껍질을 벗기고 내장을 제거한다","당근 30g은 0.5cm 정육면체, 양파 50g은 잘게 다진다","팬에 기름 10ml를 강불로 달군 뒤 새우를 1분 볶아 빼둔다","당근, 양파를 2분 볶은 뒤 찬밥 200g을 넣고 강불에서 볶는다","계란 1개를 풀어 붓고 재빠르게 섞는다","새우를 다시 넣고 간장 15ml, 소금으로 간한다","참기름 3ml 뿌려 마무리"]},
  {name:"김치볶음밥",safeFor:"kid2",tags:["한식","볶음","덮밥"],ingredients:["김치","계란","쌀","돼지고기"],time:15,diff:"쉬움",cal:400,nutrition:{protein:16,calcium:30,iron:1.0,vitC:10,fiber:1.8},serving:"묵은지 100g, 돼지고기 다짐육 80g, 밥 200g, 계란 1개, 참기름 1작은술(5ml)",steps:["묵은지 100g을 잘게 썬다","돼지고기 80g을 팬에 기름 없이 볶아 기름을 낸다","김치를 넣고 2분 볶는다","찬밥 200g을 넣고 강불에서 3분 볶는다","계란을 깨서 빠르게 섞는다","참기름 5ml를 둘러 완성"]},
  {name:"오므라이스",safeFor:"baby",tags:["양식/퓨전"],ingredients:["계란","쌀","양파","당근"],time:20,diff:"보통",cal:460,nutrition:{protein:18,calcium:50,iron:1.5,vitC:6,fiber:1.0},serving:"계란 2개, 밥 180g, 양파 1/4개(50g), 당근 30g, 케첩 2큰술(30g), 버터 5g",steps:["양파 50g, 당근 30g을 0.5cm로 잘게 다진다","팬에 버터 5g을 녹이고 양파, 당근을 2분 볶는다","밥 180g과 케첩 30g을 넣어 2분 볶아 케첩볶음밥을 만든다","볶음밥을 그릇에 담아 타원형으로 모양을 잡는다","계란 2개에 우유 10ml, 소금 한꼬집 넣고 잘 푼다","팬에 기름을 두르고 약불에서 계란물을 반숙으로 익힌다","볶음밥 위에 계란을 씌우고 케첩으로 데코한다"]},
  {name:"치즈리조또",safeFor:"baby",tags:["양식/퓨전"],ingredients:["쌀","치즈","양파","버섯"],time:30,diff:"보통",cal:490,nutrition:{protein:15,calcium:180,iron:0.8,vitC:2,fiber:0.5},serving:"쌀 180g, 치즈 2장(40g), 양파 1/4개(50g), 버섯 50g, 육수 500ml, 버터 10g, 파마산 가루 10g",steps:["쌀 180g을 씻지 않고 준비한다 — 전분이 있어야 크리미해짐","양파 50g은 잘게 다지고 버섯 50g은 얇게 썬다","냄비에 버터 10g을 녹이고 양파를 투명해질 때까지 3분 볶는다","쌀을 넣고 버터가 코팅되게 2분 볶는다","뜨거운 육수를 한 국자씩 흡수될 때마다 부어가며 20분 끓인다","버섯을 넣고 2분 더 익힌다","불을 끄고 치즈 40g, 파마산 10g을 넣어 녹인다"]},
  {name:"야채죽",safeFor:"baby",tags:["죽/스프"],ingredients:["쌀","당근","양파","애호박"],time:35,diff:"쉬움",cal:220,nutrition:{protein:5,calcium:20,iron:0.5,vitC:12,fiber:1.5},serving:"쌀 90g(불린 것), 당근 30g, 양파 30g, 애호박 30g, 육수 500ml, 참기름 1작은술(5ml), 소금 1/4작은술",steps:["쌀 90g을 찬물에 30분 불린다","당근·양파·애호박을 0.3cm 크기로 잘게 다진다","냄비에 참기름 5ml를 두르고 야채를 2분 볶는다","불린 쌀을 넣고 1분 볶는다","육수 500ml를 붓고 강불로 끓인다","약불로 줄이고 뚜껑을 반쯤 열어 20분 저어가며 끓인다 — 눌어붙지 않도록 자주 저어야 함","소금으로 간을 맞춘다"]},
  {name:"닭죽",safeFor:"baby",tags:["죽/스프"],ingredients:["쌀","닭고기","마늘"],time:45,diff:"쉬움",cal:265,nutrition:{protein:20,calcium:18,iron:0.9,vitC:2,fiber:0.5},serving:"닭다리살 150g, 쌀 90g(불린 것), 마늘 3쪽(15g), 물 600ml, 국간장 1/2작은술, 참기름 1작은술",steps:["닭다리살 150g을 물 600ml, 마늘 3쪽과 함께 강불로 끓인다","끓으면 중불로 줄이고 20분 삶는다 — 거품을 걷어낸다","닭고기를 꺼내 결대로 잘게 찢어 둔다","닭 육수는 체에 걸러 깔끔하게 만든다","육수에 불린 쌀 90g을 넣고 강불로 끓인 뒤 약불 20분 저어가며 끓인다","찢은 닭고기를 넣고 5분 더 끓인다","국간장 2.5ml, 소금으로 간하고 참기름 5ml로 마무리"]},
  {name:"단호박죽",safeFor:"baby",tags:["죽/스프"],ingredients:["고구마","쌀","우유"],time:40,diff:"쉬움",cal:245,nutrition:{protein:6,calcium:55,iron:0.8,vitC:18,fiber:2.5},serving:"단호박 200g, 쌀가루 3큰술(30g), 우유 200ml, 물 300ml, 소금 1/4작은술, 설탕 1작은술(5g)",steps:["단호박 200g을 반으로 잘라 씨를 파내고 전자레인지에 5분 익힌다","숟가락으로 속을 파내 볼에 담는다","단호박과 우유 200ml를 블렌더에 곱게 간다","냄비에 단호박 퓨레와 물 300ml를 넣고 끓인다","쌀가루 30g을 물 50ml에 풀어 넣으며 저어준다","약불에서 10분 저어가며 끓인다","소금 1g, 설탕 5g으로 간을 맞춘다"]},
  {name:"잔치국수",safeFor:"baby",tags:["면 요리","한식"],ingredients:["면","당근","계란"],time:20,diff:"쉬움",cal:350,nutrition:{protein:12,calcium:30,iron:1.0,vitC:5,fiber:1.5},serving:"소면 100g, 계란 1개, 당근 30g, 애호박 30g, 멸치 15g, 물 600ml, 국간장 1큰술, 소금 약간",steps:["멸치 15g의 내장을 제거하고 마른 팬에 1분 볶아 비린내를 없앤다","물 600ml와 볶은 멸치를 10분 우려 체에 거른다","당근·애호박을 채썰어 팬에 각각 1분씩 볶는다","계란을 지단 부쳐 채썬다","끓는 물에 소면 100g을 3분 삶아 찬물에 헹군다","육수에 국간장 15ml, 소금으로 간 맞춘다","그릇에 국수를 담고 뜨거운 육수를 부어 고명을 올린다"]},
  {name:"우동",safeFor:"baby",tags:["면 요리","일식"],ingredients:["면","게맛살"],time:15,diff:"쉬움",cal:380,nutrition:{protein:10,calcium:25,iron:0.8,vitC:3,fiber:1.0},serving:"우동면 200g, 게맛살 2개(60g), 대파 1/4대, 다시팩 1개, 물 500ml, 간장 1큰술(15ml)",steps:["냄비에 물 500ml와 다시팩을 넣고 3분 우린 뒤 건진다","간장 15ml, 소금으로 간한다","우동면을 표시 시간대로 삶아 건진다","게맛살 60g을 길게 찢는다","그릇에 면을 담고 뜨거운 국물을 붓는다","게맛살과 대파를 올려 완성"]},
  {name:"토마토파스타",safeFor:"baby",tags:["양식/퓨전","면 요리"],ingredients:["면","토마토","양파","마늘"],time:25,diff:"보통",cal:420,nutrition:{protein:12,calcium:35,iron:1.8,vitC:25,fiber:3.0},serving:"파스타면 100g, 토마토 2개(300g), 양파 1/4개, 마늘 2쪽, 올리브오일 1큰술(15ml), 소금, 파마산 가루 10g",steps:["파스타 100g을 소금 넣은 끓는 물에 8분 삶는다 — 면수 50ml는 따로 보관","마늘 2쪽을 얇게 슬라이스, 양파 50g은 잘게 다진다","팬에 올리브오일 15ml로 마늘을 30초 볶아 향을 낸다","양파를 3분 볶다가 토마토 300g을 넣고 10분 끓인다","삶은 파스타를 소스에 넣고 버무린다","파마산 가루 10g 뿌려 마무리"]},
  {name:"비빔밥",safeFor:"toddler",tags:["한식"],ingredients:["쌀","시금치","당근","콩나물","계란"],time:25,diff:"쉬움",cal:430,nutrition:{protein:14,calcium:65,iron:2.8,vitC:22,fiber:3.5},serving:"밥 200g, 시금치 50g, 당근 30g, 콩나물 50g, 계란 1개, 고추장 1큰술(15g), 참기름 1작은술(5ml)",steps:["시금치 50g을 소금물에 20초 데쳐 간장·참기름으로 무친다","당근 30g을 채썰어 1분 볶고 소금으로 간한다","콩나물 50g은 3분 삶아 참기름·소금으로 무친다","계란을 반숙 프라이한다","그릇에 밥을 담고 나물들을 가지런히 올린다","달걀프라이를 가운데 올린다","고추장 15g, 참기름 5ml를 넣어 비벼 먹는다 — 어린 아이는 고추장 양 조절"]},
  {name:"크림파스타",safeFor:"baby",tags:["양식/퓨전"],ingredients:["면","우유","치즈","닭가슴살"],time:25,diff:"보통",cal:510,nutrition:{protein:22,calcium:200,iron:0.9,vitC:2,fiber:0.5},serving:"파스타면 100g, 닭가슴살 100g, 우유 150ml, 생크림 50ml, 치즈 1장(20g), 버터 10g, 마늘 2쪽",steps:["파스타 100g을 8분 삶아 건진다 — 면수 50ml 보관","닭가슴살 100g을 얇게 저며 소금·후추로 밑간한다","팬에 버터 10g을 녹이고 마늘·닭고기를 3분 볶는다","우유 150ml, 생크림 50ml를 붓고 3분 끓인다","치즈 20g을 넣어 녹이고 면수로 농도를 조절한다","파스타를 넣고 소스와 버무린다"]},
  {name:"감자수프",safeFor:"baby",tags:["양식/퓨전","죽/스프"],ingredients:["감자","양파","우유"],time:30,diff:"쉬움",cal:210,nutrition:{protein:7,calcium:80,iron:0.6,vitC:20,fiber:1.8},serving:"감자 2개(200g), 양파 1/2개(100g), 우유 200ml, 버터 10g, 육수 200ml, 소금, 후추",steps:["감자 200g, 양파 100g을 1cm 크기로 썬다","냄비에 버터 10g을 녹이고 양파를 3분 볶는다","감자를 넣고 2분 볶는다","육수 200ml를 부어 감자가 익을 때까지 15분 끓인다","핸드블렌더로 곱게 간다","우유 200ml를 넣고 3분 데운다","소금·후추로 간하고 파슬리 뿌려 마무리"]},
  {name:"전복죽",safeFor:"baby",tags:["죽/스프","한식"],ingredients:["쌀","전복"],time:40,diff:"보통",cal:280,nutrition:{protein:15,calcium:25,iron:3.5,vitC:0,fiber:0.3},serving:"전복 2마리(150g), 쌀 90g(불린 것), 참기름 1큰술(15ml), 국간장 1작은술(5ml), 소금 약간",steps:["전복 껍데기를 솔로 닦고 숟가락으로 살을 분리한다","내장(초록색)은 따로 보관하고 살은 0.5cm 두께로 썬다","냄비에 참기름 15ml로 내장을 30초 볶아 향을 낸다","불린 쌀을 넣고 2분 볶는다","물 500ml를 붓고 끓인다","약불에서 15분 저어가며 끓인다","전복 살을 넣고 5분 더 끓인 뒤 간한다"]},
  {name:"냉이된장밥",safeFor:"baby",tags:["한식"],ingredients:["쌀","된장"],time:30,diff:"쉬움",cal:320,nutrition:{protein:9,calcium:45,iron:1.8,vitC:10,fiber:2.0},serving:"쌀 180g, 냉이 50g, 된장 1큰술(15g), 참기름 1작은술, 다진마늘 1작은술(5g)",steps:["쌀 180g을 씻어 30분 불린다","냉이 50g을 뿌리째 씻어 흙을 완전히 제거한다","냉이를 2cm 길이로 썬다","밥솥에 불린 쌀과 물 216ml를 넣고 냉이를 올린다","된장 15g, 다진마늘 5g, 참기름 5ml를 섞어 냉이 위에 올린다","취사 후 뜸들이고 골고루 섞는다"]},
  {name:"취나물비빔밥",safeFor:"toddler",tags:["한식"],ingredients:["쌀","계란"],time:20,diff:"쉬움",cal:390,nutrition:{protein:12,calcium:55,iron:2.5,vitC:15,fiber:4.0},serving:"밥 200g, 취나물(데친 것) 80g, 계란 1개, 된장 1/2작은술, 참기름 1작은술, 간장 1/2작은술",steps:["취나물 80g을 소금물에 1분 데쳐 찬물에 헹군다","물기를 꼭 짜고 된장 2.5g, 참기름·다진마늘로 무친다","계란을 반숙 프라이로 굽는다","그릇에 밥을 담고 취나물을 올린다","달걀프라이를 얹고 참기름 한 방울 더 떨어뜨린다","비벼 먹는다"]},
];

// ── 국/찌개 DB ────────────────────────────────────────────────────────────────
const SOUP_DB = [
  {name:"된장찌개",safeFor:"toddler",tags:["한식","국/찌개"],ingredients:["두부","된장","버섯"],time:25,diff:"쉬움",cal:180,nutrition:{protein:8,calcium:80,iron:1.5,vitC:5,fiber:2.0},serving:"된장 1.5큰술(22g), 두부 1/4모(100g), 애호박 80g, 감자 80g, 버섯 30g, 멸치육수 400ml",steps:["멸치 10g을 볶아 물 500ml에 8분 우려 육수를 만든다","된장 22g을 체에 걸러 육수에 푼다","감자 80g을 1.5cm 깍뚝썰기해 먼저 5분 끓인다","애호박·버섯·다진마늘을 넣고 5분 끓인다","두부 100g을 1.5cm 깍뚝으로 넣고 3분 끓인다","소금으로 최종 간을 맞춘다 — 된장 자체에 나트륨이 많으니 추가 간은 최소로"]},
  {name:"소고기미역국",safeFor:"baby",tags:["한식","국/찌개"],ingredients:["소고기","미역"],time:40,diff:"쉬움",cal:165,nutrition:{protein:13,calcium:140,iron:2.8,vitC:0,fiber:2.0},serving:"소고기(국거리) 100g, 건미역 10g, 참기름 1작은술(5ml), 국간장 1큰술(15ml), 마늘 1쪽(5g), 물 600ml",steps:["건미역 10g을 찬물에 20분 불려 4cm 길이로 자른다","소고기 100g의 핏물을 닦고 가늘게 채썬다","냄비에 참기름 5ml를 두르고 소고기를 2분 볶는다","미역을 넣고 2분 더 볶는다 — 기름에 볶으면 비린내가 없어짐","물 600ml를 붓고 강불로 끓인다","다진마늘 5g, 국간장 15ml를 넣고 약불 20분 끓인다","소금으로 최종 간을 맞춘다"]},
  {name:"김치찌개",safeFor:"kid2",tags:["한식","국/찌개"],ingredients:["김치","돼지고기","두부"],time:25,diff:"쉬움",cal:250,nutrition:{protein:15,calcium:60,iron:1.2,vitC:12,fiber:2.5},serving:"묵은지 200g, 돼지고기(앞다리살) 100g, 두부 1/4모(100g), 물 400ml, 고춧가루 1작은술, 다진마늘 1작은술",steps:["돼지고기 100g을 한입 크기로 썬다","묵은지 200g을 3cm로 자른다","냄비에 기름 없이 돼지고기를 2분 볶아 기름을 낸다","김치를 넣고 3분 볶는다","물 400ml와 김칫국물 2큰술을 넣고 강불로 끓인다","고춧가루·다진마늘을 넣고 중불 10분 끓인다","두부를 2cm로 잘라 넣고 5분 더 끓인다"]},
  {name:"콩나물국",safeFor:"baby",tags:["한식","국/찌개"],ingredients:["콩나물"],time:15,diff:"쉬움",cal:80,nutrition:{protein:5,calcium:40,iron:0.8,vitC:8,fiber:1.8},serving:"콩나물 150g, 물 500ml, 국간장 1큰술(15ml), 다진마늘 1/2작은술, 대파 1/4대",steps:["콩나물 150g을 물에 담가 상한 것을 골라낸다","냄비에 물 500ml와 콩나물을 넣는다","뚜껑을 닫고 강불로 끓인다 — 중간에 열면 비린내가 남","끓기 시작하면 뚜껑 열고 국간장 15ml, 다진마늘을 넣는다","3분 더 끓이고 소금으로 간 맞춘다","대파와 고춧가루를 살짝 올린다"]},
  {name:"계란국",safeFor:"baby",tags:["한식","국/찌개"],ingredients:["계란"],time:10,diff:"쉬움",cal:105,nutrition:{protein:9,calcium:32,iron:0.9,vitC:0,fiber:0.3},serving:"계란 2개, 멸치육수 400ml, 국간장 1/2큰술(7.5ml), 소금 약간, 대파 1/4대, 참기름 1/2작은술",steps:["멸치육수 400ml를 냄비에 넣고 끓인다","계란 2개를 볼에 풀어 잘 섞는다","육수가 끓으면 국간장 7.5ml로 간을 맞춘다","계란물을 젓가락을 타고 천천히 가늘게 붓는다 — 한꺼번에 부으면 뭉쳐짐","10초 후 젓가락으로 부드럽게 한 번 저어준다","대파를 송송 썰어 넣고 참기름 2.5ml로 마무리"]},
  {name:"순두부찌개",safeFor:"kid1",tags:["한식","국/찌개"],ingredients:["두부","계란","버섯"],time:20,diff:"쉬움",cal:190,nutrition:{protein:14,calcium:105,iron:1.8,vitC:4,fiber:1.2},serving:"순두부 1/2봉(200g), 계란 1개, 버섯 50g, 멸치육수 400ml, 고춧가루 1작은술, 국간장 1/2큰술, 참기름 1작은술",steps:["냄비에 참기름 5ml와 고춧가루 5g을 30초 볶아 색을 낸다","다진마늘 5g을 넣고 30초 볶는다","멸치육수 400ml를 붓고 강불로 끓인다","버섯 50g을 넣고 2분 끓인다","순두부 200g을 큰 숟가락으로 퍼 넣는다","국간장으로 간하고 3분 끓인다","계란 1개를 가장자리에 깨서 반숙으로 익힌다"]},
  {name:"시금치국",safeFor:"baby",tags:["한식","국/찌개"],ingredients:["시금치"],time:15,diff:"쉬움",cal:72,nutrition:{protein:4,calcium:95,iron:2.5,vitC:28,fiber:2.2},serving:"시금치 100g, 멸치육수 400ml, 된장 1/2큰술(7.5g), 다진마늘 1/2작은술, 국간장 약간",steps:["시금치 100g을 뿌리까지 깨끗이 씻는다","멸치육수 400ml를 냄비에 끓인다","된장 7.5g을 체에 걸러 풀어준다","다진마늘 2.5g을 넣는다","시금치를 넣고 1분 30초만 끓인다 — 오래 끓이면 영양과 색이 손실됨","국간장으로 간을 맞춘다"]},
  {name:"북엇국",safeFor:"baby",tags:["한식","국/찌개"],ingredients:["계란","두부"],time:20,diff:"쉬움",cal:125,nutrition:{protein:18,calcium:48,iron:0.7,vitC:0,fiber:0.5},serving:"북어채 30g, 계란 1개, 두부 1/8모(50g), 물 500ml, 참기름 1작은술, 국간장 1큰술, 다진마늘 1작은술",steps:["북어채 30g을 찬물에 5분 담갔다가 꼭 짠다","냄비에 참기름 5ml를 두르고 북어를 2분 볶는다","물 500ml를 넣고 끓인다","다진마늘 5g, 국간장 15ml를 넣고 중불 10분 끓인다","두부 50g을 1cm 깍뚝으로 넣고 3분 끓인다","계란 1개를 풀어 넣고 저으며 1분 익힌다"]},
  {name:"감자국",safeFor:"baby",tags:["한식","국/찌개"],ingredients:["감자","양파"],time:20,diff:"쉬움",cal:110,nutrition:{protein:3,calcium:15,iron:0.5,vitC:15,fiber:1.5},serving:"감자 1개(150g), 양파 1/4개(50g), 멸치육수 400ml, 국간장 1큰술, 다진마늘 1/2작은술",steps:["감자 150g은 1.5cm 깍뚝, 양파 50g은 1cm로 썬다","멸치육수 400ml를 끓인다","감자를 먼저 넣고 5분 끓인다","양파와 다진마늘 2.5g을 넣고 5분 더 끓인다","국간장 15ml로 간하고 소금으로 조절한다","대파를 송송 썰어 올려 완성"]},
  {name:"무국",safeFor:"baby",tags:["한식","국/찌개"],ingredients:["소고기"],time:30,diff:"쉬움",cal:120,nutrition:{protein:8,calcium:25,iron:1.2,vitC:10,fiber:1.0},serving:"무 200g, 소고기(국거리) 80g, 물 600ml, 국간장 1.5큰술, 참기름 1작은술, 다진마늘 1작은술",steps:["소고기 80g을 채썰어 참기름 5ml에 2분 볶는다","무 200g을 2×3cm 나박 모양으로 썬다","볶은 소고기에 무를 넣고 1분 더 볶는다","물 600ml를 붓고 끓인다","국간장 22ml, 다진마늘 5g을 넣는다","중불로 무가 투명해질 때까지 15분 끓인다"]},
  {name:"아욱국",safeFor:"baby",tags:["한식","국/찌개"],ingredients:["된장","새우"],time:20,diff:"쉬움",cal:95,nutrition:{protein:7,calcium:85,iron:1.5,vitC:18,fiber:2.8},serving:"아욱 100g, 된장 1큰술(15g), 새우 50g, 멸치육수 400ml, 다진마늘 1/2작은술",steps:["아욱 100g의 줄기 껍질을 벗기고 잎만 뜯어 씻는다","새우 50g은 껍질 벗겨 준비한다","멸치육수 400ml에 된장 15g을 체에 걸러 푼다","새우를 넣고 2분 끓인다","아욱과 다진마늘을 넣고 3분 끓인다","소금으로 간 맞추고 마무리"]},
  {name:"동태찌개",safeFor:"kid1",tags:["한식","국/찌개"],ingredients:["두부","콩나물"],time:25,diff:"보통",cal:145,nutrition:{protein:18,calcium:55,iron:0.9,vitC:8,fiber:1.5},serving:"동태 토막 300g, 두부 1/4모(100g), 콩나물 80g, 물 600ml, 고춧가루 1.5큰술, 다진마늘 1큰술, 국간장 1큰술",steps:["동태 토막을 찬물에 씻어 핏물을 제거한다","냄비에 물 600ml를 끓인다","고춧가루·다진마늘·국간장을 섞어 양념장을 만든다","끓는 물에 동태와 양념장을 넣고 5분 끓인다","콩나물 80g을 넣는다","두부를 2cm 깍뚝으로 넣고 5분 더 끓인다","대파·소금으로 마무리"]},
  {name:"사골국",safeFor:"baby",tags:["한식","국/찌개"],ingredients:["소고기"],time:15,diff:"쉬움",cal:180,nutrition:{protein:12,calcium:85,iron:1.0,vitC:0,fiber:0},serving:"사골국물(시판) 400ml, 소금 1/4작은술, 대파 1/4대, 후추 약간",steps:["시판 사골국물 400ml를 냄비에 붓는다","중불로 천천히 데운다","끓으면 소금으로 간을 맞춘다","대파를 어슷 썰어 올린다","후추를 살짝 뿌려 마무리","뚝배기에 담아 서빙하면 더욱 좋다"]},
  {name:"호박찌개",safeFor:"toddler",tags:["한식","국/찌개"],ingredients:["돼지고기","된장"],time:20,diff:"쉬움",cal:160,nutrition:{protein:12,calcium:35,iron:0.8,vitC:8,fiber:1.5},serving:"애호박 1개(200g), 돼지고기 다짐육 80g, 된장 1큰술(15g), 물 400ml, 고추장 1/2큰술(7.5g), 다진마늘 1작은술",steps:["애호박 200g을 0.5cm 두께 반달 모양으로 썬다","냄비에 기름 없이 다짐육 80g을 2분 볶는다","물 400ml를 붓고 끓인다","된장 15g, 고추장 7.5g을 체에 걸러 풀어준다","다진마늘과 애호박을 넣고 5분 끓인다","소금으로 간 맞추고 대파로 마무리"]},
  {name:"미소국",safeFor:"baby",tags:["일식","국/찌개"],ingredients:["두부"],time:10,diff:"쉬움",cal:85,nutrition:{protein:7,calcium:60,iron:1.0,vitC:0,fiber:0.8},serving:"미소 1.5큰술(22g), 두부 1/8모(50g), 다시마 5cm×5cm 1장, 물 400ml, 대파 약간",steps:["냄비에 물 400ml와 다시마를 10분 불린다","중불로 끓이다가 끓기 직전에 다시마를 건진다 — 끓이면 쓴맛이 남","두부 50g을 1cm 깍뚝으로 썬다","미소 22g을 체에 걸러 풀어준다","두부를 넣고 1분만 데운다 — 오래 끓이면 미소 향이 날아감","대파를 올려 마무리"]},
  {name:"토마토 수프",safeFor:"baby",tags:["양식/퓨전","죽/스프"],ingredients:["토마토","양파","마늘"],time:25,diff:"쉬움",cal:130,nutrition:{protein:4,calcium:30,iron:0.8,vitC:32,fiber:2.8},serving:"토마토 2개(300g), 양파 1/2개(100g), 마늘 2쪽, 올리브오일 1큰술(15ml), 육수 200ml, 소금, 후추",steps:["토마토 300g을 잘게 썬다","양파 100g은 잘게 다지고 마늘 2쪽은 편으로 썬다","냄비에 올리브오일 15ml로 마늘을 30초 볶는다","양파를 4분 볶다가 토마토를 넣고 10분 끓인다","핸드블렌더로 곱게 간다","육수 200ml를 넣고 3분 더 끓인다","소금·후추로 간하고 마무리"]},
  {name:"클램차우더",safeFor:"baby",tags:["양식/퓨전","죽/스프"],ingredients:["조개","감자","우유"],time:30,diff:"보통",cal:220,nutrition:{protein:12,calcium:120,iron:2.5,vitC:12,fiber:1.5},serving:"바지락 150g, 감자 1개(150g), 양파 1/4개(50g), 우유 300ml, 버터 10g, 밀가루 1큰술(10g), 소금, 후추",steps:["바지락 150g을 소금물에 1시간 해감한다","물 200ml와 바지락을 끓여 입이 열리면 체에 걸러 조개 육수를 만든다","감자 150g은 1cm 깍뚝, 양파 50g은 잘게 다진다","냄비에 버터 10g을 녹이고 양파를 3분 볶는다","밀가루 10g을 넣고 1분 볶아 루를 만든다","조개 육수를 부으며 저어 덩어리를 없앤다","감자와 우유 300ml를 넣고 12분 끓인다","조개살을 넣고 소금·후추로 간한다"]},
  {name:"두부김치국",safeFor:"kid2",tags:["한식","국/찌개"],ingredients:["김치","두부"],time:15,diff:"쉬움",cal:130,nutrition:{protein:9,calcium:70,iron:0.9,vitC:10,fiber:1.8},serving:"김치 100g, 두부 1/4모(100g), 물 400ml, 고춧가루 1/2작은술, 국간장 1/2큰술",steps:["김치 100g을 2cm 크기로 썬다","냄비에 기름 없이 김치를 1분 볶는다","물 400ml를 붓고 끓인다","고춧가루·국간장을 넣는다","두부 100g을 1.5cm 깍뚝으로 넣고 5분 끓인다","소금으로 간 맞추고 대파로 마무리"]},
  {name:"버섯들깨국",safeFor:"baby",tags:["한식","국/찌개"],ingredients:["버섯"],time:20,diff:"쉬움",cal:110,nutrition:{protein:5,calcium:45,iron:1.2,vitC:5,fiber:2.5},serving:"버섯(모듬) 150g, 들깨가루 2큰술(20g), 멸치육수 400ml, 국간장 1큰술, 다진마늘 1작은술",steps:["버섯 150g을 먹기 좋게 찢거나 썬다","멸치육수 400ml를 끓인다","버섯을 넣고 5분 끓인다","들깨가루 20g을 물 30ml에 풀어 넣으며 젓는다","국간장·다진마늘로 간한다","3분 더 끓이고 소금으로 최종 간 맞춘다"]},
  {name:"조개미역국",safeFor:"baby",tags:["한식","국/찌개"],ingredients:["미역","조개"],time:25,diff:"쉬움",cal:120,nutrition:{protein:10,calcium:160,iron:2.2,vitC:0,fiber:2.0},serving:"건미역 8g, 바지락 100g, 참기름 1작은술, 국간장 1큰술, 물 600ml, 다진마늘 1/2작은술",steps:["건미역 8g을 찬물에 20분 불려 4cm 길이로 자른다","바지락 100g을 소금물에 30분 해감한다","냄비에 참기름으로 미역을 2분 볶는다","물 600ml를 붓고 끓인다","바지락과 다진마늘을 넣는다","바지락 입이 열리면 국간장으로 간하고 3분 더 끓인다"]},
];

// ── 반찬 DB ───────────────────────────────────────────────────────────────────
const SIDE_DB = [
  // 단백질 반찬
  {name:"계란찜",safeFor:"baby",tags:["찜"],ingredients:["계란"],time:15,diff:"쉬움",cal:140,nutriType:"단백질",nutrition:{protein:12,calcium:52,iron:1.8,vitC:0,fiber:0},serving:"계란 2개, 육수 100ml, 소금 1/4작은술, 참기름 1/2작은술",steps:["계란 2개를 볼에 풀어 육수 100ml를 넣고 섞는다","소금 1g, 참기름 2.5ml를 넣어 섞는다","체에 한 번 걸러 기포를 제거한다 — 기포 제거가 부드러운 계란찜의 핵심","내열 그릇에 담고 물이 냄비 높이 1/3 찬 냄비에 넣는다","뚜껑 닫아 약불에서 12분 찐다","이쑤시개로 찔러 맑은 물이 나오면 완성","대파·당근을 잘게 다져 올린다"]},
  {name:"두부조림",safeFor:"baby",tags:["구이"],ingredients:["두부"],time:20,diff:"쉬움",cal:225,nutriType:"단백질",nutrition:{protein:14,calcium:125,iron:2.0,vitC:2,fiber:0.8},serving:"두부 1/2모(200g), 간장 1.5큰술(22ml), 고추장 1/2큰술(7.5g), 다진마늘 1작은술(5g), 설탕 1/2작은술(2.5g), 참기름 1작은술",steps:["두부 200g을 1.5cm 두께 6조각으로 썬다","키친타올 위에 올려 10분간 물기를 충분히 뺀다 — 물기를 빼야 잘 구워짐","간장 22ml, 고추장 7.5g, 다진마늘 5g, 설탕 2.5g, 물 2큰술을 섞어 양념장을 만든다","팬에 기름 10ml를 두르고 두부를 앞뒤 각 3분씩 노릇하게 굽는다","양념장을 두부 위에 고루 붓고 중불에서 조린다","국물이 반으로 줄면 참기름 5ml를 두르고 마무리"]},
  {name:"달걀말이",safeFor:"baby",tags:["구이"],ingredients:["계란","당근"],time:15,diff:"보통",cal:168,nutriType:"단백질",nutrition:{protein:13,calcium:46,iron:1.6,vitC:3,fiber:0.2},serving:"계란 3개, 당근 20g, 대파 1/8대, 소금 1/4작은술, 우유 1큰술(15ml)",steps:["계란 3개를 볼에 풀고 우유 15ml, 소금 1g을 넣어 잘 섞는다","당근 20g, 대파를 최대한 잘게 다져 계란물에 섞는다","사각 팬에 기름을 키친타올로 얇게 바른다","약불에서 계란물의 1/3을 붓고 반쯤 익으면 한쪽으로 말아준다","말아둔 달걀을 끝으로 밀고 빈 공간에 기름 바른 뒤 계란물 1/3 더 붓는다","반쯤 익으면 말아준다 — 총 3회 반복","김발로 감싸 5분 모양 잡은 뒤 1cm 두께로 썬다"]},
  {name:"치즈달걀말이",safeFor:"baby",tags:["구이","양식/퓨전"],ingredients:["계란","치즈"],time:12,diff:"쉬움",cal:192,nutriType:"단백질",nutrition:{protein:15,calcium:132,iron:1.4,vitC:0,fiber:0},serving:"계란 3개, 슬라이스 치즈 2장(40g), 소금 1/4작은술, 우유 1큰술(15ml)",steps:["계란 3개를 볼에 풀고 우유 15ml, 소금 1g을 넣어 잘 섞는다","사각 팬에 기름을 얇게 두르고 약불로 달군다","계란물을 한 번에 부어 약불에서 천천히 익힌다","표면이 반쯤 굳으면 치즈 2장을 가지런히 올린다","치즈가 살짝 녹기 시작하면 한쪽부터 말기 시작한다","김발로 감싸 3분 모양을 잡는다","1cm 두께로 썰어 완성"]},
  {name:"닭가슴살구이",safeFor:"baby",tags:["구이"],ingredients:["닭가슴살"],time:20,diff:"쉬움",cal:200,nutriType:"단백질",nutrition:{protein:30,calcium:15,iron:0.9,vitC:0,fiber:0},serving:"닭가슴살 150g, 올리브오일 1작은술(5ml), 소금 1/3작은술, 후추 약간",steps:["닭가슴살 150g을 가로로 반 갈라 두께를 1cm로 균일하게 만든다","칼등으로 가볍게 두드려 육질을 부드럽게 한다","올리브오일 5ml, 소금 1.5g, 후추로 앞뒤를 골고루 밑간한다","랩으로 감싸 냉장고에서 15분 재운다","팬을 강불로 2분 충분히 달군다 — 차가운 팬에 넣으면 달라붙음","뚜껑을 닫아 중불에서 앞면 7분, 뒷면 5분 굽는다","가장 두꺼운 부분을 잘라 분홍빛 없으면 완성"]},
  {name:"멸치볶음",safeFor:"toddler",tags:["볶음"],ingredients:["멸치"],time:12,diff:"쉬움",cal:165,nutriType:"단백질",nutrition:{protein:15,calcium:220,iron:2.9,vitC:0,fiber:0},serving:"중멸치 80g, 간장 1큰술(15ml), 설탕 1큰술(10g), 물엿 1큰술(15g), 마늘 2쪽(10g), 참기름 1/2작은술, 통깨",steps:["멸치 80g을 마른 팬에 중불로 2분 볶아 비린내를 제거한다","볶은 멸치는 따로 빼둔다","같은 팬에 기름 5ml와 편마늘 10g을 1분 볶는다","간장 15ml, 설탕 10g, 물엿 15g을 넣고 거품이 날 때까지 30초 끓인다","멸치를 다시 넣고 양념이 고루 묻도록 1분 볶는다","불을 끄고 참기름 2.5ml를 두른다","통깨를 뿌려 마무리"]},
  {name:"함박스테이크",safeFor:"baby",tags:["양식/퓨전"],ingredients:["다진고기","양파","계란"],time:30,diff:"보통",cal:385,nutriType:"단백질",nutrition:{protein:25,calcium:32,iron:2.5,vitC:3,fiber:0.5},serving:"소고기 다짐육 100g + 돼지 다짐육 50g, 양파 1/4개(50g), 계란 1/2개, 빵가루 2큰술(20g), 소금 1/3작은술 / 소스: 케첩 2큰술, 돈가스소스 1큰술, 버터 5g",steps:["양파 50g을 잘게 다져 기름 없이 2분 볶아 식힌다","다짐육 150g에 양파·계란 1/2개·빵가루 20g·소금 1.5g·후추를 넣는다","손으로 5분 충분히 치댄다 — 치댈수록 육즙이 풍부해짐","타원형으로 빚어 가운데를 살짝 눌러준다","팬에 기름 5ml로 중불 3분 굽는다","뒤집어 뚜껑 덮고 약불 5분 더 굽는다","케첩·돈가스소스·버터를 2분 끓여 소스를 만들어 뿌린다"]},
  {name:"새우튀김",safeFor:"baby",tags:["튀김/전"],ingredients:["새우"],time:20,diff:"보통",cal:285,nutriType:"단백질",nutrition:{protein:18,calcium:57,iron:1.0,vitC:0,fiber:0},serving:"새우(중하) 8마리(160g), 튀김가루 50g, 냉수 60ml, 소금 1/4작은술, 식용유",steps:["새우 160g의 껍질을 벗기고 꼬리는 남긴다","등에 칼집을 넣어 내장을 제거한다","배 부분에 칼집 3~4군데 넣어 구부러짐을 방지한다","소금으로 밑간한다","튀김가루 50g에 냉수 60ml를 가볍게 섞는다 — 과하게 섞으면 바삭함이 떨어짐","기름을 170도로 가열해 2분 튀긴다","키친타올에 올려 기름을 제거한다"]},
  {name:"동그랑땡",safeFor:"baby",tags:["튀김/전"],ingredients:["다진고기","두부","계란"],time:25,diff:"보통",cal:295,nutriType:"단백질",nutrition:{protein:18,calcium:62,iron:1.8,vitC:2,fiber:0.3},serving:"돼지 다짐육 100g, 두부 1/8모(50g), 계란 1개(코팅용), 다진당근 20g, 다진양파 20g, 소금 1/3작은술, 다진마늘 1/2작은술, 참기름 1/2작은술",steps:["두부 50g을 손으로 으깨 키친타올로 물기를 꼭 짠다","다짐육·으깬두부·다진당근·다진양파를 볼에 넣는다","소금·다진마늘·참기름·후추를 넣고 치댄다","지름 4cm, 두께 1cm의 동그란 모양으로 빚는다","계란 1개를 풀어 동그랑땡에 고루 입힌다","팬에 기름을 1cm 높이로 두르고 앞뒤 각 3분씩 노릇하게 굽는다","키친타올에 올려 기름을 빼고 완성"]},
  {name:"불고기",safeFor:"baby",tags:["한식","구이"],ingredients:["소고기","양파","버섯"],time:25,diff:"보통",cal:310,nutriType:"단백질",nutrition:{protein:24,calcium:18,iron:2.8,vitC:4,fiber:0.8},serving:"소고기(불고기용) 150g, 양파 1/4개(50g), 버섯 30g, 간장 1.5큰술(22ml), 설탕 1작은술(5g), 배즙 1큰술(15ml), 참기름 1작은술, 다진마늘 1작은술",steps:["소고기 150g의 핏물을 키친타올로 닦는다","간장 22ml, 설탕 5g, 배즙 15ml, 다진마늘 5g, 참기름으로 양념장을 만든다","소고기에 양념장을 넣고 30분 재운다","팬을 강불로 달구고 재운 소고기를 1분 30초 볶는다","양파 50g, 버섯 30g을 넣고 2분 더 볶는다","통깨를 뿌려 완성"]},
  {name:"어묵볶음",safeFor:"toddler",tags:["볶음","한식"],ingredients:["양파","당근"],time:15,diff:"쉬움",cal:210,nutriType:"단백질",nutrition:{protein:10,calcium:35,iron:0.8,vitC:5,fiber:1.0},serving:"어묵 150g, 양파 1/4개(50g), 당근 30g, 간장 1큰술(15ml), 설탕 1/2작은술(2.5g), 참기름 1작은술, 통깨",steps:["어묵 150g을 끓는 물에 30초 데쳐 기름기를 제거한다","어묵을 1cm 두께로 어슷 썬다","양파 50g은 채썰고, 당근 30g은 얇게 채썬다","팬에 기름 10ml를 두르고 당근을 먼저 1분 볶는다","양파를 넣고 1분 볶는다","어묵과 간장 15ml, 설탕 2.5g을 넣고 2분 볶는다","참기름 5ml와 통깨로 마무리"]},
  {name:"제육볶음",safeFor:"kid2",tags:["볶음"],ingredients:["돼지고기","양파","고추장"],time:25,diff:"보통",cal:390,nutriType:"단백질",nutrition:{protein:22,calcium:20,iron:1.5,vitC:5,fiber:1.0},serving:"돼지고기(앞다리살) 150g, 양파 1/2개(100g), 고추장 1.5큰술(22g), 간장 1큰술(15ml), 다진마늘 1작은술(5g), 설탕 1작은술(5g), 참기름 1작은술",steps:["돼지고기 150g을 0.5cm 두께로 얇게 썬다","고추장 22g, 간장 15ml, 다진마늘 5g, 설탕 5g을 섞어 양념장을 만든다","돼지고기에 양념장을 넣고 30분 재운다","팬에 기름 없이 강불로 달군 뒤 재운 돼지고기를 2분 볶는다","양파 100g을 넣고 2분 더 볶는다","참기름 5ml를 두르고 통깨 뿌려 완성"]},
  {name:"낙지볶음",safeFor:"kid2",tags:["한식","볶음"],ingredients:["오징어","양파","고추장"],time:20,diff:"보통",cal:180,nutriType:"단백질",nutrition:{protein:16,calcium:28,iron:1.8,vitC:6,fiber:0.8},serving:"낙지(또는 오징어) 150g, 양파 1/2개(100g), 고추장 1큰술(15g), 간장 1/2큰술, 다진마늘 1작은술, 설탕 1작은술, 참기름 1작은술",steps:["낙지 150g을 소금으로 주물러 씻고 5cm 길이로 자른다","고추장·간장·다진마늘·설탕을 섞어 양념장을 만든다","팬에 기름 10ml를 강불로 달군다","양파 100g을 1분 볶는다","낙지를 넣고 양념장과 함께 강불에서 2분 빠르게 볶는다 — 오래 익히면 질겨짐","참기름 5ml를 두르고 불을 끈다"]},
  {name:"김치전",safeFor:"kid2",tags:["튀김/전","한식"],ingredients:["김치","돼지고기"],time:15,diff:"쉬움",cal:275,nutriType:"단백질",nutrition:{protein:10,calcium:36,iron:0.9,vitC:8,fiber:1.5},serving:"묵은지 150g, 돼지 다짐육 50g, 부침가루 100g, 물 80ml, 참기름 1작은술",steps:["묵은지 150g을 잘게 썰어 꼭 짜서 물기를 제거한다 — 물기가 많으면 반죽이 묽어짐","부침가루 100g에 물 80ml를 넣어 되직하게 반죽한다","김치와 돼지 다짐육 50g을 반죽에 섞는다","팬에 기름 15ml를 충분히 달군다","반죽을 0.5cm 두께로 펴서 넣는다","가장자리가 익으면 뒤집어 3분 더 굽는다","참기름 5ml를 가장자리에 둘러 바삭함을 더한다"]},

  // 채소 반찬
  {name:"시금치나물",safeFor:"baby",tags:["찜"],ingredients:["시금치"],time:10,diff:"쉬움",cal:82,nutriType:"채소",nutrition:{protein:3,calcium:102,iron:2.6,vitC:28,fiber:2.5},serving:"시금치 150g, 간장 1/2작은술(2.5ml), 참기름 1작은술(5ml), 다진마늘 1/3작은술(1.5g), 소금 약간, 통깨",steps:["시금치 150g을 뿌리 부분까지 깨끗이 씻는다","끓는 물에 소금 1작은술을 넣고 시금치를 20~30초만 데친다 — 오래 데치면 색과 영양 손실","즉시 찬물에 헹궈 녹색을 고정한다","물기를 손으로 꼭 짠다","간장 2.5ml, 참기름 5ml, 다진마늘 1.5g을 넣고 조물조물 무친다","소금으로 최종 간을 맞추고 통깨를 뿌린다"]},
  {name:"브로콜리볶음",safeFor:"baby",tags:["볶음"],ingredients:["브로콜리","당근"],time:12,diff:"쉬움",cal:122,nutriType:"채소",nutrition:{protein:4,calcium:52,iron:0.8,vitC:90,fiber:2.8},serving:"브로콜리 150g, 당근 30g, 다진마늘 1/2작은술(2.5g), 굴소스 1/2큰술(7.5ml), 참기름 1작은술, 소금 약간",steps:["브로콜리 150g을 작은 송이로 나눠 소금물에 5분 담가 씻는다","당근 30g을 얇게 편 썬다","끓는 물에 브로콜리 1분, 당근 30초 데친다","즉시 찬물에 헹궈 식힌다 — 선명한 초록색을 유지","팬에 기름 10ml로 다진마늘 2.5g을 30초 볶는다","브로콜리와 당근을 넣고 2분 볶는다","굴소스 7.5ml, 소금으로 간하고 참기름 5ml로 마무리"]},
  {name:"감자볶음",safeFor:"baby",tags:["볶음"],ingredients:["감자","양파"],time:18,diff:"쉬움",cal:192,nutriType:"채소",nutrition:{protein:3,calcium:10,iron:0.6,vitC:18,fiber:1.5},serving:"감자 1개(200g), 양파 1/4개(50g), 식용유 1큰술(15ml), 간장 1/2큰술(7.5ml), 소금 1/4작은술, 참기름 1/2작은술, 통깨",steps:["감자 200g을 껍질 벗겨 0.3cm 두께로 채썬다","채 썬 감자를 찬물에 10분 담가 전분을 뺀다 — 달라붙지 않고 바삭해짐","물기를 완전히 제거한다","팬에 기름 15ml를 두르고 중불로 달군다","감자를 넣고 뒤집지 말고 2분 지진 뒤 뒤집어 1분 더 굽는다","양파 50g을 넣고 1분 볶는다","간장 7.5ml, 소금으로 간하고 참기름·통깨로 마무리"]},
  {name:"당근나물",safeFor:"baby",tags:["볶음"],ingredients:["당근"],time:10,diff:"쉬움",cal:72,nutriType:"채소",nutrition:{protein:1,calcium:30,iron:0.5,vitC:6,fiber:2.8},serving:"당근 150g, 참기름 1작은술(5ml), 소금 1/3작은술(1.5g), 다진마늘 1/3작은술(1.5g), 통깨",steps:["당근 150g을 껍질 벗겨 5cm 길이로 가늘게 채썬다","끓는 소금물에 30초 데친다 — 너무 오래 데치면 물러짐","찬물에 헹궈 물기를 뺀다","팬에 참기름 5ml를 두르고 당근과 다진마늘 1.5g을 1분 볶는다","소금 1.5g으로 간한다","통깨를 뿌려 완성 — 당근의 베타카로틴은 기름과 함께 먹어야 흡수율 높아짐"]},
  {name:"콩나물무침",safeFor:"baby",tags:["찜"],ingredients:["콩나물"],time:12,diff:"쉬움",cal:78,nutriType:"채소",nutrition:{protein:4,calcium:36,iron:0.7,vitC:8,fiber:1.5},serving:"콩나물 150g, 간장 1/2작은술(2.5ml), 참기름 1작은술(5ml), 다진마늘 1/3작은술, 소금 약간, 통깨",steps:["콩나물 150g을 씻어 상한 것을 골라낸다","냄비에 끓는 물에 소금 1작은술 넣고 뚜껑 닫아 3분 삶는다 — 뚜껑 열면 비린내 남","찬물에 헹궈 물기를 뺀다","간장 2.5ml, 참기름 5ml, 다진마늘, 소금으로 무친다","통깨를 뿌려 완성"]},
  {name:"고구마맛탕",safeFor:"baby",tags:["찜","간식"],ingredients:["고구마"],time:22,diff:"쉬움",cal:315,nutriType:"채소",nutrition:{protein:2,calcium:32,iron:0.7,vitC:22,fiber:3.0},serving:"고구마 200g, 설탕 3큰술(30g), 식용유, 참기름 1/2작은술, 통깨",steps:["고구마 200g을 1.5cm 두께로 썬다","키친타올로 물기를 완전히 제거한다 — 물기 있으면 기름이 튀고 캐러멜이 잘 안 됨","기름을 160도로 가열 후 고구마를 5분 튀긴다","팬에 기름 1큰술과 설탕 30g을 약불에서 황금색으로 캐러멜화 한다","고구마를 넣어 코팅한다","참기름 2.5ml와 통깨 뿌려 완성","기름종이 위에 올려 식히면 달라붙지 않음"]},
  {name:"파프리카볶음",safeFor:"baby",tags:["볶음"],ingredients:["파프리카","양파"],time:10,diff:"쉬움",cal:88,nutriType:"채소",nutrition:{protein:2,calcium:16,iron:0.5,vitC:125,fiber:1.8},serving:"파프리카(빨강·노랑) 각 1/2개(각 80g), 양파 1/4개(50g), 올리브오일 1작은술(5ml), 소금 1/4작은술, 후추",steps:["파프리카 160g을 씨를 제거하고 1cm 두께 채로 썬다","양파 50g도 같은 두께로 채썬다","팬에 올리브오일 5ml를 두르고 강불로 달군다","양파를 먼저 1분 볶는다","파프리카를 넣고 강불에서 2분 볶는다 — 너무 오래 볶으면 물러짐","소금 1g, 후추로 간하고 참기름 한 방울로 완성"]},
  {name:"양배추볶음",safeFor:"baby",tags:["볶음"],ingredients:["양배추","당근"],time:10,diff:"쉬움",cal:82,nutriType:"채소",nutrition:{protein:2,calcium:42,iron:0.5,vitC:45,fiber:2.0},serving:"양배추 150g, 당근 30g, 굴소스 1/2큰술(7.5ml), 참기름 1작은술, 소금, 통깨",steps:["양배추 150g을 3×3cm 크기로 손으로 찢는다","당근 30g을 얇게 채썬다","팬에 기름 10ml를 강불로 달군다","당근을 먼저 30초 볶는다","양배추를 넣고 강불에서 2분 볶는다","굴소스 7.5ml, 소금으로 간한다","참기름·통깨로 마무리"]},
  {name:"가지볶음",safeFor:"baby",tags:["볶음"],ingredients:["가지","양파"],time:12,diff:"쉬움",cal:85,nutriType:"채소",nutrition:{protein:2,calcium:18,iron:0.5,vitC:5,fiber:2.2},serving:"가지 1개(150g), 양파 1/4개(50g), 간장 1큰술(15ml), 다진마늘 1/2작은술(2.5g), 설탕 1/2작은술(2.5g), 참기름 1작은술",steps:["가지 150g을 0.5cm 두께 반달 모양으로 썬다","소금을 살짝 뿌려 5분 두었다가 물기를 닦는다 — 쓴맛 제거","팬에 기름 15ml를 두르고 가지를 2분 볶는다","양파 50g을 넣고 1분 더 볶는다","간장 15ml, 다진마늘 2.5g, 설탕 2.5g을 넣어 1분 볶는다","참기름 5ml를 두르고 완성"]},
  {name:"연근조림",safeFor:"kid1",tags:["한식"],ingredients:["연근"],time:25,diff:"쉬움",cal:165,nutriType:"채소",nutrition:{protein:3,calcium:28,iron:1.0,vitC:35,fiber:3.5},serving:"연근 150g, 간장 1.5큰술(22ml), 설탕 1큰술(10g), 물엿 1큰술(15g), 식초 1작은술(5ml), 물 100ml, 참기름 1/2작은술",steps:["연근 150g의 껍질을 벗기고 0.5cm 두께로 썬다","찬물에 식초 5ml를 넣어 5분 담근다 — 갈변 방지","끓는 물에 3분 데쳐 아린맛을 제거한다","냄비에 간장·설탕·물엿·물 100ml를 넣고 끓인다","연근을 넣고 중불에서 10분 조린다","국물이 거의 없어지면 참기름·통깨로 마무리"]},
  {name:"우엉볶음",safeFor:"kid1",tags:["볶음"],ingredients:["우엉"],time:20,diff:"쉬움",cal:145,nutriType:"채소",nutrition:{protein:2,calcium:35,iron:0.8,vitC:3,fiber:5.5},serving:"우엉 100g, 당근 30g, 간장 1큰술(15ml), 설탕 1/2작은술(2.5g), 참기름 1작은술, 통깨",steps:["우엉 100g의 껍질을 칼등으로 긁어내고 얇게 어슷썬다","찬물에 5분 담가 떫은맛을 제거한다","당근 30g도 비슷한 크기로 썬다","팬에 기름 10ml로 우엉과 당근을 3분 볶는다","간장 15ml, 설탕 2.5g을 넣고 2분 더 볶는다","참기름·통깨로 마무리"]},
  {name:"단호박찜",safeFor:"baby",tags:["찜"],ingredients:["단호박"],time:20,diff:"쉬움",cal:130,nutriType:"채소",nutrition:{protein:2,calcium:22,iron:0.6,vitC:16,fiber:2.5},serving:"단호박 200g, 소금 약간, 버터 5g (선택)",steps:["단호박 200g을 반으로 갈라 씨를 숟가락으로 파낸다","껍질째 2cm 두께로 썬다","찜기에 물을 넣고 끓인 뒤 단호박을 올린다","뚜껑을 닫고 강불에서 15분 찐다","젓가락으로 찔러 쑥 들어가면 완성","소금을 살짝 뿌리거나 버터 5g을 올려 먹는다"]},
  {name:"토마토달걀볶음",safeFor:"baby",tags:["볶음","양식/퓨전"],ingredients:["토마토","계란"],time:12,diff:"쉬움",cal:155,nutriType:"채소",nutrition:{protein:8,calcium:42,iron:1.2,vitC:22,fiber:1.5},serving:"토마토 1개(150g), 계란 2개, 소금 1/4작은술, 설탕 1/4작은술, 식용유 1큰술",steps:["토마토 150g을 2cm 크기로 썬다","계란 2개를 풀어 소금으로 간한다","팬에 기름 10ml를 강불로 달군다","계란을 붓고 80% 익으면 빠르게 저어 스크램블 상태로 만들어 따로 빼둔다","같은 팬에 기름 5ml를 추가하고 토마토를 1분 볶는다","계란을 다시 넣어 30초 함께 볶는다","설탕 1g, 소금으로 간하고 완성"]},
  {name:"버섯볶음",safeFor:"baby",tags:["볶음"],ingredients:["버섯","양파"],time:12,diff:"쉬움",cal:78,nutriType:"채소",nutrition:{protein:3,calcium:12,iron:0.8,vitC:4,fiber:2.5},serving:"모듬버섯 150g(팽이·느타리·새송이), 양파 1/4개(50g), 간장 1/2큰술(7.5ml), 다진마늘 1/2작은술, 참기름 1작은술, 통깨",steps:["팽이버섯은 밑동을 자르고, 느타리·새송이는 먹기 좋게 찢는다","양파 50g을 채썬다","팬에 기름 10ml를 강불로 달군다","양파를 1분 볶는다","버섯을 넣고 2분 볶는다 — 수분이 날아가도록 강불 유지","간장 7.5ml, 다진마늘로 간한다","참기름 5ml, 통깨로 마무리"]},
  {name:"오이무침",safeFor:"toddler",tags:["찜","한식"],ingredients:["양파"],time:8,diff:"쉬움",cal:45,nutriType:"채소",nutrition:{protein:1,calcium:18,iron:0.3,vitC:8,fiber:0.8},serving:"오이 1개(150g), 소금 1작은술(절임용), 고추장 1/2작은술, 식초 1작은술(5ml), 설탕 1/2작은술(2.5g), 다진마늘 1/3작은술, 참기름 1/2작은술, 통깨",steps:["오이 150g을 0.3cm 두께로 얇게 썬다","소금 5g을 넣고 10분 절인다","물기를 손으로 꼭 짠다 — 충분히 짜야 물이 생기지 않음","고추장·식초·설탕·다진마늘·참기름을 섞어 양념을 만든다","절인 오이에 양념을 넣고 무친다","통깨로 마무리 — 어린 아이는 고추장 빼고 식초·설탕만으로도 ok"]},
  {name:"깻잎나물",safeFor:"toddler",tags:["한식"],ingredients:["깻잎"],time:10,diff:"쉬움",cal:55,nutriType:"채소",nutrition:{protein:2,calcium:85,iron:2.0,vitC:16,fiber:3.0},serving:"깻잎 60g(30장), 간장 1큰술(15ml), 다진마늘 1/2작은술(2.5g), 참기름 1작은술(5ml), 통깨, 고춧가루 약간",steps:["깻잎 30장을 흐르는 물에 한 장씩 씻는다","끓는 소금물에 20초 데쳐 찬물에 헹군다","물기를 손으로 꼭 짠다","간장·다진마늘·참기름·고춧가루를 섞어 양념을 만든다","깻잎에 양념을 넣고 조물조물 무친다","통깨로 마무리"]},
  {name:"콩조림",safeFor:"toddler",tags:["한식"],ingredients:["된장"],time:30,diff:"쉬움",cal:195,nutriType:"채소",nutrition:{protein:10,calcium:65,iron:2.5,vitC:0,fiber:5.5},serving:"검은콩(삶은 것) 100g, 간장 1.5큰술(22ml), 설탕 1큰술(10g), 물엿 1큰술(15g), 물 100ml, 참기름 1/2작은술",steps:["검은콩 100g을 물에 6시간 불린 뒤 30분 삶는다","냄비에 간장·설탕·물엿·물 100ml를 넣고 끓인다","삶은 콩을 넣고 중불에서 15분 조린다","국물이 거의 없어지면 참기름과 통깨로 마무리"]},
];

// ── 유틸 함수 ─────────────────────────────────────────────────────────────────
function pickOne(db, prefs, ingreds, usedNames = [], minAgeIndex = 3, allergenIngreds = []) {
  const ageSafe = db.filter(i => isSafeForAge(i, minAgeIndex) && !usedNames.includes(i.name) && isSafeForAllergy(i, allergenIngreds));
  const pool = ageSafe.filter(item => {
    const tagOk = prefs.length === 0 || item.tags.some(t => prefs.includes(t));
    const ingOk = ingreds.length === 0 || item.ingredients.some(i => ingreds.includes(i));
    return tagOk || ingOk;
  });
  const final = pool.length > 0 ? pool : ageSafe.length > 0 ? ageSafe : db.filter(i => isSafeForAge(i, minAgeIndex) && isSafeForAllergy(i, allergenIngreds));
  if (!final.length) return db.filter(i => isSafeForAge(i, minAgeIndex))[0] || db[0];
  return final[Math.floor(Math.random() * final.length)];
}

function pickTwoSides(prefs, ingreds, usedNames = [], minAgeIndex = 3, allergenIngreds = []) {
  const ageSafeP = SIDE_DB.filter(s => s.nutriType === "단백질" && isSafeForAge(s, minAgeIndex) && !usedNames.includes(s.name) && isSafeForAllergy(s, allergenIngreds));
  const ageSafeV = SIDE_DB.filter(s => s.nutriType === "채소" && isSafeForAge(s, minAgeIndex) && !usedNames.includes(s.name) && isSafeForAllergy(s, allergenIngreds));
  const pFinal = ageSafeP.length > 0 ? ageSafeP : SIDE_DB.filter(s => s.nutriType === "단백질" && isSafeForAge(s, minAgeIndex) && isSafeForAllergy(s, allergenIngreds));
  const vFinal = ageSafeV.length > 0 ? ageSafeV : SIDE_DB.filter(s => s.nutriType === "채소" && isSafeForAge(s, minAgeIndex) && isSafeForAllergy(s, allergenIngreds));
  const s1 = pFinal[Math.floor(Math.random() * pFinal.length)];
  const s2 = vFinal.filter(s => s.name !== s1?.name)[Math.floor(Math.random() * vFinal.length)];
  return [s1, s2].filter(Boolean);
}

function generateWeekPlan(prefs, ingreds, selectedAgeIds = [], allergenIngreds = []) {
  const minAgeIndex = getMinAgeIndex(selectedAgeIds);
  const plan = {};
  const usedRice = [], usedSoup = [], usedSides = [];
  DAYS.forEach(day => {
    plan[day] = {};
    MEALS.forEach(m => {
      const rice = pickOne(RICE_DB, prefs, ingreds, usedRice, minAgeIndex, allergenIngreds);
      const soup = pickOne(SOUP_DB, prefs, ingreds, usedSoup, minAgeIndex, allergenIngreds);
      const sides = pickTwoSides(prefs, ingreds, usedSides, minAgeIndex, allergenIngreds);
      usedRice.push(rice.name);
      usedSoup.push(soup.name);
      sides.forEach(s => usedSides.push(s.name));
      plan[day][m] = { rice, soup, sides };
    });
  });
  return plan;
}

function calcNutri(meal) {
  return [meal.rice, meal.soup, ...meal.sides].filter(Boolean).reduce((acc, item) => ({
    protein: acc.protein + (item.nutrition?.protein || 0),
    calcium: acc.calcium + (item.nutrition?.calcium || 0),
    iron: acc.iron + (item.nutrition?.iron || 0),
    vitC: acc.vitC + (item.nutrition?.vitC || 0),
    fiber: acc.fiber + (item.nutrition?.fiber || 0),
    cal: acc.cal + (item.cal || 0),
  }), { protein: 0, calcium: 0, iron: 0, vitC: 0, fiber: 0, cal: 0 });
}

const fmtN = v => typeof v === "number" && v % 1 !== 0 ? v.toFixed(1) : v;
const diffColor = d => d === "쉬움" ? "#22c55e" : d === "보통" ? "#f59e0b" : "#ef4444";

const AGE_LABELS = ["영아(0~2세)", "유아(3~5세)", "초등저학년(6~8세)", "초등고학년(9~11세)", "청소년(12~18세)"];
const AGE_COLORS = ["#f9a8d4", "#fdba74", "#86efac", "#93c5fd", "#c4b5fd"];

// ── 서브 컴포넌트 ─────────────────────────────────────────────────────────────
function NutriBar({ label, value, goal, unit, color }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div style={{ flex: 1, minWidth: 52 }}>
      <div style={{ fontSize: 10, color: "#aaa", marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color }}>{fmtN(value)}{unit}</div>
      <div style={{ height: 5, background: "#f0f0f0", borderRadius: 4, marginTop: 3, overflow: "hidden" }}>
        <div style={{ height: 5, width: `${pct}%`, background: color, borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 9, color: pct >= 80 ? color : "#ccc", marginTop: 2 }}>{pct}%</div>
    </div>
  );
}

function MealItemCard({ emoji, label, item, color, onRecipe }) {
  if (!item) return null;
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "12px 14px", marginBottom: 8, border: `1.5px solid ${color}22`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 2 }}>{emoji} {label}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#222", marginBottom: 3 }}>{item.name}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#bbb" }}>⏱ {item.time}분</span>
            <span style={{ fontSize: 11, color: diffColor(item.diff) }}>● {item.diff}</span>
            <span style={{ fontSize: 11, color: "#bbb" }}>🔥 {item.cal}kcal</span>
          </div>
        </div>
        <button onClick={onRecipe} style={{ background: color, color: "#fff", border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, marginLeft: 10 }}>조리법</button>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function MealPlanner() {
  const [step, setStep] = useState("pref");
  const [selectedAges, setAges] = useState([]);
  const [selectedFoods, setFoods] = useState([]);
  const [selectedIngreds, setIngreds] = useState([]);
  const [selectedAllergies, setAllergies] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [weekPlan, setWeekPlan] = useState(null);
  const [activeDay, setActiveDay] = useState("월");
  const [activeMeal, setActiveMeal] = useState("아침");
  const [viewRecipe, setViewRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleArr = (setArr, val) => setArr(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  const mealGoal = calcMealGoal(selectedAges);
  const allIngredNames = INGREDIENT_GROUPS.flatMap(g => g.items.map(x => x.n));
  const allergenIngredients = ALLERGY_OPTIONS.filter(a => selectedAllergies.includes(a.id)).flatMap(a => a.ingredients);

  const handleAddCustom = () => {
    const t = customInput.trim();
    if (!t) return;
    if (!selectedIngreds.includes(t)) setIngreds(prev => [...prev, t]);
    setCustomInput("");
  };

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setWeekPlan(generateWeekPlan(selectedFoods, selectedIngreds, selectedAges, allergenIngredients));
      setStep("planner");
      setLoading(false);
    }, 900);
  };

  const handleRegenMeal = () => {
    const minAgeIndex = getMinAgeIndex(selectedAges);
    const rice = pickOne(RICE_DB, selectedFoods, selectedIngreds, [], minAgeIndex, allergenIngredients);
    const soup = pickOne(SOUP_DB, selectedFoods, selectedIngreds, [], minAgeIndex, allergenIngredients);
    const sides = pickTwoSides(selectedFoods, selectedIngreds, [], minAgeIndex, allergenIngredients);
    setWeekPlan(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[activeDay][activeMeal] = { rice, soup, sides };
      return next;
    });
  };

  const ms = m => m === "아침" ? { bg: "#fffbeb", badge: "#fde68a", text: "#92400e", icon: "🌅" }
    : m === "점심" ? { bg: "#f0fdf4", badge: "#bbf7d0", text: "#14532d", icon: "☀️" }
    : { bg: "#eff6ff", badge: "#bfdbfe", text: "#1e3a8a", icon: "🌙" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(150deg,#fff8f2 0%,#ffecd8 40%,#f8f0ff 100%)", fontFamily: "Georgia, serif" }}>

      {/* 헤더 */}
      <div style={{ background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", padding: "14px 16px 10px", boxShadow: "0 4px 20px rgba(255,107,107,0.28)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🍱</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>우리 아이 주간 식단표</div>
            <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 11 }}>밥 · 국 · 반찬 2가지 균형 식단</div>
          </div>
          {step !== "pref" && (
            <button onClick={() => setStep("pref")} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "5px 11px", fontSize: 11, cursor: "pointer" }}>⚙️ 설정</button>
          )}
        </div>
      </div>

      <div style={{ padding: "14px 12px 60px" }}>

        {/* ── STEP 1: 설정 ── */}
        {step === "pref" && (
          <div>
            {/* 연령대 */}
            <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.08)", border: "1px solid #ffe4e0" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e55", marginBottom: 2 }}>👶 자녀 연령대 선택</div>
              <div style={{ fontSize: 11, color: "#bbb", marginBottom: 12 }}>여러 명이면 모두 선택 · 연령에 맞지 않는 매운·짠·딱딱한 음식은 자동 제외돼요</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {AGE_GROUPS.map(g => {
                  const sel = selectedAges.includes(g.id);
                  return (
                    <button key={g.id} onClick={() => toggleArr(setAges, g.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left", background: sel ? `${g.color}28` : "#fafafa", border: sel ? `2px solid ${g.color}` : "2px solid #f0f0f0", transition: "all 0.15s" }}>
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

            {/* 알레르기 */}
            <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 14px rgba(239,68,68,0.08)", border: "1.5px solid #fecaca" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", marginBottom: 2 }}>⚠️ 알레르기 재료 선택</div>
              <div style={{ fontSize: 11, color: "#bbb", marginBottom: 10 }}>선택한 재료가 포함된 메뉴는 식단에서 자동 제외돼요</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {ALLERGY_OPTIONS.map(a => {
                  const sel = selectedAllergies.includes(a.id);
                  return (
                    <button key={a.id} onClick={() => toggleArr(setAllergies, a.id)} style={{ padding: "7px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: sel ? "#fee2e2" : "#fff8f0", color: sel ? "#dc2626" : "#999", border: sel ? "1.5px solid #dc2626" : "1px solid #eee", fontWeight: sel ? 700 : 400 }}>{a.emoji} {a.label}</button>
                  );
                })}
              </div>
              {selectedAllergies.length > 0 && (
                <div style={{ marginTop: 10, background: "#fef2f2", borderRadius: 10, padding: "8px 12px", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13 }}>🚫</span>
                  <div style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>제외 재료: {allergenIngredients.join(", ")}</div>
                </div>
              )}
            </div>

            {/* 선호 음식 */}
            <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.07)", border: "1px solid #ffe4e0" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e55", marginBottom: 2 }}>🍽️ 선호 음식 종류</div>
              <div style={{ fontSize: 11, color: "#ccc", marginBottom: 10 }}>여러 개 선택 가능 · 없으면 전체 반영</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {FOOD_PREFS.map(f => (
                  <button key={f.id} onClick={() => toggleArr(setFoods, f.id)} style={{ padding: "7px 11px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: selectedFoods.includes(f.id) ? "#ff6b6b" : "#fff8f0", color: selectedFoods.includes(f.id) ? "#fff" : "#999", border: selectedFoods.includes(f.id) ? "1px solid #ff6b6b" : "1px solid #eee", fontWeight: selectedFoods.includes(f.id) ? 700 : 400 }}>{f.e} {f.id}</button>
                ))}
              </div>
            </div>

            {/* 냉장고 재료 */}
            <div style={{ background: "#fff", borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 14px rgba(255,107,107,0.07)", border: "1px solid #ffe4e0" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e55", marginBottom: 2 }}>🥦 냉장고 재료 선택</div>
              <div style={{ fontSize: 11, color: "#ccc", marginBottom: 12 }}>카테고리별로 있는 재료를 골라주세요</div>
              {INGREDIENT_GROUPS.map(grp => (
                <div key={grp.group} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", marginBottom: 7 }}>{grp.group}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {grp.items.map(item => (
                      <button key={item.n} onClick={() => toggleArr(setIngreds, item.n)} style={{ padding: "6px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit", background: selectedIngreds.includes(item.n) ? "#ff8e53" : "#fff8f0", color: selectedIngreds.includes(item.n) ? "#fff" : "#999", border: selectedIngreds.includes(item.n) ? "1px solid #ff8e53" : "1px solid #eee", fontWeight: selectedIngreds.includes(item.n) ? 700 : 400 }}>{item.e} {item.n}</button>
                    ))}
                  </div>
                </div>
              ))}
              {/* 직접 입력 */}
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
                        {i}<button onClick={() => setIngreds(prev => prev.filter(v => v !== i))} style={{ background: "none", border: "none", color: "#ff8e53", cursor: "pointer", fontSize: 12, padding: 0 }}>×</button>
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
                      {i}<button onClick={() => setIngreds(prev => prev.filter(v => v !== i))} style={{ background: "none", border: "none", color: "#ffb0a0", cursor: "pointer", fontSize: 11, padding: 0 }}>×</button>
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

        {/* ── STEP 2: 식단표 ── */}
        {step === "planner" && weekPlan && (() => {
          const meal = weekPlan[activeDay][activeMeal];
          const nutri = calcNutri(meal);
          const style = ms(activeMeal);
          const selGroups = AGE_GROUPS.filter(g => selectedAges.includes(g.id));
          return (
            <div>
              {selGroups.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {selGroups.map(g => (
                    <div key={g.id} style={{ background: `${g.color}28`, border: `1px solid ${g.color}`, borderRadius: 20, padding: "3px 9px", fontSize: 11, fontWeight: 700, color: "#555" }}>{g.emoji} {g.label}</div>
                  ))}
                  {selGroups.length > 1 && <div style={{ background: "#f3f4f6", borderRadius: 20, padding: "3px 9px", fontSize: 10, color: "#aaa" }}>평균 영양목표</div>}
                </div>
              )}

              {/* 요일 탭 */}
              <div style={{ display: "flex", gap: 5, marginBottom: 10, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                {DAYS.map(d => (
                  <button key={d} onClick={() => setActiveDay(d)} style={{ minWidth: 36, padding: "6px 8px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, background: activeDay === d ? "#ff6b6b" : "#fff", color: activeDay === d ? "#fff" : "#ccc", border: activeDay === d ? "1px solid #ff6b6b" : "1px solid #eee", boxShadow: activeDay === d ? "0 2px 8px rgba(255,107,107,0.28)" : "none" }}>{d}</button>
                ))}
              </div>

              {/* 끼니 탭 */}
              <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
                {MEALS.map(m => { const s = ms(m); return (
                  <button key={m} onClick={() => setActiveMeal(m)} style={{ flex: 1, padding: "8px 0", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: activeMeal === m ? s.badge : "#fff", color: activeMeal === m ? s.text : "#ccc", border: activeMeal === m ? `1.5px solid ${s.text}55` : "1px solid #eee" }}>{s.icon} {m}</button>
                ); })}
              </div>

              {/* 칼로리 */}
              <div style={{ background: style.bg, borderRadius: 16, padding: "11px 15px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${style.text}22` }}>
                <div>
                  <div style={{ fontSize: 10, color: "#aaa" }}>{activeDay}요일 {activeMeal} 총 열량</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: style.text }}>{nutri.cal} <span style={{ fontSize: 12, fontWeight: 400 }}>kcal</span></div>
                  <div style={{ fontSize: 10, color: "#bbb", marginTop: 1 }}>밥+국+반찬2가지 · 1인분 기준</div>
                </div>
                <span style={{ fontSize: 28 }}>{style.icon}</span>
              </div>

              {/* 영양 충족률 */}
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

              {/* 식단 구성 */}
              <MealItemCard emoji="🍚" label="밥 / 덮밥" item={meal.rice} color="#f97316" onRecipe={() => { setViewRecipe(meal.rice); setStep("recipe"); }} />
              <MealItemCard emoji="🍲" label="국 / 찌개" item={meal.soup} color="#3b82f6" onRecipe={() => { setViewRecipe(meal.soup); setStep("recipe"); }} />
              {meal.sides.map((side, i) => (
                <MealItemCard key={i} emoji="🥗" label={`반찬 ${i + 1} (${side.nutriType})`} item={side} color={i === 0 ? "#8b5cf6" : "#22c55e"} onRecipe={() => { setViewRecipe(side); setStep("recipe"); }} />
              ))}

              {/* 장보기 */}
              <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", border: "1px solid #ffd8d0", borderRadius: 16, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e55", marginBottom: 7 }}>🛒 {activeDay}요일 {activeMeal} 장보기 목록</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {[...new Set([meal.rice, meal.soup, ...meal.sides].flatMap(i => i?.ingredients || []))].map(ing => (
                    <span key={ing} style={{ background: "#fff", border: "1px solid #ffc0a0", borderRadius: 8, padding: "3px 8px", fontSize: 12, color: "#e55" }}>{ing}</span>
                  ))}
                </div>
              </div>

              <button onClick={handleRegenMeal} style={{ width: "100%", padding: "13px", borderRadius: 14, fontSize: 13, fontWeight: 700, background: "#fff", color: "#ff6b6b", border: "2px solid #ff6b6b", cursor: "pointer", fontFamily: "inherit" }}>🔄 이 끼니 다시 뽑기</button>
            </div>
          );
        })()}

        {/* ── STEP 3: 조리법 ── */}
        {step === "recipe" && viewRecipe && (
          <div>
            <button onClick={() => setStep("planner")} style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 14, fontFamily: "inherit" }}>← 식단표로 돌아가기</button>

            <div style={{ background: "#fff", borderRadius: 20, padding: 16, boxShadow: "0 4px 24px rgba(255,107,107,0.1)", border: "1px solid #ffe0e0", marginBottom: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#222", marginBottom: 6 }}>{viewRecipe.name}</div>

              {/* 뱃지 */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: "#aaa" }}>⏱ {viewRecipe.time}분</span>
                <span style={{ fontSize: 11, color: "#aaa" }}>🔥 {viewRecipe.cal}kcal</span>
                <span style={{ fontSize: 11, color: diffColor(viewRecipe.diff) }}>● {viewRecipe.diff}</span>
                <span style={{ fontSize: 11, color: "#ff8e53", fontWeight: 600 }}>👤 1인분</span>
                {viewRecipe.safeFor && (() => {
                  const idx = AGE_ORDER.indexOf(viewRecipe.safeFor);
                  return <span style={{ fontSize: 11, background: AGE_COLORS[idx] + "44", color: "#555", border: `1px solid ${AGE_COLORS[idx]}`, borderRadius: 20, padding: "1px 8px", fontWeight: 600 }}>✅ {AGE_LABELS[idx]}부터 OK</span>;
                })()}
              </div>

              {/* 1인분 정량 */}
              {viewRecipe.serving && (
                <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", borderRadius: 12, padding: "11px 13px", marginBottom: 13, border: "1px solid #ffd0b0" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#e55", marginBottom: 7 }}>⚖️ 1인분 재료 정량</div>
                  <div style={{ fontSize: 12, color: "#666", lineHeight: 1.9 }}>
                    {viewRecipe.serving.split(", ").map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 1 }}>
                        <span style={{ color: "#ff8e53", fontSize: 10, marginTop: 4, flexShrink: 0 }}>●</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "#bbb", marginTop: 6 }}>💡 아이 나이에 따라 70~80% 양으로 조절해주세요</div>
                </div>
              )}

              {/* 영양 정보 */}
              <div style={{ background: "#f8f8ff", borderRadius: 12, padding: "10px 12px", marginBottom: 13 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 7 }}>🧬 1인분 영양 정보</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {[["단백질", viewRecipe.nutrition?.protein, "g", "#6366f1"], ["칼슘", viewRecipe.nutrition?.calcium, "mg", "#22c55e"], ["철분", viewRecipe.nutrition?.iron, "mg", "#f59e0b"], ["비타민C", viewRecipe.nutrition?.vitC, "mg", "#ef4444"], ["식이섬유", viewRecipe.nutrition?.fiber, "g", "#8b5cf6"]].map(([n, v, u, c]) => (
                    <div key={n} style={{ background: "#fff", border: `1px solid ${c}33`, borderRadius: 8, padding: "4px 9px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#bbb" }}>{n}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{fmtN(v)}{u}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 재료 */}
              <div style={{ marginBottom: 13 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e55", marginBottom: 7 }}>🥕 필요한 재료</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {viewRecipe.ingredients.map(ing => (
                    <span key={ing} style={{ background: "#fff8f0", border: "1px solid #ffd0b0", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#d4601a" }}>{ing}</span>
                  ))}
                </div>
              </div>

              {/* 조리 순서 */}
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e55", marginBottom: 9 }}>👩‍🍳 상세 조리 순서</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {viewRecipe.steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 12px", borderRadius: 12, background: i % 2 === 0 ? "#fff8f0" : "#f0f8ff" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#ff6b6b,#ff8e53)", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</div>
                    <div style={{ fontSize: 13, color: "#444", lineHeight: 1.7 }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", border: "1px solid #ffe0e0", borderRadius: 14, padding: "11px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#e55", marginBottom: 4 }}>💡 엄마 팁</div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.8 }}>재료를 잘게 다지거나 좋아하는 소스를 곁들이면 편식하는 아이도 잘 먹어요. 처음 접하는 재료는 소량부터 시도해보세요 🌟<br /><span style={{ color: "#f59e0b", fontWeight: 600 }}>아이 연령에 따라 1인분의 70~80% 양으로 조절하는 것을 권장해요.</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

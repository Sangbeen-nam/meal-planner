export const DAYS = ["월","화","수","목","금","토","일"];
export const MEALS = ["아침","점심","저녁"];

export const FOOD_PREFS = [
  {id:"한식",e:"🍚"},{id:"일식",e:"🍣"},{id:"중식",e:"🥟"},{id:"분식",e:"🥙"},
  {id:"국/찌개",e:"🍲"},{id:"볶음",e:"🥘"},{id:"구이",e:"🔥"},{id:"찜",e:"♨️"},
  {id:"덮밥",e:"🍛"},{id:"양식/퓨전",e:"🍝"},{id:"면 요리",e:"🍜"},{id:"죽/스프",e:"🥣"},
  {id:"튀김/전",e:"🥞"},{id:"간식",e:"🍎"},
];

export const INGREDIENT_GROUPS = [
  {group:"🥩 육류",items:[{n:"닭고기",e:"🍗"},{n:"돼지고기",e:"🥩"},{n:"소고기",e:"🐄"},{n:"닭가슴살",e:"🍗"},{n:"삼겹살",e:"🥓"},{n:"다진고기",e:"🥩"}]},
  {group:"🐟 해산물",items:[{n:"새우",e:"🦐"},{n:"참치",e:"🐟"},{n:"멸치",e:"🐠"},{n:"오징어",e:"🦑"},{n:"조개",e:"🦪"},{n:"연어",e:"🐡"},{n:"게맛살",e:"🦀"},{n:"전복",e:"🐚"},{n:"동태",e:"🐟"},{n:"미역",e:"🌊"},{n:"홍합",e:"🦪"},{n:"대구",e:"🐟"},{n:"황태",e:"🐟"},{n:"낙지",e:"🦑"}]},
  {group:"🥬 잎채소",items:[{n:"시금치",e:"🥬"},{n:"깻잎",e:"🌿"},{n:"양배추",e:"🥬"},{n:"아욱",e:"🌿"},{n:"청경채",e:"🥬"},{n:"시래기",e:"🌿"},{n:"쑥",e:"🌿"},{n:"봄동",e:"🥬"},{n:"달래",e:"🌿"},{n:"열무",e:"🥬"},{n:"고사리",e:"🌿"}]},
  {group:"🥕 뿌리채소",items:[{n:"당근",e:"🥕"},{n:"감자",e:"🥔"},{n:"고구마",e:"🍠"},{n:"무",e:"⬜"},{n:"연근",e:"🌾"},{n:"우엉",e:"🌿"}]},
  {group:"🍅 열매채소",items:[{n:"토마토",e:"🍅"},{n:"파프리카",e:"🫑"},{n:"가지",e:"🍆"},{n:"애호박",e:"🥒"},{n:"단호박",e:"🎃"},{n:"아보카도",e:"🥑"}]},
  {group:"🌿 기타채소",items:[{n:"양파",e:"🧅"},{n:"대파",e:"🌿"},{n:"버섯",e:"🍄"},{n:"콩나물",e:"🌱"},{n:"브로콜리",e:"🥦"}]},
  {group:"🥚 단백질/유제품",items:[{n:"계란",e:"🥚"},{n:"두부",e:"⬜"},{n:"치즈",e:"🧀"},{n:"우유",e:"🥛"},{n:"요거트",e:"🫙"}]},
  {group:"🌾 곡류/면류",items:[{n:"쌀",e:"🍚"},{n:"현미",e:"🌾"},{n:"흑미",e:"🌾"},{n:"메밀",e:"🟤"},{n:"밀가루",e:"🌾"},{n:"면",e:"🍝"},{n:"당면",e:"🍜"},{n:"떡",e:"🍡"}]},
  {group:"🥜 견과/기타",items:[{n:"잣",e:"🌰"},{n:"팥",e:"🫘"},{n:"녹두",e:"🫘"}]},
  {group:"🧄 양념/기타",items:[{n:"김치",e:"🌶️"},{n:"된장",e:"🟤"},{n:"고추장",e:"🔴"},{n:"간장",e:"🍶"},{n:"마늘",e:"🧄"},{n:"청국장",e:"🟤"},{n:"들깨",e:"🌰"}]},
  {group:"🏭 가공식품",items:[{n:"소시지",e:"🌭"},{n:"햄",e:"🥓"},{n:"맛살",e:"🦀"},{n:"베이컨",e:"🥓"},{n:"비엔나소시지",e:"🌭"},{n:"냉동완두콩",e:"🫛"},{n:"냉동옥수수",e:"🌽"}]},
];

export const AGE_GROUPS = [
  {id:"baby",   label:"영아",      range:"0~2세",  emoji:"🍼",color:"#f9a8d4",daily:{protein:15,calcium:400,iron:6, vitC:35,fiber:10}},
  {id:"toddler",label:"유아",      range:"3~5세",  emoji:"🐣",color:"#fdba74",daily:{protein:20,calcium:600,iron:7, vitC:45,fiber:15}},
  {id:"kid1",   label:"초등저학년",range:"6~8세",  emoji:"🎒",color:"#86efac",daily:{protein:30,calcium:700,iron:8, vitC:60,fiber:18}},
  {id:"kid2",   label:"초등고학년",range:"9~11세", emoji:"📚",color:"#93c5fd",daily:{protein:40,calcium:800,iron:10,vitC:70,fiber:20}},
  {id:"teen",   label:"청소년",    range:"12~18세",emoji:"🏃",color:"#c4b5fd",daily:{protein:55,calcium:1000,iron:14,vitC:90,fiber:25}},
];

export const AGE_ORDER = ["baby","toddler","kid1","kid2","teen"];

export const ALLERGY_OPTIONS = [
  { id: "계란",   label: "계란",      emoji: "🥚", ingredients: ["계란"] },
  { id: "우유",   label: "우유/유제품",emoji: "🥛", ingredients: ["우유", "치즈"] },
  { id: "밀",     label: "밀/글루텐", emoji: "🌾", ingredients: ["면", "당면"] },
  { id: "새우",   label: "새우",      emoji: "🦐", ingredients: ["새우"] },
  { id: "땅콩",   label: "땅콩",      emoji: "🥜", ingredients: ["땅콩"] },
];

export const AGE_LABELS = ["영아(0~2세)", "유아(3~5세)", "초등저학년(6~8세)", "초등고학년(9~11세)", "청소년(12~18세)"];
export const AGE_COLORS = ["#f9a8d4", "#fdba74", "#86efac", "#93c5fd", "#c4b5fd"];

export const diffColor = d => d === "쉬움" ? "#22c55e" : d === "보통" ? "#f59e0b" : "#ef4444";

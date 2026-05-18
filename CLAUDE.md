# 우리아이 식단표 / mealplanner365.co.kr 프로젝트 지침서
> 이 파일은 Claude Code, Gemini 등 모든 AI가 작업 전 반드시 읽어야 합니다.

## 프로젝트 개요
- 서비스명: 우리아이 식단표 (mealplanner365.co.kr)
- 기술스택: React + Vite, Vercel 배포, LocalStorage 데이터 저장
- GitHub: https://github.com/Sangbeen-nam/meal-planner
- 배포 URL: https://mealplanner365.co.kr
- Google Analytics: G-72H3TEWQ85

## 파일 구조
src/
├── MealPlanner.jsx        # 메인 UI (핵심 파일, 신중하게 수정)
├── main.jsx               # React 진입점
├── data/
│   ├── constants.js       # 연령/알레르기/식재료 상수
│   ├── riceDB.js          # 밥·면·죽 DB (59개)
│   ├── soupDB.js          # 국·찌개·탕 DB (57개)
│   ├── sideDB.js          # 반찬 DB (131개)
│   └── coupangLinks.js    # 쿠팡 링크 (절대 수정 금지)
├── utils/
│   ├── mealPicker.js      # 식단 생성 로직
│   └── nutrition.js       # 영양소 계산
└── components/
    ├── MealItemCard.jsx
    ├── NutriBar.jsx
    ├── RecipeView.jsx
    └── ShoppingList.jsx

## DB 현황
- 밥·면·죽: 59개 (riceDB.js)
- 국·찌개·탕: 57개 (soupDB.js)
- 반찬: 131개 (sideDB.js)
- 식재료: 90개 (constants.js)
- 합계: 247개

## 완료된 주요 기능
- 연령별 맞춤 식단 자동 생성 (영아/유아/초등저/초등고/청소년)
- 알레르기 필터링
- 히스토리 기반 가중치 알고리즘 (최근 3일 중복 방지)
- 일간/주간 보기 전환
- 식단표 이미지 저장 + 워터마크
- 카카오톡 공유
- 쿠팡 파트너스 연동
- Google Analytics, AdSense 연동
- 개인정보처리방침, 이용약관, 서비스소개, 문의하기 페이지

## 파일 구조 규칙
- 메뉴 데이터는 src/data/ 폴더에만 추가
- UI 컴포넌트는 src/components/에만 추가
- 로직 함수는 src/utils/에만 추가
- MealPlanner.jsx에 DB 직접 추가 금지

## 메뉴 추가 규칙
- 모든 메뉴에 safeFor, nutrition, serving, steps 필수
- 가공식품은 isProcessed: true 추가
- 연령 기본값은 항상 baby

## Git 커밋 규칙
- feat: 새 기능 추가
- fix: 버그 수정
- data: DB 메뉴 추가
- style: UI 변경
- refactor: 코드 구조 변경
- docs: 문서 변경

## 작업 완료 후 필수 절차 (반드시 순서대로)
1. npm run build → 빌드 오류 없는지 반드시 확인
2. 오류 없을 때만: git add . && git commit -m "커밋메시지" && git push origin main
3. Vercel 자동 배포 확인
4. 배포 완료 후 상빈님께 결과 보고

## AI 작업 원칙 (Claude Code, Gemini 모두 해당)
- 작업 시작 전 반드시 이 파일 먼저 읽기
- 한 번에 한 가지 작업만 수행
- 작업 전 반드시 관련 파일 먼저 읽기
- 수정 범위를 최소화하고 영향받는 파일 명시
- 빌드 오류 발생 시 즉시 원인 파악 후 수정
- 불확실한 작업은 상빈님께 먼저 확인 후 진행
- 작업 완료 후 변경된 파일 목록과 내용 요약 보고
- 절대로 추측으로 작업하지 않기
- 다른 AI가 작업한 내용을 임의로 리팩토링하거나 구조 변경 금지

## 금지사항
- 한 번에 여러 기능 동시 수정 금지
- 테스트 없이 대규모 리팩토링 금지
- MealPlanner.jsx에 직접 DB 추가 금지
- 빌드 확인 없이 커밋·푸시 금지
- 상빈님 확인 없이 배포 URL·도메인 변경 금지
- 상빈님 확인 없이 package.json 의존성 추가 금지
- 다른 AI가 만든 컴포넌트 임의 삭제 또는 병합 금지
- git reset, git rebase 등 히스토리 변경 명령어 사용 금지

## 절대 수정 금지 파일
- src/data/coupangLinks.js
  → 상빈님이 직접 관리하는 파일
  → 어떤 경우에도 임의로 수정 금지
  → 링크 추가·수정·삭제 모두 금지
  → 새 재료 추가 시 빈칸("")으로만 추가

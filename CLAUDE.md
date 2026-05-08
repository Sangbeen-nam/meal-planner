# 우리아이 식단표 프로젝트

## 기술 스택
- React + Vite
- Vercel 배포 (meal-planner-iota-nine.vercel.app)
- LocalStorage 데이터 저장
- Google Analytics G-72H3TEWQ85 적용

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

## 금지사항
- 한 번에 여러 기능 동시 수정 금지
- 테스트 없이 대규모 리팩토링 금지
- MealPlanner.jsx에 직접 DB 추가 금지

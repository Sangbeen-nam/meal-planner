# 우리아이 식단표 프로젝트

## 기술 스택
- React + Vite
- Vercel 배포 (mealplanner365.co.kr)
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

## 작업 완료 후 필수 절차 (반드시 순서대로)
1. npm run build → 빌드 오류 없는지 반드시 확인
2. 오류 없을 때만 아래 명령어 실행:
   git add . && git commit -m "커밋메시지" && git push origin main
3. Vercel 자동 배포 확인
4. 배포 완료 후 상빈님께 결과 보고

## Claude 작업 원칙 (반드시 준수)
- 한 번에 한 가지 작업만 수행
- 작업 전 반드시 관련 파일 먼저 읽기
- 수정 범위를 최소화하고 영향받는 파일 명시
- 빌드 오류 발생 시 즉시 원인 파악 후 수정
- 불확실한 작업은 상빈님께 먼저 확인 후 진행
- 작업 완료 후 변경된 파일 목록과 내용 요약 보고
- 절대로 추측으로 작업하지 않기

## 금지사항
- 한 번에 여러 기능 동시 수정 금지
- 테스트 없이 대규모 리팩토링 금지
- MealPlanner.jsx에 직접 DB 추가 금지
- 빌드 확인 없이 커밋·푸시 금지
- 상빈님 확인 없이 배포 URL·도메인 변경 금지
- 상빈님 확인 없이 package.json 의존성 추가 금지

## 절대 수정 금지 파일
- src/data/coupangLinks.js
  → 이 파일은 상빈님이 직접 관리합니다.
  → 어떤 경우에도 임의로 수정하지 마세요.
  → 링크 추가·수정·삭제 모두 금지입니다.
  → 새 재료 추가 시 빈칸("")으로만 추가할 것.

## 완료 후
git add . && git commit -m "docs: CLAUDE.md 작업 지침 업데이트" && git push origin main

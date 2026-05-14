export default function TermsPage({ onBack }) {
  const card = {
    background: "#fff",
    borderRadius: 16,
    padding: "16px 18px",
    marginBottom: 12,
    boxShadow: "0 2px 14px rgba(255,107,107,0.08)",
    border: "1px solid #ffe4e0",
  };
  const h2 = { fontSize: 14, fontWeight: 700, color: "#e55", marginBottom: 8 };
  const p  = { fontSize: 12, color: "#666", lineHeight: 1.9, margin: 0 };
  const li = { fontSize: 12, color: "#666", lineHeight: 1.9, marginLeft: 12 };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(150deg,#fff8f2 0%,#ffecd8 40%,#f8f0ff 100%)", fontFamily: "Georgia, serif" }}>
      <div style={{ background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", padding: "14px 16px 10px", boxShadow: "0 4px 20px rgba(255,107,107,0.28)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "5px 13px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← 돌아가기</button>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>이용약관</div>
        </div>
      </div>

      <div style={{ padding: "16px 14px 60px" }}>

        <div style={{ ...card, background: "#fff8f0", border: "1px solid #ffd0b0" }}>
          <p style={{ ...p, color: "#aaa", textAlign: "center" }}>시행일: 2026년 5월 14일</p>
        </div>

        <div style={card}>
          <div style={h2}>제1조 (목적)</div>
          <p style={p}>
            이 약관은 우리아이 주간 식단표(이하 '서비스')의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
          </p>
        </div>

        <div style={card}>
          <div style={h2}>제2조 (서비스 내용)</div>
          <p style={p}>본 서비스는 다음의 기능을 무료로 제공합니다.</p>
          <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}>
            {[
              "연령별(영아·유아·초등·청소년) 주간 식단 자동 생성",
              "알레르기 및 기피 재료 자동 필터링",
              "냉장고 재료 기반 맞춤 메뉴 추천",
              "메뉴별 조리법 및 1인분 영양 정보 제공",
              "주간 장보기 목록 자동 생성",
            ].map((t, i) => <li key={i} style={li}>• {t}</li>)}
          </ul>
        </div>

        <div style={card}>
          <div style={h2}>제3조 (서비스 이용)</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <li style={li}>1. 본 서비스는 별도의 회원가입 없이 누구나 무료로 이용할 수 있습니다.</li>
            <li style={li}>2. 이용자가 입력한 정보(연령, 알레르기 등)는 해당 기기의 브라우저 LocalStorage에만 저장되며, 서버로 전송되지 않습니다.</li>
            <li style={li}>3. 서비스는 모바일 및 PC 브라우저 환경을 지원합니다.</li>
          </ul>
        </div>

        <div style={card}>
          <div style={h2}>제4조 (면책 조항)</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <li style={li}>1. 본 서비스의 식단은 일반적인 참고 정보이며, 의학적·영양학적 전문 진단을 대체하지 않습니다.</li>
            <li style={li}>2. 심각한 알레르기, 만성 질환, 특수 의료 상태가 있는 경우 반드시 전문의와 상담하십시오.</li>
            <li style={li}>3. 운영자는 서비스 제공 식단으로 인해 발생한 건강상의 문제에 대해 책임을 지지 않습니다.</li>
            <li style={li}>4. 운영자는 서비스의 일시 중단, 변경, 종료에 대해 사전 통지 없이 진행할 수 있습니다.</li>
          </ul>
        </div>

        <div style={card}>
          <div style={h2}>제5조 (광고 게재)</div>
          <p style={p}>
            본 서비스는 운영 비용 충당을 위해 구글 애드센스(Google AdSense) 광고를 게재할 수 있습니다.
            광고는 Google의 시스템에 의해 자동으로 선택·표시되며, 운영자는 광고 내용에 대한 책임을 지지 않습니다.
            이용자는 광고를 클릭할 의무가 없습니다.
          </p>
        </div>

        <div style={card}>
          <div style={h2}>제6조 (쿠팡파트너스 제휴)</div>
          <p style={p}>
            본 서비스의 장보기 링크는 쿠팡파트너스 활동의 일환으로 운영되며, 이를 통해 일정액의 수수료를 제공받을 수 있습니다.
            단, 상품 가격 및 구매 조건은 일반 이용자와 동일하게 적용되며, 이용자의 구매 비용에 영향을 주지 않습니다.
          </p>
        </div>

        <div style={card}>
          <div style={h2}>제7조 (저작권)</div>
          <p style={p}>
            본 서비스의 모든 콘텐츠(식단 데이터, UI 디자인, 조리법 등)에 대한 저작권은 운영자에게 있습니다.
            이용자는 서비스 내 콘텐츠를 개인적인 용도로 사용할 수 있으나, 무단 복제·배포·상업적 이용은 금지됩니다.
          </p>
        </div>

        <div style={card}>
          <div style={h2}>제8조 (약관 변경)</div>
          <p style={p}>
            운영자는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지를 통해 효력이 발생합니다.
            변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하시면 됩니다.
          </p>
        </div>

        <div style={card}>
          <div style={h2}>제9조 (문의)</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <li style={li}>- 운영자: 남상빈</li>
            <li style={li}>- 이메일: <a href="mailto:skatkdqla173123@gmail.com" style={{ color: "#ff6b6b" }}>skatkdqla173123@gmail.com</a></li>
            <li style={li}>- 답변 기간: 영업일 3일 이내</li>
          </ul>
        </div>

        <div style={{ ...card, background: "#fff8f0", border: "1px solid #ffd0b0" }}>
          <div style={{ fontSize: 11, color: "#aaa", textAlign: "center" }}>본 이용약관은 2026년 5월 14일부터 적용됩니다.</div>
        </div>

      </div>
    </div>
  );
}

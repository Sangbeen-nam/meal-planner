export default function AboutPage({ onBack }) {
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

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(150deg,#fff8f2 0%,#ffecd8 40%,#f8f0ff 100%)", fontFamily: "Georgia, serif" }}>
      <div style={{ background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", padding: "14px 16px 10px", boxShadow: "0 4px 20px rgba(255,107,107,0.28)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "5px 13px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← 돌아가기</button>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>서비스 소개</div>
        </div>
      </div>

      <div style={{ padding: "16px 14px 60px" }}>

        {/* 히어로 */}
        <div style={{ ...card, background: "linear-gradient(135deg,#fff8f0,#fff0f8)", border: "2px solid #ffd0b0", textAlign: "center", padding: "28px 18px" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🍱</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#e55", marginBottom: 8 }}>우리 아이 주간 식단표</div>
          <p style={{ ...p, textAlign: "center", fontSize: 13, color: "#888" }}>
            연령별 맞춤 식단을 자동으로 생성해드리는 무료 서비스입니다.<br />
            영아부터 청소년까지, 알레르기·편식 걱정 없이 균형 잡힌 한 끼를 계획하세요.
          </p>
        </div>

        {/* 서비스 목적 */}
        <div style={card}>
          <div style={h2}>💡 왜 만들었나요?</div>
          <p style={p}>
            매일 아이 밥상을 차리는 부모님들의 가장 큰 고민은 "오늘 뭐 먹이지?"입니다.
            영양은 챙겨야 하고, 편식은 심하고, 장보기 목록까지 직접 만들다 보면 하루가 금방 지나가버리죠.
            <br /><br />
            이 서비스는 그 고민을 덜어드리기 위해 만들어졌습니다. 아이의 연령과 알레르기 정보만 입력하면
            밥·국·반찬 2가지로 구성된 균형 잡힌 주간 식단을 자동으로 생성하고,
            필요한 재료를 한 번에 정리한 장보기 목록까지 제공합니다.
          </p>
        </div>

        {/* 주요 기능 */}
        <div style={card}>
          <div style={h2}>✨ 주요 기능</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["🍼", "연령별 맞춤 식단", "영아(0~2세)부터 청소년(12~18세)까지 연령에 맞는 재료와 조리법으로 식단을 구성합니다."],
              ["⚠️", "알레르기 자동 필터", "계란·우유·밀·새우·땅콩 등 주요 알레르기 식품을 선택하면 해당 재료가 포함된 메뉴를 자동으로 제외합니다."],
              ["🥦", "냉장고 재료 활용", "현재 있는 재료를 선택하면 그 재료가 들어간 메뉴를 우선으로 추천합니다."],
              ["🔄", "메뉴 즉시 교체", "마음에 들지 않는 메뉴는 🔄 버튼 한 번으로 바로 다른 메뉴로 바꿀 수 있습니다."],
              ["🛒", "장보기 목록 자동 생성", "주간 식단에 필요한 재료를 한눈에 확인할 수 있습니다."],
              ["🧬", "영양 충족률 확인", "단백질·칼슘·철분·비타민C·식이섬유의 1끼 영양 충족률을 한눈에 확인할 수 있습니다."],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 12px", background: "#fff8f0", borderRadius: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e55", marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#888", lineHeight: 1.7 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 연령별 식단 기준 */}
        <div style={card}>
          <div style={h2}>📊 연령별 식단 구성 기준</div>
          <div style={{ background: "#fff8f0", border: "1px solid #ffd0b0", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#c2410c", marginBottom: 6 }}>📋 데이터 출처</div>
            <ul style={{ margin: 0, padding: "0 0 0 16px", color: "#666", fontSize: 12, lineHeight: 2 }}>
              <li>한국영양학회 한국인 영양소 섭취기준 (KDRI 2020)</li>
              <li>식품의약품안전처 식품영양성분 데이터베이스</li>
              <li>연령별 권장 섭취량 기준은 KDRI 2020을 따랐습니다.</li>
            </ul>
          </div>
          {[
            ["🍼", "영아 (0~2세)", "#f9a8d4", "묽은 죽·이유식 위주로 구성하며, 알레르기 유발 가능 식품을 신중하게 도입합니다. 염분·설탕은 최소화합니다."],
            ["🐣", "유아 (3~5세)", "#fdba74", "밥·국·반찬 형태로 전환하되, 재료를 작게 썰어 소화하기 쉽게 조리합니다. 다양한 채소와 단백질을 골고루 제공합니다."],
            ["🎒", "초등 저학년 (6~8세)", "#86efac", "성장기 칼슘·철분 보충을 위한 메뉴를 강화합니다. 편식 교정에 도움이 되는 다양한 조리법을 활용합니다."],
            ["📚", "초등 고학년 (9~11세)", "#93c5fd", "활동량 증가에 맞춰 탄수화물과 단백질 비중을 높입니다. 간식을 포함한 균형 잡힌 구성을 제공합니다."],
            ["🏃", "청소년 (12~18세)", "#c4b5fd", "급성장기에 필요한 칼슘(1,000mg/일)과 철분을 충분히 제공합니다. 패스트푸드 대신 건강한 한 끼를 제안합니다."],
          ].map(([emoji, label, color, desc]) => (
            <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", background: color + "22", borderRadius: 12, marginBottom: 8, border: `1px solid ${color}` }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 11, color: "#777", lineHeight: 1.7 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 주의사항 */}
        <div style={{ ...card, background: "#fffbeb", border: "1px solid #fde68a" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>⚠️ 이용 시 주의사항</div>
          <p style={{ ...p, color: "#78350f" }}>
            본 서비스의 식단은 일반적인 참고 정보를 제공하며, 의학적·영양학적 전문 진단을 대체하지 않습니다.
            심각한 알레르기, 만성 질환, 특수 의료 상태가 있는 경우 반드시 소아과 전문의 또는 영양사와 상담하십시오.
          </p>
        </div>

        {/* 운영자 정보 */}
        <div style={card}>
          <div style={h2}>👤 운영자 소개</div>
          <p style={{ ...p, marginBottom: 14 }}>
            안녕하세요, 두 아이를 키우는 워킹대디 남상빈입니다.<br />
            매일 저녁 "오늘 뭐 먹이지?" 고민하다 직접 이 앱을 만들었습니다.<br />
            한국영양학회와 식약처 데이터를 기반으로, 우리 아이에게 맞는 식단을<br />
            3초 안에 찾을 수 있도록 설계했습니다.<br />
            피드백은 언제든 환영합니다.
          </p>
          <div style={{ fontSize: 12, color: "#666", lineHeight: 2 }}>
            <div>운영자: 남상빈</div>
            <div>이메일: <a href="mailto:skatkdqla173123@gmail.com" style={{ color: "#ff6b6b" }}>skatkdqla173123@gmail.com</a></div>
            <div>서비스: mealplanner365.co.kr</div>
            <div>시작: 2026년</div>
          </div>
        </div>

      </div>
    </div>
  );
}

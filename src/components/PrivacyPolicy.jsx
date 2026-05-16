export default function PrivacyPolicy({ onBack }) {
  const card = {
    background: "#fff",
    borderRadius: 16,
    padding: "16px 18px",
    marginBottom: 12,
    boxShadow: "0 2px 14px rgba(255,107,107,0.08)",
    border: "1px solid #ffe4e0",
  };
  const h2 = { fontSize: 14, fontWeight: 700, color: "#e55", marginBottom: 8 };
  const p  = { fontSize: 12, color: "#666", lineHeight: 1.8 };
  const li = { fontSize: 12, color: "#666", lineHeight: 1.8, marginLeft: 12 };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(150deg,#fff8f2 0%,#ffecd8 40%,#f8f0ff 100%)", fontFamily: "Georgia, serif" }}>
      <div style={{ background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", padding: "14px 16px 10px", boxShadow: "0 4px 20px rgba(255,107,107,0.28)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "5px 13px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← 돌아가기</button>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>개인정보처리방침</div>
        </div>
      </div>

      <div style={{ padding: "16px 14px 60px" }}>
        <div style={card}>
          <p style={p}>
            우리아이 주간 식단표(이하 '서비스')는 이용자의 개인정보를 소중히 다루며, 개인정보 보호법 제30조에 따라 이용자의 개인정보를 보호하고 고충을 신속하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>
        </div>

        <div style={card}>
          <div style={h2}>제1조 (개인정보의 처리 목적 및 항목)</div>
          <p style={p}>
            본 서비스는 별도의 회원가입 없이 이용 가능하며, 이름·연락처 등 직접적으로 개인을 식별할 수 있는 정보를 수집하지 않습니다. 다만, 서비스 개선 및 분석을 위해 아래 정보가 자동으로 생성되어 수집될 수 있습니다.
          </p>
          <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}>
            <li style={li}>1. 수집 항목: 서비스 이용 기록, 접속 IP, 쿠키, 방문 일시, 브라우저 및 OS 정보</li>
            <li style={li}>2. 수집 방법: Google Analytics를 통한 자동 수집</li>
            <li style={li}>3. 이용 목적: 서비스 통계 분석, 서비스 품질 개선, 이용자 맞춤형 정보 제공</li>
          </ul>
        </div>

        <div style={card}>
          <div style={h2}>제2조 (개인정보의 국외 이전)</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {[
              ["받는 곳", "Google (Google Analytics)"],
              ["이전 국가", "미국"],
              ["이전 방법", "서비스 이용 시 네트워크를 통한 실시간 전송"],
              ["이전 항목", "쿠키 정보, 접속 IP, 방문 기록 등 (비식별화된 행동 로그)"],
              ["이전 목적", "이용 통계 분석 및 서비스 개선"],
              ["보유 기간", "Google Analytics 정책에 따름"],
            ].map(([k, v]) => (
              <li key={k} style={{ ...li, display: "flex", gap: 6 }}>
                <span style={{ color: "#ff6b6b", fontWeight: 700, flexShrink: 0 }}>- {k}:</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={card}>
          <div style={h2}>제3조 (개인정보의 보유 및 파기)</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <li style={li}>1. 이용자가 설정한 정보(연령대, 선호 음식 등)는 이용자의 웹 브라우저 내 LocalStorage에만 저장됩니다.</li>
            <li style={li}>2. 해당 데이터는 본 서비스의 서버로 전송되거나 저장되지 않으며, 이용자가 브라우저 캐시나 데이터를 삭제할 경우 즉시 파기됩니다.</li>
          </ul>
        </div>

        <div style={card}>
          <div style={h2}>제4조 (쿠키의 설치·운영 및 거부)</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <li style={li}>1. 본 서비스는 이용 정보를 저장하고 수시로 불러오는 쿠키(cookie)를 사용합니다.</li>
            <li style={li}>2. 이용자는 브라우저 설정에서 쿠키 저장을 거부할 수 있습니다. (거부 시 일부 분석 기능이 제한될 수 있습니다.)</li>
            <li style={{ ...li, color: "#999" }}>- Chrome 기준: 설정 {'>'} 개인정보 및 보안 {'>'} 인터넷 사용 기록 삭제 또는 쿠키 설정 관리</li>
          </ul>
        </div>

        <div style={card}>
          <div style={h2}>제5조 (개인정보 제3자 제공)</div>
          <p style={p}>
            본 서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.<br />
            단, 이용자가 서비스 내 장보기 링크 클릭 시 쿠팡파트너스 제휴 시스템을 통해 클릭 및 구매 정보가 쿠팡에 전달될 수 있습니다. (제8조 참고)<br />
            또한 법령에 정해진 절차에 따라 수사기관의 정당한 요구가 있는 경우 예외적으로 제공할 수 있습니다.
          </p>
        </div>

        <div style={card}>
          <div style={h2}>제6조 (이용자의 권리 및 행사 방법)</div>
          <p style={p}>
            이용자는 언제든지 본인의 개인정보와 관련하여 열람, 삭제 등을 요구할 수 있습니다.<br />
            본 서비스는 개인을 식별할 수 있는 정보를 서버에 보유하지 않으므로, 이용자는 본인의 브라우저 내 LocalStorage 데이터를 직접 삭제함으로써 권리를 행사하실 수 있습니다.
          </p>
        </div>

        <div style={card}>
          <div style={h2}>제7조 (개인정보 보호책임자)</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <li style={li}>- 보호책임자: 남상빈</li>
            <li style={li}>- 연락처: skatkdqla173123@gmail.com</li>
            <li style={li}>- 처리 기간: 문의 접수 후 영업일 3일 이내 답변</li>
          </ul>
          <div style={{ marginTop: 12, background: "#fff8f0", borderRadius: 10, padding: "10px 12px", border: "1px solid #ffd0b0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#e55", marginBottom: 4 }}>개인정보 관련 피해 구제·상담</div>
            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.8 }}>
              개인정보침해신고센터: privacy.kisa.or.kr / 118<br />
              개인정보보호위원회: www.pipc.go.kr / 02-2100-2499
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={h2}>제8조 (외부 링크 및 제휴 광고 고지)</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <li style={li}>1. 본 서비스는 쿠팡 등 외부 사이트로의 링크를 포함할 수 있습니다. 이동한 외부 사이트의 개인정보 처리는 해당 사이트의 정책을 따르며 본 서비스와 무관합니다.</li>
            <li style={{ ...li, marginTop: 6 }}>2. 서비스 내 장보기 링크는 쿠팡파트너스 활동의 일환으로 운영되며, 상품 구매 시 이에 따른 일정액의 수수료를 제공받습니다. 이는 이용자의 구매 가격에 영향을 주지 않습니다.</li>
          </ul>
        </div>

        <div style={card}>
          <div style={h2}>제9조 (광고 서비스 – Google AdSense)</div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <li style={li}>1. 본 서비스는 구글 애드센스(Google AdSense)를 통해 맞춤형 광고를 게재합니다.</li>
            <li style={li}>2. Google은 쿠키를 사용하여 이용자의 사이트 방문 기록 등을 기반으로 관심 기반 광고를 제공할 수 있습니다.</li>
            <li style={li}>3. Google이 수집하는 정보는 Google의 개인정보처리방침에 따라 처리됩니다.</li>
            <li style={{ ...li, marginTop: 8 }}>
              - Google 개인정보처리방침:{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#ff6b6b" }}>
                policies.google.com/privacy
              </a>
            </li>
            <li style={li}>
              - 맞춤 광고 거부:{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: "#ff6b6b" }}>
                google.com/settings/ads
              </a>
            </li>
          </ul>
        </div>

        <div style={{ ...card, background: "#fff8f0", border: "1px solid #ffd0b0" }}>
          <div style={{ fontSize: 11, color: "#aaa", textAlign: "center" }}>본 개인정보처리방침은 2026년 5월 14일부터 적용됩니다.</div>
        </div>

        <ContactSection />
      </div>
    </div>
  );
}

export function ContactSection() {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "18px 18px", marginTop: 4, boxShadow: "0 2px 14px rgba(255,107,107,0.08)", border: "1px solid #ffe4e0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>💬</span>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#e55" }}>문의하기</div>
      </div>
      <p style={{ fontSize: 12, color: "#888", lineHeight: 1.8, marginBottom: 14 }}>
        서비스 관련 문의사항이 있으시면 이메일로 연락해 주세요
      </p>
      <a
        href="mailto:skatkdqla173123@gmail.com"
        style={{ display: "block", background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", borderRadius: 14, padding: "12px 0", textAlign: "center", fontSize: 13, fontWeight: 700, textDecoration: "none", marginBottom: 10 }}
      >
        ✉️ skatkdqla173123@gmail.com
      </a>
      <div style={{ textAlign: "center", fontSize: 11, color: "#bbb" }}>영업일 3일 이내 답변</div>
    </div>
  );
}

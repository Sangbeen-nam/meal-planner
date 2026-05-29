import { useParams, useNavigate } from "react-router-dom";
import { getPost } from "./posts";

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = getPost(slug);

  if (!post) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(150deg,#fff8f2 0%,#ffecd8 40%,#f8f0ff 100%)", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
        <div style={{ fontSize: 18, color: "#666", marginBottom: 20 }}>글을 찾을 수 없습니다</div>
        <button onClick={() => navigate("/")} style={{ background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", borderRadius: 20, padding: "10px 24px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(150deg,#fff8f2 0%,#ffecd8 40%,#f8f0ff 100%)", fontFamily: "Georgia, serif" }}>

      {/* 헤더 — AboutPage와 동일 패턴 */}
      <div style={{ background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", padding: "14px 16px 10px", boxShadow: "0 4px 20px rgba(255,107,107,0.28)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "5px 13px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            ← 돌아가기
          </button>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>우리아이 식단표</div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div style={{ padding: "16px 14px 60px" }}>

        {/* 메타 정보 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "inline-block", background: "#FFF4ED", color: "#ff6b6b", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, border: "1px solid #ffd0b0", marginBottom: 12 }}>
            {post.category}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#333", lineHeight: 1.4, margin: "0 0 12px" }}>
            {post.title}
          </h1>
          <div style={{ fontSize: 12, color: "#999", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span>✍️ {post.author}</span>
            <span>·</span>
            <span>📅 {post.date}</span>
            <span>·</span>
            <span>⏱ {post.readTime} 읽기</span>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #ffe4e0", marginBottom: 24 }} />

        {/* 본문 섹션 */}
        {post.sections.map((section, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#333", marginBottom: 12, lineHeight: 1.4 }}>
              {section.heading}
            </h2>
            {section.paragraphs.map((para, j) => (
              <p key={j} style={{ fontSize: 15, color: "#444", lineHeight: 1.8, marginBottom: 14 }}>
                {para}
              </p>
            ))}
          </div>
        ))}

        <hr style={{ border: "none", borderTop: "1px solid #ffe4e0", margin: "28px 0" }} />

        {/* CTA 카드 */}
        <div style={{ background: "linear-gradient(135deg,#fff8f0,#fff0f8)", border: "2px solid #ffd0b0", borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🍱</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#333", marginBottom: 8 }}>
            우리 아이 맞춤 식단표
          </div>
          <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 16 }}>
            {post.cta.text}
          </div>
          <button onClick={() => navigate("/")} style={{ background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", color: "#fff", border: "none", borderRadius: 24, padding: "12px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            무료로 시작하기 →
          </button>
        </div>

        {/* 작성자 */}
        <div style={{ marginTop: 24, padding: "14px 16px", background: "#fff", borderRadius: 12, border: "1px solid #ffe4e0", fontSize: 12, color: "#888", textAlign: "center" }}>
          작성자: 남상빈 (mealplanner365.co.kr 운영자, 두 아이의 아빠)
        </div>

      </div>
    </div>
  );
}

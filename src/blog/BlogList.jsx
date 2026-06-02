import { useNavigate } from "react-router-dom";
import { posts } from "./posts";

export default function BlogList() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(150deg,#fff8f2 0%,#ffecd8 40%,#f8f0ff 100%)", fontFamily: "Georgia, serif" }}>

      {/* 헤더 */}
      <div style={{ background: "linear-gradient(90deg,#ff6b6b,#ff8e53)", padding: "14px 16px 10px", boxShadow: "0 4px 20px rgba(255,107,107,0.28)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate(-1)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.5)", color: "#fff", borderRadius: 20, padding: "5px 13px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            ← 돌아가기
          </button>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>식단 이야기</div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div style={{ padding: "16px 14px 60px" }}>

        {/* 타이틀 */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#333", margin: "0 0 8px" }}>
            🍱 식단 이야기
          </h1>
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
            두 아이를 키우는 워킹대디의 육아·식단 이야기
          </p>
        </div>

        {/* 칼럼 카드 목록 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {posts.map((post) => (
            <div
              key={post.slug}
              onClick={() => navigate(`/blog/${post.slug}`)}
              style={{
                background: "#fff",
                border: "1px solid #ffe4e0",
                borderRadius: 16,
                padding: "16px 18px",
                cursor: "pointer",
                boxShadow: "0 2px 14px rgba(255,107,107,0.08)",
                transition: "box-shadow 0.15s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "inline-block", background: "#FFF4ED", color: "#ff6b6b", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, border: "1px solid #ffd0b0", marginBottom: 8 }}>
                    {post.category}
                  </div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: "#333", margin: "0 0 8px", lineHeight: 1.4 }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: 12, color: "#888", margin: "0 0 10px", lineHeight: 1.5 }}>
                    {post.summary}
                  </p>
                  <div style={{ fontSize: 11, color: "#bbb", display: "flex", gap: 6 }}>
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime} 읽기</span>
                  </div>
                </div>
                <div style={{ fontSize: 20, flexShrink: 0 }}>→</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

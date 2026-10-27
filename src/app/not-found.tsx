import { WorldLink } from "@/components/navigation/WorldLink";

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "6rem 1rem", textAlign: "center", background: "rgb(8 9 8 / 72%)" }}>
      <div>
        <p style={{ font: "700 .65rem/1 var(--font-mono)", color: "var(--signal)", letterSpacing: ".12em" }}>COORDINATE NOT FOUND</p>
        <h1 style={{ margin: "1rem 0", font: "800 clamp(5rem, 18vw, 6rem)/.86 var(--font-display)", letterSpacing: "-.04em" }}>404</h1>
        <p style={{ maxWidth: "28rem", margin: "0 auto 2rem", lineHeight: 1.65, color: "rgb(245 242 233 / 68%)" }}>这个空间坐标尚未建立。返回门户，重新选择一个世界。</p>
        <WorldLink href="/" world="home" style={{ display: "inline-flex", padding: "1rem 1.3rem", color: "#080908", background: "var(--signal)", font: "700 .7rem/1 var(--font-mono)" }}>返回门户</WorldLink>
      </div>
    </main>
  );
}

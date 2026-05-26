export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a0f",
      fontFamily: "'Courier New', monospace",
      color: "#00ff88",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
        <h1 style={{ color: "#00ff88", letterSpacing: "0.2em", fontSize: "1.2rem" }}>
          NXTZEN IP VERIFY
        </h1>
        <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Direct access blocked. Use your bot link.
        </p>
      </div>
    </div>
  );
}

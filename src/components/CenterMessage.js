export default function CenterMessage({ message, visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "none",
      zIndex: 3000
    }}>
      <div style={{
        background: "rgba(0,0,0,0.85)",
        borderRadius: 8,
        padding: "18px 36px",
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        textAlign: "center",
        letterSpacing: "0.02em"
      }}>
        {message}
      </div>
    </div>
  );
} 
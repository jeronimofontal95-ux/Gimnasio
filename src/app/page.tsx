import Link from "next/link";

export default function Home() {
  return (
    <div className="forja-shell" style={{ background: "#0A0A0A" }}>
      <div style={{ borderTop: "90px solid #9CFF3D", borderRight: "76px solid transparent", width: 0 }} />
      <div style={{ padding: "10px 22px 26px 22px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <p style={{ color: "#9CFF3D", fontWeight: 800, fontSize: 14 }}>✕✕ ✕✕ ✕✕</p>
        <h1 style={{ fontSize: 52, lineHeight: 0.95, textTransform: "uppercase", fontWeight: 900 }}>
          Nunca
          <br />
          te rindas
        </h1>
        <p style={{ color: "#9CFF3D", fontSize: 24 }}>¿Estás listo para el cambio?</p>
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          <p>IG: @sergiodvid</p>
          <p>+57 314 4584663</p>
        </div>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <Link className="forja-btn forja-btn-navy" href="/entrenador">
            Soy el entrenador — gestionar clientes
          </Link>
          <Link className="forja-btn forja-btn-navy" href="/cliente">
            Soy cliente — registrar entrenamiento
          </Link>
          <Link className="forja-btn forja-btn-outline" href="/login">
            Cuenta de entrenador (email)
          </Link>
        </div>
      </div>
    </div>
  );
}

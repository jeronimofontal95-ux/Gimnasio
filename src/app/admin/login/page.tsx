"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "@/lib/auth-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const doLogin = async () => {
    setMsg("");
    setBusy(true);
    try {
      const { error } = await signIn.email({ email, password });
      if (error) {
        setMsg(error.message ?? "No se pudo iniciar sesión");
        return;
      }
      const r = await fetch("/api/admin/me");
      const j = await r.json();
      if (r.ok && j.isAdmin) {
        router.push("/admin");
      } else {
        await signOut();
        setMsg("Esta cuenta no es administradora. Solo admins pueden entrar aquí.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="forja-shell" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
      <Link href="/" style={{ color: "#9CFF3D" }}>← Inicio</Link>
      <h1 style={{ fontSize: 20 }}>Acceso administrador</h1>
      <p style={{ fontSize: 13, color: "#9a9a9a" }}>
        Solo cuentas con permiso de administrador. Los entrenadores usan el PIN en /entrenador y los clientes su código en /cliente.
      </p>
      <div className="forja-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <label className="forja-label">Email de administrador</label>
          <input className="forja-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@forja.com" />
        </div>
        <div>
          <label className="forja-label">Contraseña</label>
          <input
            className="forja-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => e.key === "Enter" && doLogin()}
          />
        </div>
        <button className="forja-btn forja-btn-primary" onClick={doLogin} disabled={busy}>
          {busy ? "Verificando…" : "Entrar como admin"}
        </button>
        {msg && <p style={{ fontSize: 13, color: "#FF5C5C" }}>{msg}</p>}
      </div>
    </div>
  );
}

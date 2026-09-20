"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signUp, signOut, useSession } from "@/lib/auth-client";

export default function LoginPage() {
  const { data: session, isPending } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const doSignUp = async () => {
    setMsg("");
    const { error } = await signUp.email({ email, password, name: name || email });
    setMsg(error ? error.message ?? "Error al crear cuenta" : "Cuenta creada. Ya puedes entrar al panel.");
  };

  const doSignIn = async () => {
    setMsg("");
    const { error } = await signIn.email({ email, password });
    setMsg(error ? error.message ?? "No se pudo iniciar sesión" : "Sesión iniciada.");
  };

  return (
    <div className="forja-shell" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
      <Link href="/" style={{ color: "#9CFF3D" }}>← Inicio</Link>
      <h1 style={{ fontSize: 20 }}>Cuenta de entrenador</h1>
      <p style={{ fontSize: 13, color: "#9a9a9a" }}>
        better-auth con email + contraseña, guardado en Neon (tablas user, session, account, verification).
        Los clientes siguen entrando con su código de 4 dígitos.
      </p>

      {isPending ? (
        <p>Cargando sesión…</p>
      ) : session ? (
        <div className="forja-card">
          <p>Sesión activa: <b>{session.user.email}</b></p>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Link className="forja-btn forja-btn-primary" href="/entrenador">Ir al panel</Link>
            <button className="forja-btn forja-btn-navy" onClick={() => signOut()}>Cerrar sesión</button>
          </div>
        </div>
      ) : (
        <div className="forja-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <label className="forja-label">Nombre (solo registro)</label>
            <input className="forja-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sergio" />
          </div>
          <div>
            <label className="forja-label">Email</label>
            <input className="forja-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="coach@forja.com" />
          </div>
          <div>
            <label className="forja-label">Contraseña</label>
            <input className="forja-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="forja-btn forja-btn-primary" onClick={doSignIn}>Entrar</button>
            <button className="forja-btn forja-btn-outline" onClick={doSignUp}>Crear cuenta</button>
          </div>
          {msg && <p style={{ fontSize: 13 }}>{msg}</p>}
        </div>
      )}
      <Link href="/admin/login" style={{ color: "#9a9a9a", fontSize: 12, textAlign: "center" }}>
        ¿Eres administrador? Entrar en /admin/login
      </Link>
    </div>
  );
}

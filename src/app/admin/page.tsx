"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";

type Me = { email: string; isAdmin: boolean };
type Account = { id: string; name: string; email: string; isAdmin: boolean; createdAt: string };

export default function AdminPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [users, setUsers] = useState<Account[]>([]);
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/me");
      if (!r.ok) {
        setState("denied");
        return;
      }
      const j = await r.json();
      if (!j.isAdmin) {
        await signOut();
        setState("denied");
        return;
      }
      setMe(j);
      const u = await fetch("/api/admin/users");
      if (u.ok) setUsers(await u.json());
      setState("ok");
    })();
  }, []);

  if (state === "loading") {
    return (
      <div className="forja-shell" style={{ padding: 18 }}>
        <p>Verificando permisos…</p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="forja-shell" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <h1 style={{ fontSize: 20 }}>Acceso denegado</h1>
        <p style={{ fontSize: 13, color: "#9a9a9a" }}>Esta zona es solo para administradores.</p>
        <Link className="forja-btn forja-btn-primary" href="/admin/login">Ir al login de admin</Link>
      </div>
    );
  }

  return (
    <div className="forja-shell" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 20 }}>Panel admin</h1>
        <button
          style={{ color: "#9a9a9a" }}
          onClick={async () => {
            await signOut();
            window.location.href = "/admin/login";
          }}
        >
          Salir
        </button>
      </div>
      <p style={{ fontSize: 13, color: "#9a9a9a" }}>Conectado como <b style={{ color: "#fff" }}>{me?.email}</b></p>

      <Link className="forja-btn forja-btn-primary" href="/entrenador">
        Gestionar programas de clientes
      </Link>
      <p style={{ fontSize: 12, color: "#9a9a9a" }}>
        Desde el panel del entrenador (PIN) creas clientes y les asignas rutinas, dietas y seguimiento.
      </p>

      <div className="forja-card">
        <span className="forja-label">Cuentas registradas ({users.length})</span>
        {users.map((u) => (
          <div key={u.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #262626", fontSize: 13 }}>
            <span>{u.name} — {u.email}</span>
            {u.isAdmin && <b style={{ color: "#9CFF3D" }}>ADMIN</b>}
          </div>
        ))}
        {!users.length && <p style={{ fontSize: 13, color: "#9a9a9a" }}>Sin cuentas todavía.</p>}
      </div>
    </div>
  );
}

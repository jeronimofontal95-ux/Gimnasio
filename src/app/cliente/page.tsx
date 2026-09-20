"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LogExercise } from "@/db/schema";

type Client = { id: string; name: string; code: string };
type Bundle = {
  client: Client;
  profile: Record<string, string> | null;
  days: { id: string; name: string; warmup: string; exercises: { id: string; name: string; media: string[]; sets: string[] }[] }[];
  diet: Record<string, string> | null;
  weights: { date: string; kg: string }[];
  history: { date: string; dayName: string }[];
};

export default function ClientePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [picked, setPicked] = useState<Client | null>(null);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [tab, setTab] = useState<"rutina" | "dieta" | "datos" | "progreso">("rutina");
  const [dayIdx, setDayIdx] = useState(0);
  const [log, setLog] = useState<LogExercise[] | null>(null);

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients);
  }, []);

  const login = async () => {
    if (!picked) return;
    if (code.trim() !== picked.code) {
      setErr("Código incorrecto.");
      return;
    }
    const r = await fetch(`/api/clients/${picked.id}`);
    const b: Bundle = await r.json();
    setBundle(b);
    setErr("");
  };

  const loadLog = async (clientId: string, dayId: string) => {
    const r = await fetch(`/api/clients/${clientId}/logs/${dayId}`);
    const j = await r.json();
    setLog(j.payload as LogExercise[]);
  };

  useEffect(() => {
    if (bundle && bundle.days.length) {
      setDayIdx(0);
      loadLog(bundle.client.id, bundle.days[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle?.client.id]);

  const saveLog = async (next: LogExercise[]) => {
    if (!bundle || !bundle.days[dayIdx]) return;
    setLog(next);
    await fetch(`/api/clients/${bundle.client.id}/logs/${bundle.days[dayIdx].id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: next }),
    });
  };

  if (!bundle) {
    if (!picked) {
      return (
        <div className="forja-shell" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/" style={{ color: "#9CFF3D" }}>← Volver</Link>
          <h1 style={{ fontSize: 20 }}>Selecciona tu nombre</h1>
          {clients.map((c) => (
            <button key={c.id} onClick={() => setPicked(c)} style={{ textAlign: "left", background: "#101010", border: "1px solid #262626", borderRadius: 6, padding: 12 }}><b>{c.name}</b></button>
          ))}
          {!clients.length && <p style={{ color: "#9a9a9a" }}>Tu entrenador aún no te ha registrado.</p>}
        </div>
      );
    }
    return (
      <div className="forja-shell" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        <button style={{ color: "#9CFF3D", textAlign: "left" }} onClick={() => setPicked(null)}>← Nombres</button>
        <h1 style={{ fontSize: 20 }}>{picked.name}</h1>
        <div className="forja-card">
          <label className="forja-label">Código de acceso (4 dígitos)</label>
          <input className="forja-input" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={4} placeholder="••••" />
          {err && <p style={{ color: "#FF5C5C", fontSize: 13 }}>{err}</p>}
          <button className="forja-btn forja-btn-primary" style={{ marginTop: 12 }} onClick={login}>Entrar</button>
        </div>
      </div>
    );
  }

  const days = bundle.days;
  const day = days[dayIdx];
  const total = (log ?? []).reduce((a, e) => a + e.sets.length, 0);
  const done = (log ?? []).reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="forja-shell" style={{ padding: 18, paddingBottom: 90, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <b>{bundle.client.name}</b>
        <button style={{ color: "#9a9a9a" }} onClick={() => { setBundle(null); setPicked(null); setCode(""); }}>Salir</button>
      </div>

      {tab === "rutina" && (
        <>
          <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {days.map((d, i) => (
              <button key={d.id} onClick={() => { setDayIdx(i); loadLog(bundle.client.id, d.id); }} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 20, border: "1.5px solid #333", background: i === dayIdx ? "#9CFF3D" : "transparent", color: i === dayIdx ? "#0a0a0a" : "#9a9a9a", fontWeight: 600, fontSize: 13 }}>{d.name}</button>
            ))}
          </div>
          {!days.length && <p style={{ color: "#9a9a9a" }}>Tu entrenador todavía no ha creado tu rutina.</p>}
          {day && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 8, background: "#262626", borderRadius: 8 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "#9CFF3D", borderRadius: 8 }} />
                </div>
                <b>{pct}%</b>
              </div>
              {day.warmup && <p style={{ background: "#101010", padding: 10, borderRadius: 6, fontSize: 13 }}>🔸 {day.warmup}</p>}
              {(log ?? []).map((ex, ei) => (
                <div key={ei} style={{ background: "#101010", border: "1px solid #262626", borderRadius: 6, padding: 12 }}>
                  <b>{ei + 1}. {ex.name}</b>
                  {ex.sets.map((s, si) => (
                    <div key={si} style={{ display: "grid", gridTemplateColumns: "26px 1fr 64px 64px 30px", gap: 6, alignItems: "center", padding: "6px 0", fontSize: 13 }}>
                      <span style={{ color: "#9a9a9a" }}>{si + 1}</span>
                      <span style={{ color: "#9a9a9a", fontSize: 12 }}>{s.target}</span>
                      <input className="forja-input" style={{ padding: "6px", textAlign: "center" }} type="number" value={s.weight} placeholder="Kg" onChange={(e) => { const n = structuredClone(log ?? []); n[ei].sets[si].weight = e.target.value; saveLog(n); }} />
                      <input className="forja-input" style={{ padding: "6px", textAlign: "center" }} type="number" value={s.reps} placeholder="Reps" onChange={(e) => { const n = structuredClone(log ?? []); n[ei].sets[si].reps = e.target.value; saveLog(n); }} />
                      <button onClick={() => { const n = structuredClone(log ?? []); n[ei].sets[si].done = !n[ei].sets[si].done; saveLog(n); if (n.every((x) => x.sets.every((y) => y.done))) { fetch(`/api/clients/${bundle.client.id}/progress`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "history", dayName: day.name }) }); } }} style={{ width: 26, height: 26, borderRadius: "50%", background: s.done ? "#9CFF3D" : "transparent", border: "1.5px solid #333" }}>✓</button>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </>
      )}

      {tab === "dieta" && (
        <div className="forja-card">
          {[["desayuno", "Desayuno"], ["almuerzo", "Almuerzo"], ["cena", "Cena"], ["snacks", "Snacks / suplementos"], ["notas", "Notas"]].map(([k, label]) => (
            bundle.diet?.[k] ? <div key={k} style={{ marginBottom: 10 }}><b style={{ color: "#9CFF3D", fontSize: 13 }}>{label}</b><p style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{bundle.diet[k]}</p></div> : null
          ))}
          {!bundle.diet?.desayuno && !bundle.diet?.almuerzo && !bundle.diet?.cena && <p style={{ color: "#9a9a9a" }}>Sin plan asignado.</p>}
        </div>
      )}

      {tab === "datos" && (
        <div className="forja-card">
          <b>Mis medidas</b>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
            {Object.entries(bundle.profile ?? {}).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ background: "#0d0d0d", padding: 8, borderRadius: 6, textAlign: "center" }}>
                <div style={{ fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 10, color: "#9a9a9a" }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "progreso" && (
        <div className="forja-card">
          <b>Rutinas completadas ({bundle.history.length})</b>
          {bundle.history.slice(0, 20).map((h, i) => <p key={i} style={{ fontSize: 13 }}>{h.dayName} — {h.date}</p>)}
          {!bundle.history.length && <p style={{ color: "#9a9a9a" }}>Aún no has completado ninguna. ¡Vamos!</p>}
        </div>
      )}

      <div style={{ position: "sticky", bottom: 0, background: "#171717", borderTop: "1px solid #262626", display: "flex", padding: 8 }}>
        {(["rutina", "dieta", "datos", "progreso"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: 8, color: tab === t ? "#9CFF3D" : "#9a9a9a", fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

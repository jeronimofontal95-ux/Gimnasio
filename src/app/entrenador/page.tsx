"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { plantillaRutina } from "@/lib/forja";

type Client = { id: string; name: string; code: string };
type Bundle = {
  client: Client;
  profile: Record<string, string> | null;
  days: { id: string; name: string; warmup: string; exercises: { id: string; name: string; media: string[]; sets: string[] }[] }[];
  diet: Record<string, string> | null;
  weights: { date: string; kg: string }[];
  history: { date: string; dayName: string }[];
};

export default function EntrenadorPage() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [newName, setNewName] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [tab, setTab] = useState<"datos" | "rutina" | "dieta" | "progreso">("datos");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [dietDraft, setDietDraft] = useState<Record<string, string>>({});
  const [daysDraft, setDaysDraft] = useState<Bundle["days"]>([]);
  const [newPin, setNewPin] = useState("");
  const [msg, setMsg] = useState("");

  const loadClients = async () => {
    const r = await fetch("/api/clients");
    setClients(await r.json());
  };

  useEffect(() => {
    if (authed) loadClients();
  }, [authed ]);

  const checkPin = async () => {
    const r = await fetch("/api/trainer/pin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinToCheck: pin }),
    });
    const j = await r.json();
    if (j.ok) {
      setAuthed(true);
      setErr("");
    } else setErr("PIN incorrecto.");
  };

  const openClient = async (id: string) => {
    const r = await fetch(`/api/clients/${id}`);
    const b: Bundle = await r.json();
    setOpenId(id);
    setBundle(b);
    setTab("datos");
    setDraft({ ...(b.profile ?? {}) });
    setDietDraft({ ...(b.diet ?? {}) });
    setDaysDraft(structuredClone(b.days));
  };

  const createClient = async () => {
    if (!newName.trim()) return;
    const r = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (r.ok) {
      setNewName("");
      await loadClients();
    }
  };

  const saveProfile = async () => {
    if (!openId) return;
    await fetch(`/api/clients/${openId}/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setMsg("Datos guardados");
    setTimeout(() => setMsg(""), 2000);
  };

  const saveDiet = async () => {
    if (!openId) return;
    await fetch(`/api/clients/${openId}/diet`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dietDraft),
    });
    setMsg("Dieta guardada");
    setTimeout(() => setMsg(""), 2000);
  };

  const saveRoutine = async (days = daysDraft) => {
    if (!openId) return;
    await fetch(`/api/clients/${openId}/routine`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    });
    setMsg("Rutina guardada");
    setTimeout(() => setMsg(""), 2000);
  };

  const loadTemplate = async () => {
    if (!confirm("Reemplaza la rutina actual con la plantilla de ejemplo (5 días). ¿Continuar?")) return;
    const t = plantillaRutina();
    const mapped = t.days.map((d) => ({
      id: "",
      name: d.name,
      warmup: d.warmup,
      exercises: d.exercises.map((e) => ({ id: "", name: e.name, media: e.gif ? [e.gif] : [], sets: e.sets })),
    }));
    setDaysDraft(mapped as Bundle["days"]);
    await saveRoutine(mapped as Bundle["days"]);
  };

  if (!authed) {
    return (
      <div className="forja-shell" style={{ padding: 18 }}>
        <Link href="/" style={{ color: "#9CFF3D" }}>← Volver</Link>
        <h1 style={{ fontSize: 22, margin: "12px 0" }}>Acceso entrenador</h1>
        <div className="forja-card">
          <label className="forja-label">PIN del entrenador</label>
          <input className="forja-input" value={pin} onChange={(e) => setPin(e.target.value)} inputMode="numeric" maxLength={6} placeholder="••••" />
          {err && <p style={{ color: "#FF5C5C", fontSize: 13 }}>{err}</p>}
          <button className="forja-btn forja-btn-primary" style={{ marginTop: 12 }} onClick={checkPin}>Entrar</button>
        </div>
        <p style={{ color: "#9a9a9a", fontSize: 12 }}>PIN por defecto: 1234. Guárdalo en Neon vía Ajustes → PIN.</p>
      </div>
    );
  }

  if (openId && bundle) {
    return (
      <div className="forja-shell" style={{ padding: 18, gap: 12, display: "flex", flexDirection: "column" }}>
        <button style={{ color: "#9CFF3D", textAlign: "left" }} onClick={() => { setOpenId(null); setBundle(null); loadClients(); }}>← Clientes</button>
        <h1 style={{ fontSize: 20 }}>{bundle.client.name} <span style={{ fontSize: 12, color: "#9a9a9a" }}>código {bundle.client.code}</span></h1>
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #262626" }}>
          {(["datos", "rutina", "dieta", "progreso"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px", color: tab === t ? "#fff" : "#9a9a9a", borderBottom: tab === t ? "3px solid #9CFF3D" : "none", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>

        {tab === "datos" && (
          <div className="forja-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["edad", "Edad"], ["sexo", "Sexo (F/M)"], ["peso", "Peso (kg)"], ["altura", "Altura (cm)"], ["cuello", "Cuello"], ["pecho", "Pecho"], ["cintura", "Cintura / torso"], ["cadera", "Cadera"], ["bicepsD", "Bíceps derecho"], ["bicepsI", "Bíceps izquierdo"], ["antebrazoD", "Antebrazo derecho"], ["antebrazoI", "Antebrazo izquierdo"], ["cuadricepsD", "Cuádriceps derecho"], ["cuadricepsI", "Cuádriceps izquierdo"], ["gemeloD", "Gemelo derecho"], ["gemeloI", "Gemelo izquierdo"], ["telefono", "Teléfono"], ["fechaInicio", "Fecha de inicio"], ["notas", "Notas / lesiones"]].map(([k, label]) => (
              <div key={k}>
                <label className="forja-label">{label}</label>
                <input className="forja-input" value={draft[k] ?? ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
              </div>
            ))}
            <button className="forja-btn forja-btn-primary" onClick={saveProfile}>Guardar datos</button>
          </div>
        )}

        {tab === "rutina" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#9a9a9a" }}>{daysDraft.length} día(s)</span>
              <button style={{ color: "#9CFF3D" }} onClick={loadTemplate}>Cargar plantilla</button>
            </div>
            {daysDraft.map((d, i) => (
              <div key={i} className="forja-card">
                <input className="forja-input" value={d.name} onChange={(e) => { const c = [...daysDraft]; c[i] = { ...c[i], name: e.target.value }; setDaysDraft(c); }} />
                <input className="forja-input" style={{ marginTop: 8 }} value={d.warmup ?? ""} placeholder="Calentamiento…" onChange={(e) => { const c = [...daysDraft]; c[i] = { ...c[i], warmup: e.target.value }; setDaysDraft(c); }} />
                {(d.exercises ?? []).map((ex, j) => (
                  <div key={j} style={{ borderTop: "1px solid #262626", marginTop: 8, paddingTop: 8 }}>
                    <input className="forja-input" value={ex.name} placeholder="Ejercicio" onChange={(e) => { const c = structuredClone(daysDraft); c[i].exercises[j].name = e.target.value; setDaysDraft(c); }} />
                    <input className="forja-input" style={{ marginTop: 6 }} value={(ex.media ?? []).join(" ")} placeholder="GIF URL (máx 3, separados por espacio)" onChange={(e) => { const c = structuredClone(daysDraft); c[i].exercises[j].media = e.target.value.split(/\s+/).filter(Boolean).slice(0, 3); setDaysDraft(c); }} />
                    <textarea className="forja-input" style={{ marginTop: 6 }} rows={3} value={(ex.sets ?? []).join("\n")} placeholder="Una serie por línea" onChange={(e) => { const c = structuredClone(daysDraft); c[i].exercises[j].sets = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean); setDaysDraft(c); }} />
                    <button style={{ color: "#FF5C5C", fontSize: 13 }} onClick={() => { const c = structuredClone(daysDraft); c[i].exercises.splice(j, 1); setDaysDraft(c); }}>Eliminar ejercicio</button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button style={{ color: "#9CFF3D", fontSize: 13 }} onClick={() => { const c = structuredClone(daysDraft); c[i].exercises.push({ id: "", name: "", media: [], sets: [] }); setDaysDraft(c); }}>+ Ejercicio</button>
                  <button style={{ color: "#FF5C5C", fontSize: 13 }} onClick={() => setDaysDraft(daysDraft.filter((_, x) => x !== i))}>Eliminar día</button>
                </div>
              </div>
            ))}
            <button className="forja-btn forja-btn-outline" onClick={() => setDaysDraft([...daysDraft, { id: "", name: "Nuevo día", warmup: "", exercises: [] }])}>+ Agregar día</button>
            <button className="forja-btn forja-btn-primary" onClick={() => saveRoutine()}>Guardar rutina</button>
          </div>
        )}

        {tab === "dieta" && (
          <div className="forja-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["desayuno", "Desayuno"], ["almuerzo", "Almuerzo"], ["cena", "Cena"], ["snacks", "Snacks / suplementos"], ["notas", "Notas"]].map(([k, label]) => (
              <div key={k}>
                <label className="forja-label">{label}</label>
                <textarea className="forja-input" rows={2} value={dietDraft[k] ?? ""} onChange={(e) => setDietDraft({ ...dietDraft, [k]: e.target.value })} />
              </div>
            ))}
            <button className="forja-btn forja-btn-primary" onClick={saveDiet}>Guardar dieta</button>
          </div>
        )}

        {tab === "progreso" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="forja-card">
              <span className="forja-label">Pesos ({bundle.weights.length})</span>
              {bundle.weights.slice(0, 8).map((w, i) => <p key={i} style={{ fontSize: 13 }}>{w.date} — <b>{w.kg} kg</b></p>)}
            </div>
            <div className="forja-card">
              <span className="forja-label">Rutinas completadas ({bundle.history.length})</span>
              {bundle.history.slice(0, 15).map((h, i) => <p key={i} style={{ fontSize: 13 }}>{h.dayName} — {h.date}</p>)}
            </div>
            <div className="forja-card">
              <label className="forja-label">Cambiar PIN entrenador</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="forja-input" value={newPin} onChange={(e) => setNewPin(e.target.value)} maxLength={6} inputMode="numeric" />
                <button className="forja-btn forja-btn-outline" style={{ width: "auto" }} onClick={async () => { await fetch("/api/trainer/pin", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin: newPin }) }); setNewPin(""); setMsg("PIN actualizado"); setTimeout(() => setMsg(""), 2000); }}>Guardar</button>
              </div>
            </div>
            <button style={{ color: "#FF5C5C" }} onClick={async () => { if (confirm("¿Eliminar cliente?")) { await fetch(`/api/clients/${openId}`, { method: "DELETE" }); setOpenId(null); setBundle(null); loadClients(); } }}>Eliminar cliente</button>
          </div>
        )}
        {msg && <p style={{ color: "#9CFF3D", fontSize: 13 }}>{msg}</p>}
      </div>
    );
  }

  return (
    <div className="forja-shell" style={{ padding: 18, gap: 12, display: "flex", flexDirection: "column" }}>
      <Link href="/" style={{ color: "#9CFF3D" }}>← Inicio</Link>
      <h1 style={{ fontSize: 20 }}>Panel del entrenador ({clients.length})</h1>
      <div className="forja-card" style={{ display: "flex", gap: 8 }}>
        <input className="forja-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del cliente" />
        <button className="forja-btn forja-btn-primary" style={{ width: "auto" }} onClick={createClient}>+ Crear</button>
      </div>
      {clients.map((c) => (
        <button key={c.id} onClick={() => openClient(c.id)} style={{ textAlign: "left", background: "#101010", border: "1px solid #262626", borderRadius: 6, padding: 12 }}>
          <b>{c.name}</b> <span style={{ fontSize: 12, color: "#9a9a9a" }}>código {c.code}</span>
        </button>
      ))}
    </div>
  );
}

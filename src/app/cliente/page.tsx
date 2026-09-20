"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";
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

const DIET_LABELS: [string, string][] = [
  ["desayuno", "Desayuno"],
  ["almuerzo", "Almuerzo"],
  ["cena", "Cena"],
  ["snacks", "Snacks / suplementos"],
  ["notas", "Notas"],
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        <div className="forja-shell gap-3 p-5">
          <Button render={<Link href="/" />} variant="ghost" className="w-fit px-0" style={{ color: "#9CFF3D" }}>
            <ChevronLeft size={18} />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Selecciona tu nombre</h1>
          <div className="flex flex-col gap-2">
            {clients.map((c) => (
              <Card key={c.id} className="cursor-pointer transition-colors hover:border-primary/60" onClick={() => setPicked(c)}>
                <CardContent className="flex items-center gap-3 py-3">
                  <Avatar>
                    <AvatarFallback>{initials(c.name)}</AvatarFallback>
                  </Avatar>
                  <b>{c.name}</b>
                </CardContent>
              </Card>
            ))}
          </div>
          {!clients.length && <p className="text-sm text-muted-foreground">Tu entrenador aún no te ha registrado.</p>}
        </div>
      );
    }
    return (
      <div className="forja-shell gap-4 p-5">
        <Button variant="ghost" className="w-fit px-0" style={{ color: "#9CFF3D" }} onClick={() => setPicked(null)}>
          <ChevronLeft size={18} />
          Nombres
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback>{initials(picked.name)}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold">{picked.name}</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="grid gap-2">
              <Label htmlFor="code">Código de acceso</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button onClick={login}>Entrar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const days = bundle.days;
  const day = days[dayIdx];
  const total = (log ?? []).reduce((a, e) => a + e.sets.length, 0);
  const done = (log ?? []).reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="forja-shell gap-3 p-5 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            {bundle.profile?.photo ? <AvatarImage src={bundle.profile.photo} alt={bundle.client.name} /> : null}
            <AvatarFallback>{initials(bundle.client.name)}</AvatarFallback>
          </Avatar>
          <b>{bundle.client.name}</b>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setBundle(null); setPicked(null); setCode(""); }}>
          Salir
        </Button>
      </div>

      {tab === "rutina" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((d, i) => (
              <Button
                key={d.id}
                size="sm"
                variant={i === dayIdx ? "default" : "outline"}
                className="shrink-0 rounded-full"
                onClick={() => { setDayIdx(i); loadLog(bundle.client.id, d.id); }}
              >
                {d.name}
              </Button>
            ))}
          </div>
          {!days.length && <p className="text-sm text-muted-foreground">Tu entrenador todavía no ha creado tu rutina.</p>}
          {day && (
            <>
              <div className="flex items-center gap-3">
                <Progress value={pct} className="flex-1" />
                <b className="text-sm">{pct}%</b>
              </div>
              {day.warmup && (
                <Card>
                  <CardContent className="py-3 text-sm">🔸 {day.warmup}</CardContent>
                </Card>
              )}
              {(log ?? []).map((ex, ei) => (
                <Card key={ei}>
                  <CardContent className="flex flex-col gap-1 pt-4">
                    <b className="text-sm">{ei + 1}. {ex.name}</b>
                    {ex.sets.map((s, si) => (
                      <div key={si} className="grid grid-cols-[26px_1fr_64px_64px_30px] items-center gap-1.5 py-1 text-sm">
                        <span className="text-muted-foreground">{si + 1}</span>
                        <span className="text-xs text-muted-foreground">{s.target}</span>
                        <Input className="h-8 px-1 text-center" type="number" value={s.weight} placeholder="Kg" onChange={(e) => { const n = structuredClone(log ?? []); n[ei].sets[si].weight = e.target.value; saveLog(n); }} />
                        <Input className="h-8 px-1 text-center" type="number" value={s.reps} placeholder="Reps" onChange={(e) => { const n = structuredClone(log ?? []); n[ei].sets[si].reps = e.target.value; saveLog(n); }} />
                        <button onClick={() => { const n = structuredClone(log ?? []); n[ei].sets[si].done = !n[ei].sets[si].done; saveLog(n); if (n.every((x) => x.sets.every((y) => y.done))) { fetch(`/api/clients/${bundle.client.id}/progress`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "history", dayName: day.name }) }); } }} className="h-[26px] w-[26px] rounded-full border-[1.5px] border-border" style={s.done ? { background: "#9CFF3D", borderColor: "#9CFF3D", color: "#0a0a0a" } : undefined}>✓</button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </>
      )}

      {tab === "dieta" && (
        <Card>
          <CardContent className="flex flex-col gap-3 pt-6">
            {DIET_LABELS.map(([k, label]) => (
              bundle.diet?.[k] ? <div key={k}><Badge variant="secondary" className="mb-1">{label}</Badge><p className="whitespace-pre-wrap text-sm">{bundle.diet[k]}</p></div> : null
            ))}
            {!bundle.diet?.desayuno && !bundle.diet?.almuerzo && !bundle.diet?.cena && <p className="text-sm text-muted-foreground">Sin plan asignado.</p>}
          </CardContent>
        </Card>
      )}

      {tab === "datos" && (
        <Card>
          <CardContent className="pt-6">
            <b className="text-sm">Mis medidas</b>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {Object.entries(bundle.profile ?? {}).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="rounded-md bg-muted p-2 text-center">
                  <div className="font-extrabold">{v}</div>
                  <div className="text-[10px] text-muted-foreground">{k}</div>
                </div>
              ))}
            </div>
            {!Object.entries(bundle.profile ?? {}).some(([, v]) => v) && <p className="mt-2 text-sm text-muted-foreground">Sin medidas registradas.</p>}
          </CardContent>
        </Card>
      )}

      {tab === "progreso" && (
        <Card>
          <CardContent className="pt-6">
            <b className="text-sm">Rutinas completadas ({bundle.history.length})</b>
            {bundle.history.slice(0, 20).map((h, i) => <p key={i} className="text-sm">{h.dayName} — {h.date}</p>)}
            {!bundle.history.length && <p className="mt-1 text-sm text-muted-foreground">Aún no has completado ninguna. ¡Vamos!</p>}
          </CardContent>
        </Card>
      )}

      <div className="fixed bottom-0 left-1/2 flex w-full max-w-[520px] -translate-x-1/2 border-t border-border bg-background/95 p-2 backdrop-blur">
        {(["rutina", "dieta", "datos", "progreso"] as const).map((t) => (
          <Button key={t} variant={tab === t ? "secondary" : "ghost"} className="flex-1 capitalize" onClick={() => setTab(t)}>
            {t}
          </Button>
        ))}
      </div>
    </div>
  );
}

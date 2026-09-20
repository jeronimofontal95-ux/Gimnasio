"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { plantillaRutina } from "@/lib/forja";
import { useSession } from "@/lib/auth-client";

type Client = { id: string; name: string; code: string };
type Bundle = {
  client: Client;
  profile: Record<string, string> | null;
  days: { id: string; name: string; warmup: string; weekday: number | null; exercises: { id: string; name: string; media: string[]; sets: string[] }[] }[];
  diet: Record<string, string> | null;
  weights: { date: string; kg: string }[];
  history: { date: string; dayName: string }[];
};

const PROFILE_FIELDS: [string, string][] = [
  ["edad", "Edad"],
  ["sexo", "Sexo (F/M)"],
  ["peso", "Peso (kg)"],
  ["altura", "Altura (cm)"],
  ["cuello", "Cuello"],
  ["pecho", "Pecho"],
  ["cintura", "Cintura / torso"],
  ["cadera", "Cadera"],
  ["bicepsD", "Bíceps derecho"],
  ["bicepsI", "Bíceps izquierdo"],
  ["antebrazoD", "Antebrazo derecho"],
  ["antebrazoI", "Antebrazo izquierdo"],
  ["cuadricepsD", "Cuádriceps derecho"],
  ["cuadricepsI", "Cuádriceps izquierdo"],
  ["gemeloD", "Gemelo derecho"],
  ["gemeloI", "Gemelo izquierdo"],
  ["telefono", "Teléfono"],
  ["fechaInicio", "Fecha de inicio"],
  ["notas", "Notas / lesiones"],
];

const DIET_FIELDS: [string, string][] = [
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

const WEEKDAY_SHORT = ["L", "M", "M", "J", "V", "S", "D"];
const WEEKDAY_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

type DayDraft = Bundle["days"][number];

const normalizeWeekDays = (days: Bundle["days"]): DayDraft[] =>
  WEEKDAY_FULL.map((label, wd) => {
    const found = days.find((d) => d.weekday === wd);
    if (found) return { ...found, weekday: wd, exercises: found.exercises ?? [] };
    return { id: "", name: label, warmup: "", weekday: wd, exercises: [] };
  });

export default function EntrenadorPage() {
  const { data: session, isPending } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [newName, setNewName] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [tab, setTab] = useState<"datos" | "rutina" | "dieta" | "progreso">("datos");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [dietDraft, setDietDraft] = useState<Record<string, string>>({});
  const [daysDraft, setDaysDraft] = useState<Bundle["days"]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [msg, setMsg] = useState("");
  const [savingRoutine, setSavingRoutine] = useState(false);

  const loadClients = async () => {
    try {
      const r = await fetch("/api/clients");
      const j = await r.json();
      setClients(Array.isArray(j) ? j : []);
    } catch {
      setClients([]);
    }
  };

  useEffect(() => {
    if (session) loadClients();
  }, [session ]);

  const openClient = async (id: string) => {
    const r = await fetch(`/api/clients/${id}`);
    const b: Bundle = await r.json();
    setOpenId(id);
    setBundle(b);
    setTab("datos");
    setDraft({ ...(b.profile ?? {}) });
    setDietDraft({ ...(b.diet ?? {}) });
    setDaysDraft(normalizeWeekDays(b.days));
    const firstWithEx = normalizeWeekDays(b.days).findIndex((d) => (d.exercises ?? []).length > 0);
    setActiveDay(firstWithEx >= 0 ? firstWithEx : 0);
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
    if (!openId || savingRoutine) return;
    setSavingRoutine(true);
    try {
      const cleanDays = days.map((d) => ({
        ...d,
        exercises: (d.exercises ?? [])
          .map((ex) => ({
            ...ex,
            media: (ex.media ?? []).filter((u) => u.trim()).slice(0, 3),
            sets: (ex.sets ?? []).map((s) => s.trim()).filter(Boolean),
          }))
          .filter((ex) => ex.name.trim() && ex.sets.length > 0),
      }));
      const nonEmpty = cleanDays.filter((d) => d.exercises.length > 0);
      await fetch(`/api/clients/${openId}/routine`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: nonEmpty }),
      });
      setDaysDraft(normalizeWeekDays(cleanDays));
      setMsg(nonEmpty.length ? "Rutina guardada" : "Rutina guardada (semana en descanso)");
      setTimeout(() => setMsg(""), 2000);
    } finally {
      setSavingRoutine(false);
    }
  };

  const loadTemplate = async () => {
    if (!confirm("Reemplaza la rutina actual con la plantilla de ejemplo (lun–vie). ¿Continuar?")) return;
    const t = plantillaRutina();
    const mapped = WEEKDAY_FULL.map((label, wd) => {
      const tpl = wd < 5 ? t.days[wd] : null;
      if (!tpl) return { id: "", name: label, warmup: "", weekday: wd, exercises: [] };
      return {
        id: "",
        name: tpl.name,
        warmup: tpl.warmup,
        weekday: wd,
        exercises: tpl.exercises.map((e) => ({ id: "", name: e.name, media: e.gif ? [e.gif] : [], sets: e.sets })),
      };
    });
    setDaysDraft(mapped as Bundle["days"]);
    setActiveDay(0);
    await saveRoutine(mapped as Bundle["days"]);
  };

  const updateActiveDay = (patch: Partial<DayDraft>) => {
    setDaysDraft((prev) => prev.map((d, idx) => (idx === activeDay ? { ...d, ...patch } : d)));
  };

  if (isPending) {
    return (
      <div className="forja-shell gap-4 p-5">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="forja-shell gap-4 p-5">
        <Button render={<Link href="/" />} variant="ghost" className="w-fit px-0" style={{ color: "#9CFF3D" }}>
          <ChevronLeft size={18} />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Acceso entrenador</h1>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <p className="text-sm text-muted-foreground">
              Inicia sesión con tu cuenta de entrenador para gestionar a tus clientes.
            </p>
            <Button render={<Link href="/login" />}>Ir a iniciar sesión</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (openId && bundle) {
    return (
      <div className="forja-shell gap-4 p-5">
        <Button variant="ghost" className="w-fit px-0" style={{ color: "#9CFF3D" }} onClick={() => { setOpenId(null); setBundle(null); loadClients(); }}>
          <ChevronLeft size={18} />
          Clientes
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            {bundle.profile?.photo ? <AvatarImage src={bundle.profile.photo} alt={bundle.client.name} /> : null}
            <AvatarFallback>{initials(bundle.client.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold leading-tight">{bundle.client.name}</h1>
            <Badge variant="secondary" className="mt-1">
              código {bundle.client.code}
            </Badge>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="datos">Datos</TabsTrigger>
            <TabsTrigger value="rutina">Rutina</TabsTrigger>
            <TabsTrigger value="dieta">Dieta</TabsTrigger>
            <TabsTrigger value="progreso">Progreso</TabsTrigger>
          </TabsList>

          <TabsContent value="datos">
            <Card>
              <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="pf-photo">Foto del cliente (URL)</Label>
                  <Input
                    id="pf-photo"
                    value={draft.photo ?? ""}
                    onChange={(e) => setDraft({ ...draft, photo: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
                {PROFILE_FIELDS.map(([k, label]) => (
                  <div key={k} className="grid gap-2">
                    <Label htmlFor={`pf-${k}`}>{label}</Label>
                    <Input id={`pf-${k}`} value={draft[k] ?? ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
                  </div>
                ))}
                <Button onClick={saveProfile} className="sm:col-span-2">Guardar datos</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rutina" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {daysDraft.filter((d) => (d.exercises ?? []).length > 0).length} día(s) con rutina
              </span>
              <Button variant="link" className="h-auto p-0" style={{ color: "#9CFF3D" }} onClick={loadTemplate}>
                Cargar plantilla
              </Button>
            </div>
            <div className="flex gap-1">
              {WEEKDAY_SHORT.map((w, wd) => {
                const count = (daysDraft[wd]?.exercises ?? []).length;
                return (
                  <Button
                    key={wd}
                    size="sm"
                    variant={activeDay === wd ? "default" : "outline"}
                    className="h-9 flex-1 flex-col gap-0 px-0 leading-none"
                    onClick={() => setActiveDay(wd)}
                  >
                    {w}
                    <span className="text-[10px] opacity-70">{count > 0 ? `·${count}` : "·–"}</span>
                  </Button>
                );
              })}
            </div>
            {daysDraft[activeDay] && (
              <Card key={activeDay}>
                <CardContent className="flex flex-col gap-2 pt-4">
                  <p className="text-sm font-bold">{WEEKDAY_FULL[activeDay]}</p>
                  <Input
                    value={daysDraft[activeDay].name}
                    placeholder={`Rutina del ${WEEKDAY_FULL[activeDay].toLowerCase()}…`}
                    onChange={(e) => updateActiveDay({ name: e.target.value })}
                  />
                  <Input
                    value={daysDraft[activeDay].warmup ?? ""}
                    placeholder="Calentamiento…"
                    onChange={(e) => updateActiveDay({ warmup: e.target.value })}
                  />
                  {(daysDraft[activeDay].exercises ?? []).map((ex, j) => (
                    <div key={j} className="flex flex-col gap-2">
                      <Separator className="my-1" />
                      <Input value={ex.name} placeholder="Ejercicio" onChange={(e) => { const c = structuredClone(daysDraft); c[activeDay].exercises[j].name = e.target.value; setDaysDraft(c); }} />
                      <Input value={(ex.media ?? []).join(" ")} placeholder="GIF URL (máx 3, separados por espacio)" onChange={(e) => { const c = structuredClone(daysDraft); c[activeDay].exercises[j].media = e.target.value.split(" ").slice(0, 3); setDaysDraft(c); }} />
                      <Textarea rows={3} value={(ex.sets ?? []).join("\n")} placeholder="Una serie por línea. Ej: Efectiva 10-12 reps" onChange={(e) => { const c = structuredClone(daysDraft); c[activeDay].exercises[j].sets = e.target.value.split("\n"); setDaysDraft(c); }} />
                      <Button variant="ghost" size="sm" className="w-fit text-destructive" onClick={() => { const c = structuredClone(daysDraft); c[activeDay].exercises.splice(j, 1); setDaysDraft(c); }}>
                        <Trash2 size={14} />
                        Eliminar ejercicio
                      </Button>
                    </div>
                  ))}
                  {!daysDraft[activeDay].exercises?.length && (
                    <p className="text-sm text-muted-foreground">Día de descanso. Agrega ejercicios para activar este día.</p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { const c = structuredClone(daysDraft); c[activeDay].exercises.push({ id: "", name: "", media: [], sets: [] }); setDaysDraft(c); }}>
                      <Plus size={14} />
                      Ejercicio
                    </Button>
                    {!!daysDraft[activeDay].exercises?.length && (
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => updateActiveDay({ exercises: [] })}>
                        Vaciar día
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            <Button onClick={() => saveRoutine()} disabled={savingRoutine}>
              {savingRoutine ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando…
                </>
              ) : (
                "Guardar rutina"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="dieta">
            <Card>
              <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                {DIET_FIELDS.map(([k, label]) => (
                  <div key={k} className="grid gap-2">
                    <Label htmlFor={`diet-${k}`}>{label}</Label>
                    <Textarea id={`diet-${k}`} rows={2} value={dietDraft[k] ?? ""} onChange={(e) => setDietDraft({ ...dietDraft, [k]: e.target.value })} />
                  </div>
                ))}
                <Button onClick={saveDiet} className="sm:col-span-2">Guardar dieta</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progreso" className="flex flex-col gap-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pesos ({bundle.weights.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {bundle.weights.slice(0, 8).map((w, i) => <p key={i} className="text-sm">{w.date} — <b>{w.kg} kg</b></p>)}
                {!bundle.weights.length && <p className="text-sm text-muted-foreground">Sin registros.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rutinas completadas ({bundle.history.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {bundle.history.slice(0, 15).map((h, i) => <p key={i} className="text-sm">{h.dayName} — {h.date}</p>)}
                {!bundle.history.length && <p className="text-sm text-muted-foreground">Sin registros.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ajustes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button variant="destructive" onClick={async () => { if (confirm("¿Eliminar cliente?")) { await fetch(`/api/clients/${openId}`, { method: "DELETE" }); setOpenId(null); setBundle(null); loadClients(); } }}>
                  <Trash2 size={16} />
                  Eliminar cliente
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {msg && <p className="text-sm" style={{ color: "#9CFF3D" }}>{msg}</p>}
      </div>
    );
  }

  return (
    <div className="forja-shell gap-4 p-5">
      <Button render={<Link href="/" />} variant="ghost" className="w-fit px-0" style={{ color: "#9CFF3D" }}>
        <ChevronLeft size={18} />
        Inicio
      </Button>
      <h1 className="text-2xl font-bold">Clientes ({clients.length})</h1>
      <Card>
        <CardContent className="flex gap-2 pt-6">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del cliente" onKeyDown={(e) => e.key === "Enter" && createClient()} />
          <Button onClick={createClient} className="shrink-0">
            <Plus size={16} />
            Crear
          </Button>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-2">
        {clients.map((c) => (
          <Card key={c.id} className="cursor-pointer transition-colors hover:border-primary/60" onClick={() => openClient(c.id)}>
            <CardContent className="flex items-center gap-3 py-3">
              <Avatar>
                <AvatarFallback>{initials(c.name)}</AvatarFallback>
              </Avatar>
              <b className="flex-1">{c.name}</b>
              <Badge variant="secondary">código {c.code}</Badge>
            </CardContent>
          </Card>
        ))}
        {!clients.length && <p className="text-sm text-muted-foreground">Aún no hay clientes. Crea el primero arriba.</p>}
      </div>
    </div>
  );
}

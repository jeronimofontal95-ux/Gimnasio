"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LogExercise } from "@/db/schema";

type Client = { id: string; name: string; code: string };
type Bundle = {
  client: Client;
  profile: Record<string, string> | null;
  days: { id: string; name: string; warmup: string; weekday: number | null; exercises: { id: string; name: string; media: string[]; sets: string[] }[] }[];
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

const PROFILE_LABELS: [string, string][] = [
  ["edad", "Edad"],
  ["sexo", "Sexo"],
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

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const WEEKDAY_FULL = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDaysISO = (iso: string, n: number) => {
  const d = parseISO(iso);
  d.setDate(d.getDate() + n);
  return isoLocal(d);
};
const mondayOf = (iso: string) => addDaysISO(iso, -((parseISO(iso).getDay() + 6) % 7));
const dowOf = (iso: string) => (parseISO(iso).getDay() + 6) % 7; // 0 = Monday … 6 = Sunday
const fmtShort = (iso: string) =>
  parseISO(iso).toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" });

export default function ClientePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [picked, setPicked] = useState<Client | null>(null);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [tab, setTab] = useState<"rutina" | "dieta" | "datos" | "progreso">("rutina");
  const [dayIdx, setDayIdx] = useState(0);
  const [log, setLog] = useState<LogExercise[] | null>(null);
  // Routines (day ids) with logged data on the selected date → ✓ badge on pills.
  const [dayStatus, setDayStatus] = useState<Record<string, boolean>>({});
  const [selDate, setSelDate] = useState(() => isoLocal(new Date()));
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const stripRef = useRef<HTMLDivElement>(null);
  const selCellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((j) => setClients(Array.isArray(j) ? j : []))
      .catch(() => setClients([]));
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    const cell = selCellRef.current;
    if (strip && cell) {
      strip.scrollTo({ left: cell.offsetLeft - strip.clientWidth / 2 + cell.clientWidth / 2, behavior: "smooth" });
    }
  }, [selDate]);

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

  const loadLog = async (clientId: string, dayId: string, date: string) => {
    const r = await fetch(`/api/clients/${clientId}/logs/${dayId}?date=${date}`);
    const j = await r.json();
    setLog(j.payload as LogExercise[]);
  };

  // Pick which routine to show for a date: keep the current one if it has
  // data, otherwise jump to the first routine with logged data (so a past
  // day "appears done" instead of showing an empty routine).
  const refreshForDate = async (
    clientId: string,
    days: Bundle["days"],
    date: string,
    currentIdx: number
  ) => {
    let status: Record<string, boolean> = {};
    try {
      const r = await fetch(`/api/clients/${clientId}/log-status?date=${date}`);
      const j = await r.json();
      if (j && typeof j.status === "object") status = j.status;
    } catch {
      status = {};
    }
    setDayStatus(status);
    let i = currentIdx;
    if (!days[i] || !status[days[i].id]) {
      const withData = days.findIndex((d) => status[d.id]);
      if (withData >= 0) {
        i = withData;
      } else if (!days[i]) {
        const fallback = days.findIndex((d) => d.weekday != null && d.weekday === dowOf(date));
        i = fallback >= 0 ? fallback : 0;
      }
    }
    setDayIdx(i);
    if (days[i]) loadLog(clientId, days[i].id, date);
    else setLog(null);
  };

  useEffect(() => {
    if (bundle && bundle.days.length) {
      const idx = bundle.days.findIndex((d) => d.weekday != null && d.weekday === dowOf(selDate));
      refreshForDate(bundle.client.id, bundle.days, selDate, idx >= 0 ? idx : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle?.client.id]);

  const saveLog = async (next: LogExercise[]) => {
    if (isFutureDate) return;
    if (!bundle || !bundle.days[dayIdx]) return;
    setLog(next);
    const hasData = next.some((ex) => ex.sets.some((s) => s.weight || s.reps || s.done));
    const dayId = bundle.days[dayIdx].id;
    setDayStatus((prev) => ({ ...prev, [dayId]: hasData }));
    await fetch(`/api/clients/${bundle.client.id}/logs/${bundle.days[dayIdx].id}?date=${selDate}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: next }),
    });
  };

  const recordCompletion = async (dayName: string) => {
    if (!bundle) return;
    if (bundle.history.some((h) => h.date === selDate && h.dayName === dayName)) return;
    await fetch(`/api/clients/${bundle.client.id}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "history", dayName, date: selDate }),
    });
    setBundle({ ...bundle, history: [{ date: selDate, dayName }, ...bundle.history] });
  };

  const gotoDate = (date: string) => {
    setSelDate(date);
    if (!bundle || !bundle.days.length) return;
    if (date > todayStr) {
      // future dates: read-only preview of the selected routine, nothing to load
      setDayStatus({});
      setLog(null);
      return;
    }
    refreshForDate(bundle.client.id, bundle.days, date, dayIdx);
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

  const todayStr = isoLocal(new Date());
  const days = bundle.days;
  const day = days[dayIdx] ?? null;
  const isFutureDate = selDate > todayStr;
  const preview: LogExercise[] | null =
    isFutureDate && day
      ? day.exercises.map((e) => ({
          name: e.name,
          sets: e.sets.map((t) => ({ target: t, reps: "", weight: "", done: false })),
        }))
      : null;
  const viewLog = isFutureDate ? preview : log;
  const total = (viewLog ?? []).reduce((a, e) => a + e.sets.length, 0);
  const done = (viewLog ?? []).reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const histDates = new Set(bundle.history.map((h) => h.date));
  const stripDays: string[] = [];
  for (let d = mondayOf(addDaysISO(todayStr, -3 * 7)); d <= addDaysISO(todayStr, 7); d = addDaysISO(d, 1)) {
    stripDays.push(d);
  }

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
          <div ref={stripRef} className="flex gap-1 overflow-x-auto pb-1">
            {stripDays.map((d) => {
              const isSel = d === selDate;
              const doneHere = histDates.has(d);
              const wd = (parseISO(d).getDay() + 6) % 7;
              const schedHere = bundle.days.some((dd) => dd.weekday === wd);
              return (
                <button
                  key={d}
                  ref={isSel ? selCellRef : undefined}
                  onClick={() => gotoDate(d)}
                  className={`flex shrink-0 grow-0 basis-[calc((100%-24px)/7)] snap-start flex-col items-center rounded-lg border py-1.5 ${
                    isSel ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  <span className="text-[10px] leading-none">{WEEKDAYS[wd]}</span>
                  <span className="text-sm font-bold leading-tight">{Number(d.slice(8))}</span>
                  {doneHere ? (
                    <span
                      className="mt-0.5 h-1.5 w-1.5 rounded-full"
                      style={{ background: isSel ? "#0a0a0a" : "#9CFF3D" }}
                    />
                  ) : (
                    <span className="mt-0.5 h-1.5" />
                  )}
                  {schedHere ? (
                    <span
                      className="mt-0.5 h-0.5 w-4 rounded-full"
                      style={{ background: isSel ? "#0a0a0a" : "#9CFF3D", opacity: 0.55 }}
                    />
                  ) : (
                    <span className="mt-0.5 h-0.5" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <b className="text-sm capitalize">{selDate === todayStr ? "Hoy" : fmtShort(selDate)}</b>
            {selDate !== todayStr && (
              <Button variant="link" size="sm" className="h-auto p-0" onClick={() => gotoDate(todayStr)}>
                Volver a hoy
              </Button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((d, i) => (
              <Button
                key={d.id}
                size="sm"
                variant={i === dayIdx ? "default" : "outline"}
                className="shrink-0 rounded-full"
                onClick={() => { setDayIdx(i); if (selDate > todayStr) setLog(null); else loadLog(bundle.client.id, d.id, selDate); }}
              >
                {d.name}
                {dayStatus[d.id] && (
                  <span className="ml-1.5 font-bold" style={{ color: "#9CFF3D" }}>
                    ✓
                  </span>
                )}
                {d.weekday != null && (
                  <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">
                    {WEEKDAYS[d.weekday]}
                  </span>
                )}
              </Button>
            ))}
          </div>
          {!days.length && <p className="text-sm text-muted-foreground">Tu entrenador todavía no ha creado tu rutina.</p>}
          {day && day.weekday != null && day.weekday !== dowOf(selDate) && (
            <p className="text-xs text-muted-foreground">
              Rutina del {WEEKDAY_FULL[day.weekday]} · la estás viendo el <b className="capitalize">{fmtShort(selDate)}</b>.
            </p>
          )}
          {day && (viewLog ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Este día aún no tiene ejercicios asignados. Pídele a tu entrenador que los agregue.</p>
          )}
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
              {isFutureDate && (
                <Card>
                  <CardContent className="py-3 text-sm">
                    📅 Programado para el <b className="capitalize">{fmtShort(selDate)}</b>
                    {day.name ? <> · {day.name}</> : null}. Aquí la verás ese día.
                  </CardContent>
                </Card>
              )}
              {(viewLog ?? []).map((ex, ei) => {
                const allDone = ex.sets.length > 0 && ex.sets.every((s) => s.done);
                // Media paired by exercise name (not position) so trainer
                // reorders/renames never mix up names with GIFs.
                const routineEx = day.exercises.find((r) => r.name === ex.name);
                const patchSet = (si: number, patch: Partial<{ target: string; reps: string; weight: string; done: boolean }>) => {
                  const n = structuredClone(log ?? []);
                  Object.assign(n[ei].sets[si], patch);
                  saveLog(n);
                  if (n.every((x) => x.sets.every((y) => y.done))) recordCompletion(day!.name);
                };
                return (
                <Card key={ei}>
                  <CardContent className="flex flex-col gap-2 pt-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-[30px] shrink-0 text-center leading-none"
                        style={{ fontFamily: "var(--font-marker)", color: "#9CFF3D", fontSize: 26 }}
                      >
                        {ei + 1}
                      </span>
                      <div className="flex flex-1 flex-col">
                        <b className="text-sm">{ex.name}</b>
                        <span className="text-xs text-muted-foreground">{ex.sets.length} serie(s)</span>
                      </div>
                      <span
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-full border-[1.5px] text-[13px] font-bold"
                        style={allDone ? { background: "#9CFF3D", borderColor: "#9CFF3D", color: "#0a0a0a" } : undefined}
                      >
                        ✓
                      </span>
                    </div>
                    {(routineEx?.media ?? []).length > 0 && (
                      <div className="flex gap-2 overflow-x-auto py-1">
                        {(routineEx?.media ?? []).map((url, mi) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={mi}
                            src={url}
                            alt=""
                            loading="lazy"
                            className="h-20 w-20 shrink-0 rounded-md border border-border object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="border-t border-border">
                      <div className="grid grid-cols-[26px_1fr_72px_72px_34px] items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground">
                        <span />
                        <span>Objetivo</span>
                        <span className="text-center">Kg</span>
                        <span className="text-center">Reps</span>
                        <span />
                      </div>
                      {ex.sets.map((s, si) => (
                        <div key={si} className="grid grid-cols-[26px_1fr_72px_72px_34px] items-center gap-2 border-b border-border/60 px-3 py-2 text-[13px] last:border-b-0">
                          <span className="text-center font-bold text-muted-foreground">{si + 1}</span>
                          <span className="text-xs leading-snug text-muted-foreground">{s.target}</span>
                          <Input className="h-8 px-1 text-center font-semibold" type="number" inputMode="decimal" value={s.weight} placeholder="0" disabled={isFutureDate} onChange={(e) => patchSet(si, { weight: e.target.value })} />
                          <Input className="h-8 px-1 text-center font-semibold" type="number" inputMode="numeric" value={s.reps} placeholder="0" disabled={isFutureDate} onChange={(e) => patchSet(si, { reps: e.target.value })} />
                          {!isFutureDate ? (
                            <button onClick={() => patchSet(si, { done: !s.done })} className="h-[26px] w-[26px] rounded-full border-[1.5px] border-border" style={s.done ? { background: "#9CFF3D", borderColor: "#9CFF3D", color: "#0a0a0a" } : undefined}>✓</button>
                          ) : (
                            <span />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                );
              })}
              {(() => {
                if (isFutureDate) return null;
                const recorded = bundle.history.some((h) => h.date === selDate && h.dayName === day.name);
                const finished = recorded || (total > 0 && done === total);
                return (
                  <>
                    {!finished && total > 0 && (
                      <p className="text-center text-xs text-muted-foreground">
                        Marca cada serie con ✓ o termina todo de una vez abajo.
                      </p>
                    )}
                    <Button
                      size="lg"
                      disabled={finished || !total}
                      onClick={async () => {
                        const n = (log ?? []).map((x) => ({ ...x, sets: x.sets.map((s) => ({ ...s, done: true })) }));
                        await saveLog(n);
                        recordCompletion(day.name);
                      }}
                    >
                      {finished ? "✓ Rutina completada" : "Completar rutina del día"}
                    </Button>
                  </>
                );
              })()}
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
              {PROFILE_LABELS.filter(([k]) => bundle.profile?.[k]).map(([k, label]) => (
                <div key={k} className="rounded-md bg-muted p-2 text-center">
                  <div className="font-extrabold">{bundle.profile?.[k]}</div>
                  <div className="text-[10px] text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
            {!PROFILE_LABELS.some(([k]) => bundle.profile?.[k]) && <p className="mt-2 text-sm text-muted-foreground">Sin medidas registradas.</p>}
          </CardContent>
        </Card>
      )}

      {tab === "progreso" &&
        (() => {
          const total = bundle.history.length;
          const inLast = (n: number) => bundle.history.filter((h) => h.date >= addDaysISO(todayStr, -(n - 1))).length;
          let streak = 0;
          let cursor = histDates.has(todayStr) ? todayStr : addDaysISO(todayStr, -1);
          while (histDates.has(cursor)) {
            streak++;
            cursor = addDaysISO(cursor, -1);
          }
          const { y, m } = calMonth;
          const now = new Date();
          const atCurrentMonth = y === now.getFullYear() && m === now.getMonth();
          const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
          const dim = new Date(y, m + 1, 0).getDate();
          const cells: (string | null)[] = [
            ...Array<string | null>(firstDow).fill(null),
            ...Array.from({ length: dim }, (_, i) => isoLocal(new Date(y, m, i + 1))),
          ];
          const stats: [string, string][] = [
            ["Total", String(total)],
            ["7 días", String(inLast(7))],
            ["30 días", String(inLast(30))],
            ["Racha", streak ? `${streak}d` : "—"],
          ];
          return (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-4 gap-2">
                {stats.map(([label, value]) => (
                  <Card key={label}>
                    <CardContent className="p-3 text-center">
                      <div className="text-xl font-extrabold">{value}</div>
                      <div className="text-[11px] text-muted-foreground">{label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card>
                <CardContent className="pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Mes anterior"
                      onClick={() => setCalMonth({ y: m === 0 ? y - 1 : y, m: m === 0 ? 11 : m - 1 })}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <b className="text-sm capitalize">
                      {MONTHS[m]} {y}
                    </b>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Mes siguiente"
                      disabled={atCurrentMonth}
                      onClick={() => setCalMonth({ y: m === 11 ? y + 1 : y, m: m === 11 ? 0 : m + 1 })}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {WEEKDAYS.map((w, i) => (
                      <span key={i} className="py-1 text-[10px] font-bold text-muted-foreground">
                        {w}
                      </span>
                    ))}
                    {cells.map((c, i) =>
                      c === null ? (
                        <span key={`e${i}`} />
                      ) : (
                        <button
                          key={c}
                          disabled={c > todayStr || !histDates.has(c)}
                          onClick={() => {
                            setTab("rutina");
                            gotoDate(c);
                          }}
                          className={`flex flex-col items-center rounded-lg border py-1.5 ${
                            histDates.has(c) ? "border-primary/60" : "border-transparent opacity-40"
                          }`}
                        >
                          <span className="text-sm leading-tight">{Number(c.slice(8))}</span>
                          {histDates.has(c) ? (
                            <span className="mt-0.5 h-1.5 w-1.5 rounded-full" style={{ background: "#9CFF3D" }} />
                          ) : (
                            <span className="mt-0.5 h-1.5" />
                          )}
                        </button>
                      )
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Toca un día marcado para ver ese entrenamiento.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <b className="text-sm">Rutinas completadas ({total})</b>
                  {bundle.history.slice(0, 10).map((h, i) => (
                    <p key={i} className="text-sm">
                      {h.dayName} — {h.date}
                    </p>
                  ))}
                  {!total && <p className="mt-1 text-sm text-muted-foreground">Aún no has completado ninguna. ¡Vamos!</p>}
                </CardContent>
              </Card>
            </div>
          );
        })()}

      <div className="fixed bottom-0 left-1/2 flex w-full -translate-x-1/2 border-t border-border bg-background/95 p-2 backdrop-blur" style={{ maxWidth: "var(--shell-max)" }}>
        {(["rutina", "dieta", "datos", "progreso"] as const).map((t) => (
          <Button key={t} variant={tab === t ? "secondary" : "ghost"} className="flex-1 capitalize" onClick={() => setTab(t)}>
            {t}
          </Button>
        ))}
      </div>
    </div>
  );
}

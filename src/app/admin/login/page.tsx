"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ShieldCheck } from "lucide-react";
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
    <div className="forja-shell gap-4 p-5">
      <Button render={<Link href="/" />} variant="ghost" className="w-fit px-0" style={{ color: "#9CFF3D" }}>
        <ChevronLeft size={18} />
        Inicio
      </Button>
      <div className="flex items-center gap-2">
        <ShieldCheck size={22} style={{ color: "#9CFF3D" }} />
        <h1 className="text-2xl font-bold">Acceso administrador</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Solo cuentas con permiso de administrador. Los entrenadores usan su PIN y los clientes su código personal.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Zona restringida.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="admin-email">Email de administrador</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@forja.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="admin-pass">Contraseña</Label>
            <Input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
            />
          </div>
          <Button onClick={doLogin} disabled={busy}>
            {busy ? "Verificando…" : "Entrar como admin"}
          </Button>
          {msg && <p className="text-sm text-destructive">{msg}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

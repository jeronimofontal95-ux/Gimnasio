"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
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
    <div className="forja-shell gap-4 p-5">
      <Button render={<Link href="/" />} variant="ghost" className="w-fit px-0" style={{ color: "#9CFF3D" }}>
        <ChevronLeft size={18} />
        Inicio
      </Button>
      <div>
        <h1 className="text-2xl font-bold">Cuenta de entrenador</h1>
        <p className="text-sm text-muted-foreground">
          Accede con tu email y contraseña para gestionar a tus clientes. ¿Eres cliente? Entra con tu código
          personal en la página de cliente.
        </p>
      </div>

      {isPending ? (
        <p className="text-sm text-muted-foreground">Cargando sesión…</p>
      ) : session ? (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <p className="text-sm">
              Sesión activa: <b>{session.user.email}</b>
            </p>
            <div className="flex gap-2">
              <Button render={<Link href="/entrenador" />}>Ir al panel</Button>
              <Button variant="secondary" onClick={() => signOut()}>
                Cerrar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Entrar o crear cuenta</CardTitle>
            <CardDescription>Solo para entrenadores.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="login-name">Nombre (solo registro)</Label>
              <Input id="login-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sergio" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@forja.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="login-pass">Contraseña</Label>
              <Input
                id="login-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={doSignIn}>Entrar</Button>
              <Button variant="outline" onClick={doSignUp}>
                Crear cuenta
              </Button>
            </div>
            {msg && <p className="text-sm">{msg}</p>}
          </CardContent>
        </Card>
      )}
      <Button render={<Link href="/admin/login" />} variant="link" className="mx-auto text-xs text-muted-foreground">
        ¿Eres administrador? Acceso administradores
      </Button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dumbbell } from "lucide-react";
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
      <div className="forja-shell gap-3 p-5">
        <p className="text-sm text-muted-foreground">Verificando permisos…</p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="forja-shell gap-4 p-5">
        <h1 className="text-2xl font-bold">Acceso denegado</h1>
        <p className="text-sm text-muted-foreground">Esta zona es solo para administradores.</p>
        <Button render={<Link href="/admin/login" />}>Ir al acceso de admin</Button>
      </div>
    );
  }

  return (
    <div className="forja-shell gap-4 p-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel admin</h1>
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={async () => {
            await signOut();
            window.location.href = "/admin/login";
          }}
        >
          Salir
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Conectado como <b className="text-foreground">{me?.email}</b>
      </p>

      <Button render={<Link href="/entrenador" />} size="lg">
        <Dumbbell size={18} />
        Gestionar programas de clientes
      </Button>
      <p className="-mt-2 text-xs text-muted-foreground">
        Crea clientes y asígnales rutinas, dietas y seguimiento.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cuentas registradas ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cuenta</TableHead>
                  <TableHead className="text-right">Rol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {u.isAdmin ? <Badge>ADMIN</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">Sin cuentas todavía.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

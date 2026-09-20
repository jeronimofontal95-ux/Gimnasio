import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Dumbbell, KeyRound, User } from "lucide-react";

function RoleCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="transition-colors hover:border-primary/60">
        <CardContent className="flex items-center gap-3.5 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-muted text-foreground">
            {icon}
          </span>
          <span className="min-w-0 flex-1">
            <strong className="font-display block text-base tracking-wide">{title}</strong>
            <span className="block text-[13px] text-muted-foreground">{subtitle}</span>
          </span>
          <ChevronRight size={20} className="shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="forja-shell bg-[#0A0A0A]">
      <div style={{ borderTop: "90px solid #9CFF3D", borderRight: "76px solid transparent", width: 0 }} />
      <div className="flex flex-1 flex-col gap-3 px-6 pb-8 pt-2">
        <p className="text-sm font-extrabold tracking-[0.3em]" style={{ color: "#9CFF3D" }}>
          FORJA
        </p>
        <h1
          className="font-display text-[46px] uppercase leading-[0.95] text-white"
          style={{ letterSpacing: "0.5px", textShadow: "0 2px 0 rgba(0,0,0,0.4)" }}
        >
          Nunca
          <br />
          te rindas
        </h1>
        <p className="font-marker text-[26px] leading-[1.25]" style={{ color: "#9CFF3D" }}>
          ¿Estás listo
          <br />
          para el cambio?
        </p>
        <div className="text-sm font-semibold text-muted-foreground">
          <p>
            IG: <strong className="text-white">@sergiodvid</strong>
          </p>
          <p>
            <strong className="text-white">+57 314 4584663</strong>
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <Image
            src="/trainer.jpg"
            alt="Entrenador"
            width={800}
            height={450}
            className="h-48 w-full object-cover grayscale contrast-[1.12]"
            style={{ objectPosition: "center 15%" }}
            priority
          />
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <RoleCard
            href="/entrenador"
            icon={<Dumbbell size={22} />}
            title="Soy el entrenador"
            subtitle="Gestiona clientes, rutinas y dietas"
          />
          <RoleCard
            href="/cliente"
            icon={<User size={22} />}
            title="Soy cliente"
            subtitle="Registra tu entrenamiento de hoy"
          />
          <Link
            href="/login"
            className="mx-auto flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <KeyRound size={14} />
            Cuenta de entrenador con email
          </Link>
        </div>
      </div>
    </div>
  );
}

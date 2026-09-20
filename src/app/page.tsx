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
      {/* Cover photo on top, compact */}
      <div className="relative h-[190px] w-full shrink-0 overflow-hidden">
        <Image
          src="/trainer.jpg"
          alt="Entrenador"
          fill
          sizes="(max-width: 768px) 100vw, 832px"
          className="object-cover grayscale contrast-[1.12]"
          style={{ objectPosition: "center 62%" }}
          priority
        />
        <div
          className="absolute inset-x-0 bottom-0 z-[1] h-[100px]"
          style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0) 0%, #0A0A0A 92%)" }}
        />
        <div
          className="absolute left-0 top-0 z-[2] h-0 w-0"
          style={{ borderTop: "60px solid #9CFF3D", borderRight: "50px solid transparent" }}
        />
        <div className="absolute right-[18px] top-4 z-[2] flex gap-[7px]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="block h-[10px] w-[10px] rounded-full" style={{ background: "#9CFF3D" }} />
          ))}
        </div>
      </div>

      <div className="relative z-[2] -mt-2 px-[22px]">
        <p className="mb-3 text-sm font-extrabold tracking-[0.3em]" style={{ color: "#9CFF3D" }}>
          FORJA
        </p>
        <h1
          className="font-display mb-3 text-[46px] uppercase leading-[0.95] text-white"
          style={{ letterSpacing: "0.5px", textShadow: "0 2px 0 rgba(0,0,0,0.4)" }}
        >
          Nunca
          <br />
          te rindas
        </h1>
        <p className="font-marker mb-5 text-[26px] leading-[1.25]" style={{ color: "#9CFF3D" }}>
          ¿Estás listo
          <br />
          para el cambio?
        </p>
        <div className="mb-5 flex flex-col gap-1.5 text-sm font-semibold text-white">
          <span>
            IG: <strong className="font-extrabold">@sergiodvid</strong>
          </span>
          <span>
            <strong className="font-extrabold">+57 314 4584663</strong>
          </span>
        </div>
      </div>

      <div className="relative z-[2] mt-auto flex flex-col gap-3 px-[22px] pb-[26px] pt-[10px]">
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
  );
}

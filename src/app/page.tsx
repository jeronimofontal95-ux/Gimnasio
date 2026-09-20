import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Dumbbell, KeyRound, User } from "lucide-react";

export default function Home() {
  return (
    <div className="forja-shell bg-[#0A0A0A]">
      <div style={{ borderTop: "90px solid #9CFF3D", borderRight: "76px solid transparent", width: 0 }} />
      <div className="flex flex-1 flex-col gap-3 px-6 pb-8 pt-2">
        <p className="text-sm font-extrabold tracking-[0.3em]" style={{ color: "#9CFF3D" }}>
          FORJA
        </p>
        <h1 className="text-5xl font-black uppercase leading-[0.95]">
          Nunca
          <br />
          te rindas
        </h1>
        <p className="text-xl" style={{ color: "#9CFF3D" }}>
          ¿Estás listo para el cambio?
        </p>
        <div className="text-sm font-semibold text-muted-foreground">
          <p>IG: @sergiodvid</p>
          <p>+57 314 4584663</p>
        </div>
        <div className="mt-auto flex flex-col gap-3">
          <Button render={<Link href="/entrenador" />} size="lg" className="h-14 justify-between px-5 text-base">
            <span className="flex items-center gap-3">
              <Dumbbell size={20} />
              Soy entrenador
            </span>
            <ChevronRight size={20} />
          </Button>
          <Button render={<Link href="/cliente" />} size="lg" variant="secondary" className="h-14 justify-between px-5 text-base">
            <span className="flex items-center gap-3">
              <User size={20} />
              Soy cliente
            </span>
            <ChevronRight size={20} />
          </Button>
          <Button render={<Link href="/login" />} variant="ghost" className="text-muted-foreground">
            <span className="flex items-center gap-2">
              <KeyRound size={16} />
              Cuenta de entrenador con email
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

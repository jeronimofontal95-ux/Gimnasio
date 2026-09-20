export type TemplateExercise = { name: string; gif: string; sets: string[] };
export type TemplateDay = { name: string; warmup: string; exercises: TemplateExercise[] };

const S = (n: number, label: string, range?: string): string[] => {
  const t = range ? `${label} ${range}` : label;
  return Array(n).fill(t);
};

export function plantillaRutina(): { days: TemplateDay[] } {
  return {
    days: [
      {
        name: "Día 1 · Pierna",
        warmup: "Movilidad articular 10 min: tobillos, rodillas y cadera.",
        exercises: [
          { name: "Aductores en máquina", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/HIP-ADDUCTION-MACHINE.gif", sets: [...S(2, "Aprox", "15-20 reps"), ...S(3, "Efectiva", "12-15 reps")] },
          { name: "Sentadilla máquina Smith", gif: "https://fitnessprogramer.com/wp-content/uploads/2024/10/smith-machine-squat.gif", sets: [...S(3, "Aprox", "12-15 reps"), ...S(3, "Efectiva", "8-10 reps")] },
          { name: "Curl femoral sentado", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/08/Seated-Leg-Curl.gif", sets: [...S(3, "Efectiva", "10-12 reps")] },
          { name: "Prensa en máquina", gif: "https://fitnessprogramer.com/wp-content/uploads/2015/11/Leg-Press.gif", sets: [...S(2, "Efectiva", "12-15 reps")] },
          { name: "Curl femoral acostado", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif", sets: [...S(2, "Efectiva", "10-12 reps")] },
          { name: "Extensión de rodillas", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif", sets: [...S(3, "Efectiva", "8-10 reps")] },
          { name: "Hip thrust", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif", sets: [...S(3, "Efectiva", "10-12 reps")] },
          { name: "Elevación de talones en prensa", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/05/Leg-Press-Calf-Raise.gif", sets: [...S(3, "Efectiva", "12-15 reps")] },
        ],
      },
      {
        name: "Día 2 · Empuje (pecho, hombro, tríceps)",
        warmup: "Movilidad de hombros, codos y muñecas, 5-10 min.",
        exercises: [
          { name: "Press inclinado con mancuernas", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif", sets: [...S(2, "Aprox", "15-20 reps"), ...S(3, "Efectiva", "10-12 reps")] },
          { name: "Press plano con barra", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif", sets: [...S(3, "Efectiva", "8-10 reps")] },
          { name: "Peckdeck", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pec-Deck-Fly.gif", sets: [...S(3, "Efectiva", "12-15 reps")] },
          { name: "Cruce en polea alta", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crossover.gif", sets: [...S(2, "Efectiva", "10-12 reps")] },
          { name: "Press militar (mancuerna o Smith)", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif", sets: [...S(1, "Aprox", "15 reps"), ...S(3, "Efectiva", "10-12 reps")] },
          { name: "Elevaciones laterales con mancuernas", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif", sets: [...S(3, "Efectiva", "12-15 reps")] },
          { name: "Extensión de tríceps con barra", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif", sets: [...S(3, "Efectiva", "10-12 reps")] },
          { name: "Extensión tríceps katana", gif: "", sets: [...S(3, "Efectiva", "8-10 reps")] },
          { name: "Pájaros en máquina (peckdeck inversa)", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Rear-Delt-Machine-Flys.gif", sets: [...S(3, "Efectiva", "10-12 reps")] },
        ],
      },
      {
        name: "Día 3 · Jalones (espalda, bíceps)",
        warmup: "Movilidad de hombros, codos y muñecas, 5-10 min.",
        exercises: [
          { name: "Dominadas", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif", sets: [...S(3, "Efectiva", "al fallo")] },
          { name: "Jalón al pecho agarre ancho", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif", sets: [...S(2, "Aprox", "15 reps"), ...S(3, "Efectiva", "8-10 reps")] },
          { name: "Remo en máquina", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Row-Machine.gif", sets: [...S(3, "Efectiva", "10-12 reps")] },
          { name: "Remo con barra", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif", sets: [...S(3, "Efectiva", "10-12 por brazo")] },
          { name: "Curl bíceps predicador", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Z-Bar-Preacher-Curl.gif", sets: [...S(3, "Efectiva", "12-15 reps")] },
          { name: "Curl bíceps martillo", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif", sets: [...S(3, "Efectiva", "10-12 reps")] },
          { name: "Curl de antebrazo con barra", gif: "https://fitnessprogramer.com/wp-content/uploads/2025/07/seated-barbell-finger-curl.gif", sets: [...S(3, "Efectiva", "15-20 reps")] },
        ],
      },
      {
        name: "Día 4 · Pierna",
        warmup: "Movilidad 5 min + caminata 10 min con inclinación, baja intensidad.",
        exercises: [
          { name: "Aductores en máquina", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/HIP-ADDUCTION-MACHINE.gif", sets: [...S(2, "Aprox", "15-20 reps"), ...S(3, "Efectiva", "10-12 reps")] },
          { name: "Sentadilla máquina Smith", gif: "https://fitnessprogramer.com/wp-content/uploads/2024/10/smith-machine-squat.gif", sets: [...S(2, "Aprox", "15 reps"), ...S(2, "Efectiva", "10-12 reps")] },
          { name: "Curl femoral sentado", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/08/Seated-Leg-Curl.gif", sets: [...S(3, "Efectiva", "10-12 reps")] },
          { name: "Peso muerto rumano", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif", sets: [...S(2, "Efectiva", "8-12 reps")] },
          { name: "Curl femoral tumbado", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Curl.gif", sets: [...S(2, "Efectiva", "10-12 reps")] },
          { name: "Biserie: extensión de rodillas + zancadas", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif", sets: [...S(3, "Efectiva", "10-12 reps + 10 pasos/pierna")] },
          { name: "Elevación de talones en prensa", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/05/Leg-Press-Calf-Raise.gif", sets: [...S(3, "Efectiva", "10-15 reps")] },
        ],
      },
      {
        name: "Día 5 · Torso completo",
        warmup: "Movilidad articular general antes de iniciar.",
        exercises: [
          { name: "Dominadas", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif", sets: [...S(2, "Al fallo", "")] },
          { name: "Fondos en paralelas", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Triceps-Dips.gif", sets: [...S(2, "Al fallo", "")] },
          { name: "Press inclinado con mancuernas", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pec-Deck-Fly.gif", sets: [...S(3, "Efectiva", "8-12 reps")] },
          { name: "Jalón al pecho agarre amplio", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif", sets: [...S(3, "Efectiva", "10-12 reps")] },
          { name: "Peckdeck", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pec-Deck-Fly.gif", sets: [...S(3, "Efectiva", "10-12 reps")] },
          { name: "Remo con barra", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif", sets: [...S(3, "Efectiva", "8-12 reps")] },
          { name: "Extensión de tríceps", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif", sets: [...S(3, "Efectiva", "10-12 reps")] },
          { name: "Curl bíceps predicador", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Z-Bar-Preacher-Curl.gif", sets: [...S(3, "Efectiva", "10-12 reps")] },
          { name: "Biserie: laterales + frontales", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Alternating-Dumbbell-Front-Raise.gif", sets: [...S(2, "Al fallo", "")] },
          { name: "Pájaros en máquina (peckdeck inversa)", gif: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Rear-Delt-Machine-Flys.gif", sets: [...S(2, "Al fallo", "")] },
        ],
      },
    ],
  };
}

export const todayISO = () => new Date().toISOString().slice(0, 10);
export const genCode = () => String(Math.floor(1000 + Math.random() * 9000));

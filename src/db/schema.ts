import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";

/* ================= better-auth core tables ================= */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ================= FORJA gym domain =================
   Mirrors the original forja-app-gimnasio.html data model:
   clients-list, client:{id}:profile, routine {days[]},
   diet, history, weights, log:dayIdx
==================================================== */

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Trainer (better-auth user) that owns this client. Nullable so the
  // original PIN/code flow keeps working before you enforce auth.
  ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .unique()
    .references(() => clients.id, { onDelete: "cascade" }),
  edad: text("edad").default(""),
  sexo: text("sexo").default(""),
  peso: text("peso").default(""),
  altura: text("altura").default(""),
  cuello: text("cuello").default(""),
  pecho: text("pecho").default(""),
  cintura: text("cintura").default(""),
  cadera: text("cadera").default(""),
  bicepsD: text("biceps_d").default(""),
  bicepsI: text("biceps_i").default(""),
  antebrazoD: text("antebrazo_d").default(""),
  antebrazoI: text("antebrazo_i").default(""),
  cuadricepsD: text("cuadriceps_d").default(""),
  cuadricepsI: text("cuadriceps_i").default(""),
  gemeloD: text("gemelo_d").default(""),
  gemeloI: text("gemelo_i").default(""),
  telefono: text("telefono").default(""),
  fechaInicio: text("fecha_inicio").default(""),
  notas: text("notas").default(""),
  // client profile photo, stored as data URL (same pattern as the original HTML)
  photo: text("photo").default(""),
});

export const routineDays = pgTable("routine_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  name: text("name").notNull().default("Nuevo día"),
  warmup: text("warmup").default(""),
  // scheduled weekday: 0 = Monday … 6 = Sunday, null = unscheduled
  weekday: integer("weekday"),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayId: uuid("day_id")
    .notNull()
    .references(() => routineDays.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  name: text("name").notNull(),
  // up to 3 GIF/image URLs
  media: jsonb("media").$type<string[]>().notNull().default([]),
  // one string per set, e.g. "Efectiva 10-12 reps"
  sets: jsonb("sets").$type<string[]>().notNull().default([]),
});

export const diets = pgTable("diets", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .unique()
    .references(() => clients.id, { onDelete: "cascade" }),
  desayuno: text("desayuno").default(""),
  almuerzo: text("almuerzo").default(""),
  cena: text("cena").default(""),
  snacks: text("snacks").default(""),
  notas: text("notas").default(""),
});

export const weights = pgTable("weights", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  kg: text("kg").notNull(),
});

export const history = pgTable("history", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  dayName: text("day_name").notNull(),
});

export type LogSet = { target: string; reps: string; weight: string; done: boolean };
export type LogExercise = { name: string; sets: LogSet[] };

export const workoutLogs = pgTable("workout_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  dayId: uuid("day_id").references(() => routineDays.id, { onDelete: "cascade" }),
  logDate: text("log_date").notNull(),
  signature: text("signature").notNull().default(""),
  payload: jsonb("payload").$type<LogExercise[]>().notNull().default([]),
});

export const trainerSettings = pgTable("trainer_settings", {
  // one row per trainer (better-auth user). id === user.id
  userId: text("user_id").primaryKey(),
  pin: varchar("pin", { length: 10 }).notNull().default("1234"),
});

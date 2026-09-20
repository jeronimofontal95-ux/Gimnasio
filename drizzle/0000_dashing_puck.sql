CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text,
	"name" text NOT NULL,
	"code" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"desayuno" text DEFAULT '',
	"almuerzo" text DEFAULT '',
	"cena" text DEFAULT '',
	"snacks" text DEFAULT '',
	"notas" text DEFAULT '',
	CONSTRAINT "diets_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"name" text NOT NULL,
	"media" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sets" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"date" text NOT NULL,
	"day_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"edad" text DEFAULT '',
	"sexo" text DEFAULT '',
	"peso" text DEFAULT '',
	"altura" text DEFAULT '',
	"cuello" text DEFAULT '',
	"pecho" text DEFAULT '',
	"cintura" text DEFAULT '',
	"cadera" text DEFAULT '',
	"biceps_d" text DEFAULT '',
	"biceps_i" text DEFAULT '',
	"antebrazo_d" text DEFAULT '',
	"antebrazo_i" text DEFAULT '',
	"cuadriceps_d" text DEFAULT '',
	"cuadriceps_i" text DEFAULT '',
	"gemelo_d" text DEFAULT '',
	"gemelo_i" text DEFAULT '',
	"telefono" text DEFAULT '',
	"fecha_inicio" text DEFAULT '',
	"notas" text DEFAULT '',
	CONSTRAINT "profiles_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "routine_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"name" text DEFAULT 'Nuevo día' NOT NULL,
	"warmup" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "trainer_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"pin" varchar(10) DEFAULT '1234' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"date" text NOT NULL,
	"kg" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"day_id" uuid,
	"log_date" text NOT NULL,
	"signature" text DEFAULT '' NOT NULL,
	"payload" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diets" ADD CONSTRAINT "diets_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_day_id_routine_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."routine_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "history" ADD CONSTRAINT "history_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine_days" ADD CONSTRAINT "routine_days_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weights" ADD CONSTRAINT "weights_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_day_id_routine_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."routine_days"("id") ON DELETE cascade ON UPDATE no action;
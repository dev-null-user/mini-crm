CREATE TYPE "schedule_status" AS ENUM ('draft', 'published');

CREATE TABLE "employees" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "full_name" varchar(180) NOT NULL,
  "role" varchar(50) DEFAULT 'agent' NOT NULL,
  "weekly_target_minutes" integer DEFAULT 1440 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "employees_weekly_target_nonnegative" CHECK ("weekly_target_minutes" >= 0)
);

CREATE INDEX "employees_full_name_idx" ON "employees" ("full_name");

CREATE TABLE "schedules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "status" "schedule_status" DEFAULT 'draft' NOT NULL,
  "version" integer DEFAULT 1 NOT NULL,
  "published_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "schedules_date_range_chk" CHECK ("end_date" >= "start_date"),
  CONSTRAINT "schedules_version_positive_chk" CHECK ("version" >= 1)
);

CREATE UNIQUE INDEX "schedules_period_uidx" ON "schedules" ("start_date", "end_date");

CREATE TABLE "shift_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(80) NOT NULL,
  "start_time" time NOT NULL,
  "end_time" time NOT NULL,
  "break_minutes" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "shift_templates_time_distinct_chk" CHECK ("start_time" <> "end_time"),
  CONSTRAINT "shift_templates_break_range_chk" CHECK ("break_minutes" >= 0 AND "break_minutes" < 1440)
);

CREATE UNIQUE INDEX "shift_templates_name_uidx" ON "shift_templates" ("name");

CREATE TABLE "shifts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "schedule_id" uuid NOT NULL REFERENCES "schedules"("id") ON DELETE CASCADE,
  "employee_id" uuid NOT NULL REFERENCES "employees"("id") ON DELETE RESTRICT,
  "template_id" uuid REFERENCES "shift_templates"("id") ON DELETE SET NULL,
  "shift_date" date NOT NULL,
  "start_time" time NOT NULL,
  "end_time" time NOT NULL,
  "break_minutes" integer DEFAULT 0 NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "shifts_time_distinct_chk" CHECK ("start_time" <> "end_time"),
  CONSTRAINT "shifts_break_range_chk" CHECK ("break_minutes" >= 0 AND "break_minutes" < 1440)
);

CREATE UNIQUE INDEX "shifts_schedule_employee_date_uidx"
  ON "shifts" ("schedule_id", "employee_id", "shift_date");
CREATE INDEX "shifts_schedule_date_idx" ON "shifts" ("schedule_id", "shift_date");
CREATE INDEX "shifts_employee_id_idx" ON "shifts" ("employee_id");
CREATE INDEX "shifts_template_id_idx" ON "shifts" ("template_id");

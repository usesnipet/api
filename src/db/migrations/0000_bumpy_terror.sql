CREATE TYPE "public"."indexed_item_status" AS ENUM('discovered', 'queued', 'processing', 'processed', 'failed', 'stale', 'skipped', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."memory_scope_type" AS ENUM('global', 'session', 'custom');--> statement-breakpoint
CREATE TYPE "public"."pipeline_run_status" AS ENUM('pending', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."pipeline_step_run_status" AS ENUM('pending', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "api_key" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"key_hash" varchar(64) NOT NULL,
	"key_prefix" varchar(32) NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_key_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "indexed_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"knowledge_index_id" uuid NOT NULL,
	"knowledge_source_item_id" uuid NOT NULL,
	"status" "indexed_item_status" NOT NULL,
	"error" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_index" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"provider" varchar(255) NOT NULL,
	"llm_connection_id" uuid,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"provider" varchar(255) NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "llm_connection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"vendor" varchar(255) NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope_type" "memory_scope_type" NOT NULL,
	"provider" varchar(255) NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"definition" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipeline_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pipeline_id" uuid NOT NULL,
	"status" "pipeline_run_status" NOT NULL,
	"input" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"output" jsonb,
	"error" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pipeline_step_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pipeline_run_id" uuid NOT NULL,
	"step_index" integer NOT NULL,
	"status" "pipeline_step_run_status" NOT NULL,
	"input" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"output" jsonb,
	"error" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "source_index" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"knowledge_source_id" uuid NOT NULL,
	"knowledge_index_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_index_knowledge_source_id_knowledge_index_id_unique" UNIQUE("knowledge_source_id","knowledge_index_id")
);
--> statement-breakpoint
CREATE TABLE "source_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"knowledge_source_id" uuid NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"hash" varchar(255) NOT NULL,
	"size" bigint NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "indexed_item" ADD CONSTRAINT "indexed_item_knowledge_index_id_knowledge_index_id_fk" FOREIGN KEY ("knowledge_index_id") REFERENCES "public"."knowledge_index"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indexed_item" ADD CONSTRAINT "indexed_item_knowledge_source_item_id_source_item_id_fk" FOREIGN KEY ("knowledge_source_item_id") REFERENCES "public"."source_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_index" ADD CONSTRAINT "knowledge_index_llm_connection_id_llm_connection_id_fk" FOREIGN KEY ("llm_connection_id") REFERENCES "public"."llm_connection"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_run" ADD CONSTRAINT "pipeline_run_pipeline_id_pipeline_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipeline"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipeline_step_run" ADD CONSTRAINT "pipeline_step_run_pipeline_run_id_pipeline_run_id_fk" FOREIGN KEY ("pipeline_run_id") REFERENCES "public"."pipeline_run"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_index" ADD CONSTRAINT "source_index_knowledge_source_id_knowledge_source_id_fk" FOREIGN KEY ("knowledge_source_id") REFERENCES "public"."knowledge_source"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_index" ADD CONSTRAINT "source_index_knowledge_index_id_knowledge_index_id_fk" FOREIGN KEY ("knowledge_index_id") REFERENCES "public"."knowledge_index"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_item" ADD CONSTRAINT "source_item_knowledge_source_id_knowledge_source_id_fk" FOREIGN KEY ("knowledge_source_id") REFERENCES "public"."knowledge_source"("id") ON DELETE cascade ON UPDATE no action;
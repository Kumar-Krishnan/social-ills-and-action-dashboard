CREATE TABLE `evidence` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_id` integer NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`url` text,
	`publisher` text,
	`date_published` text,
	`snippet` text,
	`verified` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `issue_geographies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_id` integer NOT NULL,
	`scope` text NOT NULL,
	`region` text,
	`country` text,
	`notes` text,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `issue_relationships` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_issue_id` integer NOT NULL,
	`target_issue_id` integer NOT NULL,
	`relationship_type` text NOT NULL,
	`strength` real,
	`direction` text DEFAULT 'one_way' NOT NULL,
	`evidence` text,
	`source` text DEFAULT 'seed' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`source_issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `issue_status_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_id` integer NOT NULL,
	`field` text NOT NULL,
	`old_value` text,
	`new_value` text NOT NULL,
	`reason` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `legislation` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`direction` text NOT NULL,
	`jurisdiction` text,
	`year` integer,
	`era` text DEFAULT 'historical' NOT NULL,
	`status` text DEFAULT 'passed' NOT NULL,
	`url` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ranking_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_id` integer NOT NULL,
	`severity` real,
	`urgency` real,
	`tractability` real,
	`population_affected` real,
	`reversibility` real,
	`visibility` real,
	`institutional_capture` real,
	`composite_score` real,
	`vote_count` integer,
	`source` text NOT NULL,
	`snapshot_date` text NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `actor_issue_links` ADD `influence` real;--> statement-breakpoint
ALTER TABLE `actor_issue_links` ADD `mechanism` text;--> statement-breakpoint
ALTER TABLE `actor_issue_links` ADD `source` text DEFAULT 'seed' NOT NULL;--> statement-breakpoint
ALTER TABLE `actors` ADD `country` text;--> statement-breakpoint
ALTER TABLE `actors` ADD `sector` text;--> statement-breakpoint
ALTER TABLE `rankings` ADD `reversibility` real;--> statement-breakpoint
ALTER TABLE `rankings` ADD `visibility` real;--> statement-breakpoint
ALTER TABLE `rankings` ADD `institutional_capture` real;--> statement-breakpoint
ALTER TABLE `tags` ADD `parent_id` integer;--> statement-breakpoint
ALTER TABLE `tags` ADD `description` text;
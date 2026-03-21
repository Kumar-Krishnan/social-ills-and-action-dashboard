PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_rankings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_id` integer NOT NULL,
	`severity` real,
	`urgency` real,
	`tractability` real,
	`population_affected` real,
	`composite_score` real,
	`source` text DEFAULT 'seed' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_rankings`("id", "issue_id", "severity", "urgency", "tractability", "population_affected", "composite_score", "source", "created_at") SELECT "id", "issue_id", "severity", "urgency", "tractability", "population_affected", "composite_score", "source", "created_at" FROM `rankings`;--> statement-breakpoint
DROP TABLE `rankings`;--> statement-breakpoint
ALTER TABLE `__new_rankings` RENAME TO `rankings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
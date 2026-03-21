CREATE TABLE `reform_in_other_systems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`issue_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`country` text NOT NULL,
	`outcome` text,
	`year` integer,
	`url` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE cascade
);

ALTER TABLE `negative_legislation` ADD `era` text DEFAULT 'historical' NOT NULL;--> statement-breakpoint
ALTER TABLE `negative_legislation` ADD `status` text DEFAULT 'passed' NOT NULL;--> statement-breakpoint
ALTER TABLE `positive_legislation` ADD `era` text DEFAULT 'historical' NOT NULL;--> statement-breakpoint
ALTER TABLE `positive_legislation` ADD `status` text DEFAULT 'passed' NOT NULL;
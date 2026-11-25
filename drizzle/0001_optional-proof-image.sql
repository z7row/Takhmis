PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_proofs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`habit_id` text NOT NULL,
	`day` text NOT NULL,
	`image_url` text,
	`caption` text,
	`points` integer DEFAULT 0 NOT NULL,
	`full_day` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_proofs`("id", "user_id", "habit_id", "day", "image_url", "caption", "points", "full_day", "created_at") SELECT "id", "user_id", "habit_id", "day", "image_url", "caption", "points", "full_day", "created_at" FROM `proofs`;--> statement-breakpoint
DROP TABLE `proofs`;--> statement-breakpoint
ALTER TABLE `__new_proofs` RENAME TO `proofs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `proofs_user_habit_day_idx` ON `proofs` (`user_id`,`habit_id`,`day`);--> statement-breakpoint
CREATE INDEX `proofs_day_idx` ON `proofs` (`day`);--> statement-breakpoint
CREATE INDEX `proofs_user_day_idx` ON `proofs` (`user_id`,`day`);
CREATE TABLE `processed_webhook_events` (
	`event_id` text PRIMARY KEY NOT NULL,
	`processed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text DEFAULT 'stripe' NOT NULL,
	`customer_id` text NOT NULL,
	`subscription_id` text,
	`status` text DEFAULT 'none' NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`price_id` text,
	`current_period_end` integer,
	`cancel_at_period_end` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscription_user_id_unique` ON `subscription` (`user_id`);
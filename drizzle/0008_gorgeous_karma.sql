CREATE TABLE `sponsorship` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'usd' NOT NULL,
	`mode` text NOT NULL,
	`stripe_session_id` text NOT NULL,
	`stripe_subscription_id` text,
	`status` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sponsorship_stripe_session_id_unique` ON `sponsorship` (`stripe_session_id`);
CREATE TABLE `rateLimit` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text,
	`count` integer,
	`last_request` integer
);
--> statement-breakpoint
CREATE INDEX `rateLimit_key_idx` ON `rateLimit` (`key`);
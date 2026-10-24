ALTER TABLE `processed_webhook_events` ADD `status` text DEFAULT 'done' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscription` ADD `last_event_at` integer;--> statement-breakpoint
CREATE INDEX `subscription_customer_id_idx` ON `subscription` (`customer_id`);--> statement-breakpoint
CREATE INDEX `sponsorship_subscription_id_idx` ON `sponsorship` (`stripe_subscription_id`);--> statement-breakpoint
CREATE INDEX `sponsorship_payment_intent_id_idx` ON `sponsorship` (`stripe_payment_intent_id`);
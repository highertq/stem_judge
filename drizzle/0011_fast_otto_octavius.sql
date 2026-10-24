ALTER TABLE `sponsorship` ADD `stripe_payment_intent_id` text;--> statement-breakpoint
ALTER TABLE `sponsorship` ADD `hidden` integer DEFAULT false NOT NULL;
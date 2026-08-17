ALTER TABLE `listings` ADD `owner_email` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `listings` ADD `status` text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
ALTER TABLE `listings` ADD `images` text DEFAULT '[]' NOT NULL;

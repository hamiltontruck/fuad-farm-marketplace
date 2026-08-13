CREATE TABLE `listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`category_label` text NOT NULL,
	`transaction` text NOT NULL,
	`price` real NOT NULL,
	`price_suffix` text DEFAULT 'total' NOT NULL,
	`location` text NOT NULL,
	`seller` text NOT NULL,
	`role` text NOT NULL,
	`condition` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`accent` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`region` text NOT NULL,
	`business_name` text DEFAULT '' NOT NULL,
	`specialty` text DEFAULT '' NOT NULL,
	`experience` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message_id` text NOT NULL,
	`topic` text NOT NULL,
	`message` text NOT NULL,
	`title` text,
	`priority` integer DEFAULT 3 NOT NULL,
	`tags` text,
	`click` text,
	`icon` text,
	`actions` text,
	`event` text DEFAULT 'message' NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `messages_message_id_unique` ON `messages` (`message_id`);
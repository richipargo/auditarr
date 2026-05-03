CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`topic` text NOT NULL,
	`message` text NOT NULL,
	`title` text,
	`priority` integer DEFAULT 3 NOT NULL,
	`tags` text,
	`click` text,
	`icon` text,
	`actions` text,
	`metadata` text,
	`event` text DEFAULT 'message' NOT NULL,
	`createdAt` integer NOT NULL
);

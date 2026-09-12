CREATE INDEX `messages_topic_idx` ON `messages` (`topic`);--> statement-breakpoint
CREATE INDEX `messages_created_at_idx` ON `messages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `messages_priority_idx` ON `messages` (`priority`);
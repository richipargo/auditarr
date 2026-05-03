import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  topic: text('topic').notNull(),
  message: text('message').notNull(),
  title: text('title'),
  priority: integer('priority').default(3).notNull(),
  tags: text('tags'),
  click: text('click'),
  icon: text('icon'),
  actions: text('actions'),
  metadata: text('metadata'),
  event: text('event').default('message').notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
});

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

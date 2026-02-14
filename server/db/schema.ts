import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  messageId: text('message_id').notNull().unique(),
  topic: text('topic').notNull(),
  message: text('message').notNull(),
  title: text('title'),
  priority: integer('priority').default(3).notNull(),
  tags: text('tags'), // JSON string
  click: text('click'),
  icon: text('icon'),
  actions: text('actions'), // JSON string
  event: text('event').default('message').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull()
})

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

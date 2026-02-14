import { db } from '../db'
import { messages } from '../db/schema'
import { eq, desc, and, or, like, gte, lte } from 'drizzle-orm'

// Message metadata interface matching ntfy.sh format
export interface MessageMetadata {
  title?: string
  priority?: number
  tags?: string[]
  click?: string
  icon?: string
  actions?: any[]
}

// Generate unique message ID
function generateMessageId(): string {
  return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 8)
}

// Save a message to the database
export async function saveMessage(
  topic: string,
  message: string,
  metadata: MessageMetadata = {}
): Promise<any> {
  const messageId = generateMessageId()
  const time = new Date().toISOString()

  // Serialize arrays/objects to JSON strings for storage
  const tagsStr = metadata.tags ? JSON.stringify(metadata.tags) : null
  const actionsStr = metadata.actions ? JSON.stringify(metadata.actions) : null

  const [inserted] = await db.insert(messages).values({
    messageId,
    topic,
    message,
    title: metadata.title || null,
    priority: metadata.priority || 3,
    tags: tagsStr,
    click: metadata.click || null,
    icon: metadata.icon || null,
    actions: actionsStr,
    event: 'message',
    createdAt: time
  }).returning()

  console.log(`✅ Message saved to database with ID: ${inserted.id}`)

  return {
    id: inserted.messageId,
    time: inserted.createdAt,
    topic: inserted.topic,
    message: inserted.message,
    title: inserted.title || undefined,
    priority: inserted.priority,
    tags: metadata.tags,
    click: inserted.click || undefined,
    icon: inserted.icon || undefined,
    actions: metadata.actions,
    event: inserted.event
  }
}

// Parse message from database row
function parseMessage(row: any) {
  return {
    id: row.messageId,
    time: row.createdAt,
    topic: row.topic,
    message: row.message,
    title: row.title || undefined,
    priority: row.priority || 3,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    click: row.click || undefined,
    icon: row.icon || undefined,
    actions: row.actions ? JSON.parse(row.actions) : undefined,
    event: row.event
  }
}

// Get messages for a specific topic
export async function getMessagesByTopic(topic: string): Promise<any[]> {
  const results = await db
    .select()
    .from(messages)
    .where(eq(messages.topic, topic))
    .orderBy(desc(messages.createdAt))
    .limit(100)

  return results.map(parseMessage)
}

// Get all unique topics
export async function getAllTopics(): Promise<string[]> {
  const results = await db
    .selectDistinct({ topic: messages.topic })
    .from(messages)
    .orderBy(messages.topic)

  return results.map(row => row.topic)
}

// Get filtered messages
export interface MessageFilters {
  topic?: string
  search?: string
  startDate?: string
  endDate?: string
}

export async function getFilteredMessages(filters: MessageFilters): Promise<any[]> {
  const conditions = []

  if (filters.topic) {
    conditions.push(eq(messages.topic, filters.topic))
  }

  if (filters.search) {
    // Search in both message content, topic, and title
    const searchPattern = `%${filters.search}%`
    conditions.push(
      or(
        like(messages.message, searchPattern),
        like(messages.topic, searchPattern),
        like(messages.title, searchPattern)
      )
    )
  }

  if (filters.startDate) {
    conditions.push(gte(messages.createdAt, filters.startDate))
  }

  if (filters.endDate) {
    conditions.push(lte(messages.createdAt, filters.endDate))
  }

  const query = db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt))
    .limit(100)

  const results = conditions.length > 0
    ? await query.where(and(...conditions))
    : await query

  return results.map(parseMessage)
}

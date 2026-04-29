import { db } from '../db'
import { messages, type Message } from '../db/schema'
import { eq, desc, and, or, like, gte, lte } from 'drizzle-orm'
import {
  type MessageMetadata,
  type MessageResponse,
  type MessageFilters,
  type RichMetadata,
  messageResponseSchema
} from '../schemas/message'

// Re-export types for convenience
export type { MessageMetadata, MessageResponse, MessageFilters, RichMetadata }

// Generate unique message ID
function generateMessageId(): string {
  return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 8)
}

// Normalize topic to lowercase for case-insensitive handling
function normalizeTopic(topic: string): string {
  return topic.toLowerCase()
}

// Save a message to the database
export async function saveMessage(
  topic: string,
  message: string,
  metadata: MessageMetadata = {}
): Promise<MessageResponse> {
  // Dismiss empty messages - log and return without failing
  if (!message || message.trim() === '') {
    console.log(`Dismissing empty message for topic "${topic}"`)
    // Return a dummy response that passes validation
    return messageResponseSchema.parse({
      id: '',
      time: new Date().toISOString(),
      topic: normalizeTopic(topic),
      message: '',
      event: 'message',
      priority: 3
    })
  }

  const messageId = generateMessageId()
  const time = new Date().toISOString()
  const normalizedTopic = normalizeTopic(topic)

  // Serialize arrays/objects to JSON strings for storage
  const tagsStr = metadata.tags ? JSON.stringify(metadata.tags) : null
  const actionsStr = metadata.actions ? JSON.stringify(metadata.actions) : null
  const metadataStr = metadata.metadata ? JSON.stringify(metadata.metadata) : null

  const [inserted] = await db.insert(messages).values({
    messageId,
    topic: normalizedTopic,
    message,
    title: metadata.title || null,
    priority: metadata.priority || 3,
    tags: tagsStr,
    click: metadata.click || null,
    icon: metadata.icon || null,
    actions: actionsStr,
    metadata: metadataStr,
    event: 'message',
    createdAt: time
  }).returning()

  console.log(`Message saved to database with ID: ${inserted.id}`)

  return {
    id: inserted.messageId,
    time: inserted.createdAt,
    topic: normalizedTopic,
    message: inserted.message,
    title: inserted.title || undefined,
    priority: inserted.priority,
    tags: metadata.tags,
    click: inserted.click || undefined,
    icon: inserted.icon || undefined,
    actions: metadata.actions,
    metadata: metadata.metadata,
    event: inserted.event
  }
}

// Parse message from database row
function parseMessage(row: Message): MessageResponse {
  const parsed = {
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
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    event: row.event
  }

  // Validate with Zod schema
  return messageResponseSchema.parse(parsed)
}

// Get messages for a specific topic
export async function getMessagesByTopic(topic: string): Promise<MessageResponse[]> {
  const normalizedTopic = normalizeTopic(topic)
  const results = await db
    .select()
    .from(messages)
    .where(eq(messages.topic, normalizedTopic))
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
export async function getFilteredMessages(filters: MessageFilters): Promise<MessageResponse[]> {
  const conditions = []

  if (filters.topic) {
    const normalizedTopic = normalizeTopic(filters.topic)
    conditions.push(eq(messages.topic, normalizedTopic))
  }

  if (filters.search) {
    // Search in both message content, topic, and title (case-insensitive for topic)
    const searchPattern = `%${filters.search}%`
    conditions.push(
      or(
        like(messages.message, searchPattern),
        like(messages.topic, `%${filters.search.toLowerCase()}%`),
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

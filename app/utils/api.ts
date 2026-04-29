import {
  messageResponseSchema,
  messagesArraySchema,
  topicsArraySchema,
  type MessageResponse,
  type MessageFilters,
  type RichMetadata
} from '../../server/schemas/message'

export type { RichMetadata }

/**
 * Fetch all topics with type validation
 */
export async function fetchTopics(): Promise<string[]> {
  const response = await $fetch('/api/topics')
  return topicsArraySchema.parse(response)
}

/**
 * Fetch messages for a specific topic with type validation
 */
export async function fetchMessagesByTopic(topic: string): Promise<MessageResponse[]> {
  const response = await $fetch(`/api/${topic}`)
  return messagesArraySchema.parse(response)
}

/**
 * Fetch filtered messages with type validation
 */
export async function fetchMessages(filters: MessageFilters = {}): Promise<MessageResponse[]> {
  const query: Record<string, string> = {}

  if (filters.topic) query.topic = filters.topic
  if (filters.search) query.search = filters.search
  if (filters.startDate) query.startDate = filters.startDate
  if (filters.endDate) query.endDate = filters.endDate

  const response = await $fetch('/api/messages', { query })
  return messagesArraySchema.parse(response)
}

/**
 * Post a message to a topic with type validation
 */
export async function postMessage(
  topic: string,
  message: string,
  headers: Record<string, string> = {}
): Promise<MessageResponse> {
  const response = await $fetch<MessageResponse>(`/api/${topic}`, {
    method: 'POST' as const,
    body: message,
    headers
  })
  return messageResponseSchema.parse(response)
}

// Re-export types for convenience
export type { MessageResponse, MessageFilters }

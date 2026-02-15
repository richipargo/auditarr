import { z } from 'zod'

// ntfy.sh action schema
export const actionSchema = z.object({
  action: z.string(),
  label: z.string(),
  url: z.string().url().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).optional(),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  clear: z.boolean().optional()
})

// Message metadata schema (for incoming messages)
export const messageMetadataSchema = z.object({
  title: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
  click: z.string().url().optional(),
  icon: z.string().url().optional(),
  actions: z.array(actionSchema).optional()
})

// Message response schema (what the API returns)
export const messageResponseSchema = z.object({
  id: z.string(),
  time: z.string(), // ISO 8601 datetime string
  topic: z.string(),
  message: z.string(),
  title: z.string().optional(),
  priority: z.number().int().min(1).max(5),
  tags: z.array(z.string()).optional(),
  click: z.string().url().optional(),
  icon: z.string().url().optional(),
  actions: z.array(actionSchema).optional(),
  event: z.string()
})

// Array of messages
export const messagesArraySchema = z.array(messageResponseSchema)

// Topics array
export const topicsArraySchema = z.array(z.string())

// Message filters schema (query parameters)
export const messageFiltersSchema = z.object({
  topic: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

// Priority name mapping
export const priorityNameSchema = z.enum(['min', 'low', 'default', 'high', 'urgent', 'max'])

// Export types inferred from schemas
export type Action = z.infer<typeof actionSchema>
export type MessageMetadata = z.infer<typeof messageMetadataSchema>
export type MessageResponse = z.infer<typeof messageResponseSchema>
export type MessageFilters = z.infer<typeof messageFiltersSchema>
export type PriorityName = z.infer<typeof priorityNameSchema>

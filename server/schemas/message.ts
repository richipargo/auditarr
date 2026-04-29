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

// Rich metadata schema for *arr applications and custom data
// Supports Radarr, Sonarr, and other media server notifications
export const richMetadataSchema = z.object({
  // Media metadata
  quality: z.string().optional(),
  size: z.string().optional(),
  releaseGroup: z.string().optional(),
  indexer: z.string().optional(),
  downloadClient: z.string().optional(),
  source: z.string().optional(),
  customFormat: z.string().optional(),
  customFormatScore: z.number().optional(),
  
  // Episode/Movie metadata
  seriesName: z.string().optional(),
  episodeTitle: z.string().optional(),
  episodeNumber: z.string().optional(),
  seasonNumber: z.string().optional(),
  movieTitle: z.string().optional(),
  movieYear: z.string().optional(),
  
  // File metadata
  fileName: z.string().optional(),
  filePath: z.string().optional(),
  
  // General ntfy.sh metadata
  attach: z.string().url().optional(),
  filename: z.string().optional(),
  line: z.string().optional(),
  timestamp: z.string().optional()
})

// Message metadata schema (for incoming messages)
export const messageMetadataSchema = z.object({
  title: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
  click: z.string().url().optional(),
  icon: z.string().url().optional(),
  actions: z.array(actionSchema).optional(),
  // Rich metadata for *arr apps and custom data
  metadata: richMetadataSchema.optional()
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
  event: z.string(),
  // Rich metadata for *arr applications
  metadata: richMetadataSchema.optional()
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
export type RichMetadata = z.infer<typeof richMetadataSchema>
export type MessageMetadata = z.infer<typeof messageMetadataSchema>
export type MessageResponse = z.infer<typeof messageResponseSchema>
export type MessageFilters = z.infer<typeof messageFiltersSchema>
export type PriorityName = z.infer<typeof priorityNameSchema>

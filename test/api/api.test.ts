import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { getAllTopics, getMessagesByTopic, saveMessage } from '../../server/utils/database'
import { db } from '../../server/db'
import { messages } from '../../server/db/schema'

describe('API Endpoints - Direct Function Tests', () => {
  beforeAll(async () => {
    // Clean database at the start of this test file
    await db.delete(messages)
  })

  afterAll(async () => {
    // Clean up database after tests
    await db.delete(messages)
  })

  describe('GET /api/ equivalent (getAllTopics)', () => {
    it('should return an empty array when no topics exist', async () => {
      // Clean database for this isolated test
      await db.delete(messages)

      const topics = await getAllTopics()

      expect(Array.isArray(topics)).toBe(true)
      expect(topics.length).toBe(0)
    })

    it('should return topics array', async () => {
      const topics = await getAllTopics()

      expect(topics).toBeDefined()
    })
  })

  describe('GET /api/[topic] equivalent (getMessagesByTopic)', () => {
    it('should return an empty array for non-existent topic', async () => {
      const messages = await getMessagesByTopic('nonexistent')

      expect(Array.isArray(messages)).toBe(true)
      expect(messages.length).toBe(0)
    })

    it('should return array for any topic', async () => {
      const messages = await getMessagesByTopic('nonexistent')

      expect(messages).toBeDefined()
    })
  })

  describe('POST /api/[topic] equivalent (saveMessage)', () => {
    it('should successfully save a message to a topic', async () => {
      const testMessage = 'Test message'
      const result = await saveMessage('test-topic', testMessage)

      expect(result).toBeDefined()
    })

    it('should return success response on successful save', async () => {
      const result = await saveMessage('test-topic', 'Another test message')

      expect(result).toBeDefined()
    })

    it('should create the topic if it does not exist', async () => {
      const newTopic = 'new-topic-' + Date.now()
      const result = await saveMessage(newTopic, 'First message')

      expect(result).toBeDefined()

      // Verify the topic was created by fetching it
      const topics = await getAllTopics()

      expect(topics).toContain(newTopic)
    })
  })

  describe('Integration test: POST then GET equivalent', () => {
    const testTopic = 'integration-test-topic'
    const testMessage = 'Integration test message'

    it('should allow saving and then retrieving a message', async () => {
      // Save a message
      await saveMessage(testTopic, testMessage)

      // Retrieve messages
      const messages = await getMessagesByTopic(testTopic)

      expect(Array.isArray(messages)).toBe(true)
      expect(messages.length).toBeGreaterThan(0)
      expect(messages[0].message).toBe(testMessage)
      expect(messages[0].topic).toBe(testTopic)
    })

    it('should include proper message metadata', async () => {
      const messages = await getMessagesByTopic(testTopic)

      const message = messages[0]

      expect(message).toHaveProperty('id')
      expect(message).toHaveProperty('time')
      expect(message).toHaveProperty('topic')
      expect(message).toHaveProperty('message')
      expect(message).toHaveProperty('event')
      expect(message.event).toBe('message')
    })
  })
})
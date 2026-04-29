import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { saveMessage, getMessagesByTopic, getAllTopics, getFilteredMessages } from '../../server/utils/database'
import { db } from '../../server/db'
import { messages } from '../../server/db/schema'

describe('Database Utilities', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await db.delete(messages)
  })

  afterAll(async () => {
    // Clean up database after tests
    await db.delete(messages)
  })

  describe('saveMessage', () => {
    it('should save a message to the database', async () => {
      const topic = 'test-topic'
      const message = 'Test message content'

      const result = await saveMessage(topic, message)

      expect(result).toBeDefined()
      expect(result.topic).toBe(topic)
      expect(result.message).toBe(message)
      expect(result.event).toBe('message')
      expect(result.id).toBeDefined()
      expect(result.time).toBeDefined()
    })

    it('should save message with metadata', async () => {
      const topic = 'test-topic'
      const message = 'Test message with metadata'
      const metadata = {
        title: 'Test Title',
        priority: 5,
        tags: ['test', 'important'],
        click: 'https://example.com',
        icon: 'https://example.com/icon.png'
      }

      const result = await saveMessage(topic, message, metadata)

      expect(result).toBeDefined()
      expect(result.topic).toBe(topic)
      expect(result.message).toBe(message)
      expect(result.title).toBe(metadata.title)
      expect(result.priority).toBe(metadata.priority)
      expect(result.tags).toEqual(metadata.tags)
      expect(result.click).toBe(metadata.click)
      expect(result.icon).toBe(metadata.icon)
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

  describe('getMessagesByTopic', () => {
    const testTopic = 'get-messages-test'
    const testMessage1 = 'First test message'
    const testMessage2 = 'Second test message'

    beforeAll(async () => {
      // Add test messages
      await saveMessage(testTopic, testMessage1)
      await saveMessage(testTopic, testMessage2)
    })

    it('should return messages for a specific topic', async () => {
      const retrievedMessages = await getMessagesByTopic(testTopic)

      expect(Array.isArray(retrievedMessages)).toBe(true)
      expect(retrievedMessages.length).toBeGreaterThanOrEqual(2)

      // Check that our test messages are in the results
      const messageContents = retrievedMessages.map(m => m.message)
      expect(messageContents).toContain(testMessage1)
      expect(messageContents).toContain(testMessage2)

      // Check message structure
      retrievedMessages.forEach(msg => {
        expect(msg).toHaveProperty('id')
        expect(msg).toHaveProperty('time')
        expect(msg).toHaveProperty('topic')
        expect(msg).toHaveProperty('message')
        expect(msg).toHaveProperty('event')
      })
    })

    it('should return empty array for non-existent topic', async () => {
      const retrievedMessages = await getMessagesByTopic('non-existent-topic')

      expect(Array.isArray(retrievedMessages)).toBe(true)
      expect(retrievedMessages.length).toBe(0)
    })

    it('should return messages in reverse chronological order', async () => {
      const retrievedMessages = await getMessagesByTopic(testTopic)

      // Check that messages are ordered by time (newest first)
      for (let i = 0; i < retrievedMessages.length - 1; i++) {
        expect(new Date(retrievedMessages[i].time) >= new Date(retrievedMessages[i + 1].time)).toBe(true)
      }
    })
  })

  describe('getAllTopics', () => {
    const topic1 = 'topic-one'
    const topic2 = 'topic-two'

    beforeAll(async () => {
      // Add messages to different topics
      await saveMessage(topic1, 'Message for topic 1')
      await saveMessage(topic2, 'Message for topic 2')
    })

    it('should return all unique topics', async () => {
      const topics = await getAllTopics()

      expect(Array.isArray(topics)).toBe(true)
      expect(topics.length).toBeGreaterThanOrEqual(2)
      expect(topics).toContain(topic1)
      expect(topics).toContain(topic2)
    })

    it('should return topics in alphabetical order', async () => {
      const topics = await getAllTopics()

      // Check that topics are sorted alphabetically
      for (let i = 0; i < topics.length - 1; i++) {
        expect(topics[i] <= topics[i + 1]).toBe(true)
      }
    })

    it('should return empty array when no topics exist', async () => {
      // Clean database first
      await db.delete(messages)

      const topics = await getAllTopics()

      expect(Array.isArray(topics)).toBe(true)
      expect(topics.length).toBe(0)
    })
  })

  describe('getFilteredMessages', () => {
    const filterTopic = 'filter-test-topic'

    beforeAll(async () => {
      // Add test messages with different timestamps
      await saveMessage(filterTopic, 'Recent message')
      await saveMessage(filterTopic, 'Old message')
    })

    it('should return messages filtered by topic', async () => {
      const result = await getFilteredMessages({ topic: filterTopic })

      expect(Array.isArray(result)).toBe(true)
      result.forEach(msg => {
        expect(msg.topic).toBe(filterTopic)
      })
    })

    it('should return messages filtered by search', async () => {
      await saveMessage(filterTopic, 'Message with search keyword')

      const result = await getFilteredMessages({ topic: filterTopic, search: 'keyword' })

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].message).toContain('keyword')
    })

    it('should return messages filtered by date range', async () => {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const endDate = new Date().toISOString()

      const result = await getFilteredMessages({ topic: filterTopic, startDate, endDate })

      expect(Array.isArray(result)).toBe(true)
      result.forEach(msg => {
        expect(new Date(msg.time) >= new Date(startDate)).toBe(true)
        expect(new Date(msg.time) <= new Date(endDate)).toBe(true)
      })
    })
  })

  describe('Message Structure', () => {
    it('should include all required fields in saved messages', async () => {
      const topic = 'structure-test'
      const message = 'Structure test message'

      const savedMessage = await saveMessage(topic, message)

      expect(savedMessage).toHaveProperty('id')
      expect(savedMessage).toHaveProperty('time')
      expect(savedMessage).toHaveProperty('topic')
      expect(savedMessage).toHaveProperty('message')
      expect(savedMessage).toHaveProperty('event')
      expect(savedMessage.topic).toBe(topic)
      expect(savedMessage.message).toBe(message)
      expect(savedMessage.event).toBe('message')
    })
  })
})

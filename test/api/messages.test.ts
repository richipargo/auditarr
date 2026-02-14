import { describe, expect, it, beforeAll, beforeEach, afterAll } from 'vitest'
import { saveMessage, getFilteredMessages } from '../../server/utils/database'
import { db } from '../../server/db'
import { messages } from '../../server/db/schema'

describe('Messages API Endpoint', () => {
  // Clean database at the start of this test file
  beforeAll(async () => {
    await db.delete(messages)
  })

  afterAll(async () => {
    // Clean up database after tests
    await db.delete(messages)
  })

  describe('Basic functionality', () => {
    beforeEach(async () => {
      // Clean database before each test in this group
      await db.delete(messages)
    })

    it('should return empty array when no messages exist', async () => {
      const result = await getFilteredMessages({})
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })

    it('should return messages in reverse chronological order', async () => {
      // Ensure clean database before this test
      await db.delete(messages)

      // Add some test messages directly to avoid timing issues
      await db.insert(messages).values([
        {
          messageId: 'test-msg-1',
          topic: 'topic1',
          message: 'First message',
          event: 'message',
          createdAt: '2023-01-01 10:00:00'
        },
        {
          messageId: 'test-msg-2',
          topic: 'topic2',
          message: 'Second message',
          event: 'message',
          createdAt: '2023-01-01 10:00:01'
        }
      ])

      const result = await getFilteredMessages({})
      expect(result.length).toBe(2)

      // Check that messages are ordered by time (newest first)
      expect(new Date(result[0].time) >= new Date(result[1].time)).toBe(true)
      expect(result[0].message).toBe('Second message') // Newest should be first
      expect(result[1].message).toBe('First message') // Oldest should be last
    })
  })

  describe('Topic filtering', () => {
    beforeAll(async () => {
      // Add messages for different topics
      await saveMessage('test-topic-1', 'Message for topic 1')
      await saveMessage('test-topic-2', 'Message for topic 2')
      await saveMessage('test-topic-1', 'Another message for topic 1')
    })

    it('should filter messages by topic', async () => {
      const result = await getFilteredMessages({ topic: 'test-topic-1' })

      expect(result.length).toBeGreaterThanOrEqual(2)
      result.forEach(message => {
        expect(message.topic).toBe('test-topic-1')
      })
    })

    it('should return all messages when no topic filter is applied', async () => {
      const result = await getFilteredMessages({})
      expect(result.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Search filtering', () => {
    beforeAll(async () => {
      // Add messages for search testing
      await saveMessage('search-test', 'Hello world')
      await saveMessage('another-topic', 'Test message with hello')
      await saveMessage('search-test', 'Goodbye world')
    })

    it('should filter messages by search term in message content', async () => {
      const result = await getFilteredMessages({ search: 'hello' })

      expect(result.length).toBeGreaterThanOrEqual(2)
      result.forEach(message => {
        expect(message.message.toLowerCase()).toContain('hello')
      })
    })

    it('should filter messages by search term in topic', async () => {
      const result = await getFilteredMessages({ search: 'search-test' })

      expect(result.length).toBeGreaterThanOrEqual(2)
      result.forEach(message => {
        expect(message.topic).toBe('search-test')
      })
    })

    it('should be case insensitive', async () => {
      const result = await getFilteredMessages({ search: 'HELLO' })
      expect(result.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Date filtering', () => {
    let testDate1: string
    let testDate2: string

    beforeAll(async () => {
      // Clean database and add messages with specific dates
      await db.delete(messages)
      testDate1 = '2023-01-01 10:00:00'
      testDate2 = '2023-01-02 10:00:00'

      await db.insert(messages).values([
        {
          messageId: 'test-1',
          topic: 'date-test',
          message: 'Message from Jan 1',
          event: 'message',
          createdAt: testDate1
        },
        {
          messageId: 'test-2',
          topic: 'date-test',
          message: 'Message from Jan 2',
          event: 'message',
          createdAt: testDate2
        }
      ])
    })

    it('should filter messages by start date', async () => {
      const result = await getFilteredMessages({ startDate: '2023-01-02' })

      expect(result.length).toBe(1)
      expect(result[0].message).toBe('Message from Jan 2')
    })

    it('should filter messages by end date', async () => {
      const result = await getFilteredMessages({ endDate: '2023-01-01 23:59:59' })

      expect(result.length).toBe(1)
      expect(result[0].message).toBe('Message from Jan 1')
    })

    it('should filter messages by date range', async () => {
      const result = await getFilteredMessages({
        startDate: '2023-01-01',
        endDate: '2023-01-02 23:59:59'
      })

      expect(result.length).toBe(2)
    })
  })

  describe('Combined filtering', () => {
    it('should apply multiple filters together', async () => {
      // Add a message that matches multiple criteria
      await saveMessage('combined-test', 'This is a test message for combined filters')

      const result = await getFilteredMessages({
        topic: 'combined-test',
        search: 'test'
      })

      expect(result.length).toBe(1)
      expect(result[0].topic).toBe('combined-test')
      expect(result[0].message).toContain('test')
    })
  })
})
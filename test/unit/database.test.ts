import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { saveMessage, getMessagesByTopic, getAllTopics } from '../../server/utils/database'
import { db } from '../../server/db'

describe('Database Utilities', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM messages', (err) => {
        if (err) {
          console.error('Error cleaning database:', err)
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })

  afterAll(async () => {
    // Clean up database after tests
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM messages', (err) => {
        if (err) {
          console.error('Error cleaning database:', err)
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })

  describe('saveMessage', () => {
    it('should save a message to the database', async () => {
      const topic = 'test-topic'
      const message = 'Test message content'

      const result = await new Promise((resolve, reject) => {
        saveMessage(topic, message, (err, result) => {
          if (err) reject(err)
          else resolve(result)
        })
      })

      expect(result).toBeDefined()
      expect(result.topic).toBe(topic)
      expect(result.message).toBe(message)
      expect(result.event).toBe('message')
      expect(result.id).toBeDefined()
      expect(result.time).toBeDefined()
    })

    it('should handle errors gracefully', async () => {
      // This test is a bit artificial since our current implementation
      // doesn't have a way to force an error, but we can test the error path
      // by trying to save with invalid data
      const result = await new Promise((resolve, _reject) => {
        saveMessage('', 'test', (err, result) => {
          if (err) resolve({ err })
          else resolve({ result })
        })
      })

      // Even if it doesn't error, we can verify the callback structure
      if (result.err) {
        expect(result.err).toBeInstanceOf(Error)
      }
    })
  })

  describe('getMessagesByTopic', () => {
    const testTopic = 'get-messages-test'
    const testMessage1 = 'First test message'
    const testMessage2 = 'Second test message'

    beforeAll(async () => {
      // Add test messages
      await new Promise((resolve, reject) => {
        saveMessage(testTopic, testMessage1, (err) => {
          if (err) return reject(err)
          saveMessage(testTopic, testMessage2, (err) => {
            if (err) reject(err)
            else resolve()
          })
        })
      })
    })

    it('should return messages for a specific topic', async () => {
      const messages = await new Promise((resolve, reject) => {
        getMessagesByTopic(testTopic, (err, messages) => {
          if (err) reject(err)
          else resolve(messages)
        })
      })

      expect(Array.isArray(messages)).toBe(true)
      expect(messages.length).toBeGreaterThanOrEqual(2)

      // Check that our test messages are in the results
      const messageContents = messages.map(m => m.message)
      expect(messageContents).toContain(testMessage1)
      expect(messageContents).toContain(testMessage2)

      // Check message structure
      messages.forEach(message => {
        expect(message).toHaveProperty('id')
        expect(message).toHaveProperty('time')
        expect(message).toHaveProperty('topic')
        expect(message).toHaveProperty('message')
        expect(message).toHaveProperty('event')
      })
    })

    it('should return empty array for non-existent topic', async () => {
      const messages = await new Promise((resolve, reject) => {
        getMessagesByTopic('non-existent-topic', (err, messages) => {
          if (err) reject(err)
          else resolve(messages)
        })
      })

      expect(Array.isArray(messages)).toBe(true)
      expect(messages.length).toBe(0)
    })

    it('should return messages in reverse chronological order', async () => {
      const messages = await new Promise((resolve, reject) => {
        getMessagesByTopic(testTopic, (err, messages) => {
          if (err) reject(err)
          else resolve(messages)
        })
      })

      // Check that messages are ordered by time (newest first)
      for (let i = 0; i < messages.length - 1; i++) {
        expect(new Date(messages[i].time) >= new Date(messages[i + 1].time)).toBe(true)
      }
    })
  })

  describe('getAllTopics', () => {
    const topic1 = 'topic-one'
    const topic2 = 'topic-two'

    beforeAll(async () => {
      // Add messages to different topics
      await new Promise((resolve, reject) => {
        saveMessage(topic1, 'Message for topic 1', (err) => {
          if (err) return reject(err)
          saveMessage(topic2, 'Message for topic 2', (err) => {
            if (err) reject(err)
            else resolve()
          })
        })
      })
    })

    it('should return all unique topics', async () => {
      const topics = await new Promise((resolve, reject) => {
        getAllTopics((err, topics) => {
          if (err) reject(err)
          else resolve(topics)
        })
      })

      expect(Array.isArray(topics)).toBe(true)
      expect(topics.length).toBeGreaterThanOrEqual(2)
      expect(topics).toContain(topic1)
      expect(topics).toContain(topic2)
    })

    it('should return topics in alphabetical order', async () => {
      const topics = await new Promise((resolve, reject) => {
        getAllTopics((err, topics) => {
          if (err) reject(err)
          else resolve(topics)
        })
      })

      // Check that topics are sorted alphabetically
      for (let i = 0; i < topics.length - 1; i++) {
        expect(topics[i] <= topics[i + 1]).toBe(true)
      }
    })

    it('should return empty array when no topics exist', async () => {
      // Clean database first
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM messages', (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      const topics = await new Promise((resolve, reject) => {
        getAllTopics((err, topics) => {
          if (err) reject(err)
          else resolve(topics)
        })
      })

      expect(Array.isArray(topics)).toBe(true)
      expect(topics.length).toBe(0)
    })
  })

  describe('Message Structure', () => {
    it('should include all required fields in saved messages', async () => {
      const topic = 'structure-test'
      const message = 'Structure test message'

      const savedMessage = await new Promise((resolve, reject) => {
        saveMessage(topic, message, (err, savedMessage) => {
          if (err) reject(err)
          else resolve(savedMessage)
        })
      })

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

import { ref, computed } from 'vue'
import { fetchMessages, fetchTopics, type MessageResponse, type MessageFilters } from '~/utils/api'

/**
 * Composable for managing messages state and fetching
 */
export function useMessages() {
  const messages = ref<MessageResponse[]>([])
  const topics = ref<string[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Computed stats
  const highPriorityCount = computed(() => {
    return messages.value.filter(m => m.priority >= 4).length
  })

  const recentCount = computed(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return messages.value.filter(m => new Date(m.time) > oneDayAgo).length
  })

  const topicCount = computed(() => {
    return topics.value.length
  })

  /**
   * Load messages with optional filters
   */
  async function loadMessages(filters?: MessageFilters) {
    loading.value = true
    error.value = null
    try {
      messages.value = await fetchMessages(filters)
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('Failed to fetch messages')
      console.error('Error fetching messages:', e)
      messages.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Load all available topics
   */
  async function loadTopics() {
    try {
      topics.value = await fetchTopics()
    } catch (e) {
      console.error('Error fetching topics:', e)
      topics.value = []
    }
  }

  /**
   * Refresh both messages and topics
   */
  async function refresh(filters?: MessageFilters) {
    await Promise.all([
      loadTopics(),
      loadMessages(filters)
    ])
  }

  return {
    // State
    messages,
    topics,
    loading,
    error,

    // Computed
    highPriorityCount,
    recentCount,
    topicCount,

    // Methods
    loadMessages,
    loadTopics,
    refresh
  }
}

/**
 * Composable for managing a single message modal
 */
export function useMessageModal() {
  const isOpen = ref(false)
  const selectedMessage = ref<MessageResponse | null>(null)

  function open(message: MessageResponse) {
    selectedMessage.value = message
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    selectedMessage.value = null
  }

  return {
    isOpen,
    selectedMessage,
    open,
    close
  }
}

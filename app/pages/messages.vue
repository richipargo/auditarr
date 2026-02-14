<template>
  <UContainer class="py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Message Audit Trail
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Track and monitor all system notifications and events
      </p>
    </div>

    <!-- Filters Card -->
    <UCard class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Filters</h2>
          <UButton
            v-if="hasActiveFilters"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark"
            @click="clearFilters"
          >
            Clear All
          </UButton>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Topic Filter -->
        <UFormField label="Topic" name="topic">
          <USelect
            v-model="filters.topic"
            :items="topicOptions"
            placeholder="All Topics"
          />
        </UFormField>

        <!-- Search Filter -->
        <UFormField label="Search" name="search">
          <UInput
            v-model="filters.search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search messages..."
          />
        </UFormField>

        <!-- Start Date Filter -->
        <UFormField label="Start Date" name="startDate">
          <UInput
            v-model="filters.startDate"
            type="date"
            icon="i-heroicons-calendar"
          />
        </UFormField>

        <!-- End Date Filter -->
        <UFormField label="End Date" name="endDate">
          <UInput
            v-model="filters.endDate"
            type="date"
            icon="i-heroicons-calendar"
          />
        </UFormField>
      </div>
    </UCard>

    <!-- Stats Bar -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-envelope" class="w-8 h-8 text-primary" />
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
            <p class="text-2xl font-bold">{{ messages.length }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-server" class="w-8 h-8 text-blue-500" />
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Topics</p>
            <p class="text-2xl font-bold">{{ availableTopics.length }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-orange-500" />
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
            <p class="text-2xl font-bold">{{ highPriorityCount }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-clock" class="w-8 h-8 text-green-500" />
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Last 24h</p>
            <p class="text-2xl font-bold">{{ recentCount }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- No Messages State -->
    <UCard v-else-if="messages.length === 0">
      <div class="text-center py-12">
        <UIcon name="i-heroicons-inbox" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 class="text-lg font-semibold mb-2">No messages found</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Try adjusting your filters or check back later
        </p>
        <UButton
          v-if="hasActiveFilters"
          @click="clearFilters"
        >
          Clear Filters
        </UButton>
      </div>
    </UCard>

    <!-- Messages Table -->
    <MessageTable
      v-else
      :messages="messages"
      @select="openMessageModal"
    />

    <!-- Message Detail Modal -->
    <MessageModal
      v-if="selectedMessage"
      v-model="isModalOpen"
      :message="selectedMessage"
    />
  </UContainer>
</template>

<script setup lang="ts">
const messages = ref<any[]>([])
const availableTopics = ref<string[]>([])
const loading = ref(false)
const isModalOpen = ref(false)
const selectedMessage = ref<any>(null)

const filters = ref({
  topic: 'all',
  search: '',
  startDate: '',
  endDate: ''
})

// Computed Properties
const topicOptions = computed(() => [
  { label: 'All Topics', value: 'all' },
  ...availableTopics.value.map(topic => ({
    label: topic,
    value: topic
  }))
])

const hasActiveFilters = computed(() => {
  return !!(
    (filters.value.topic && filters.value.topic !== 'all') ||
    filters.value.search ||
    filters.value.startDate ||
    filters.value.endDate
  )
})

const highPriorityCount = computed(() => {
  return messages.value.filter(m => m.priority >= 4).length
})

const recentCount = computed(() => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  return messages.value.filter(m => new Date(m.time) > oneDayAgo).length
})

// Open message modal
const openMessageModal = (message: any) => {
  selectedMessage.value = message
  isModalOpen.value = true
}

// Fetch all topics for the dropdown
const fetchTopics = async () => {
  try {
    const response = await $fetch('/api/topics')
    availableTopics.value = response
  } catch (error) {
    console.error('Error fetching topics:', error)
    availableTopics.value = []
  }
}

// Fetch messages with current filters
const fetchMessages = async () => {
  loading.value = true
  try {
    const query: any = {}
    if (filters.value.topic && filters.value.topic !== 'all') {
      query.topic = filters.value.topic
    }
    if (filters.value.search) query.search = filters.value.search
    if (filters.value.startDate) query.startDate = filters.value.startDate
    if (filters.value.endDate) query.endDate = filters.value.endDate

    const response = await $fetch('/api/messages', { query })
    messages.value = response
  } catch (error) {
    console.error('Error fetching messages:', error)
    messages.value = []
  } finally {
    loading.value = false
  }
}

// Clear all filters
const clearFilters = () => {
  filters.value = {
    topic: 'all',
    search: '',
    startDate: '',
    endDate: ''
  }
}

// Watch for filter changes and refetch messages
watch(filters, () => {
  fetchMessages()
}, { deep: true })

// Initial data load
onMounted(() => {
  fetchTopics()
  fetchMessages()
})
</script>

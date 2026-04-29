<template>
  <UContainer class="py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Message Audit Trail
        </h1>
        <p class="text-lg text-gray-500 dark:text-gray-400 mt-1">
          All notifications in one place
        </p>
      </div>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UFormField label="Topic">
          <USelect
            v-model="filters.topic"
            :items="topicOptions"
            placeholder="All Topics"
          />
        </UFormField>

        <UFormField label="Search">
          <UInput
            v-model="filters.search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search..."
          />
        </UFormField>

        <UFormField label="From">
          <UInput
            v-model="filters.startDate"
            type="date"
            icon="i-heroicons-calendar"
          />
        </UFormField>

        <UFormField label="To">
          <UInput
            v-model="filters.endDate"
            type="date"
            icon="i-heroicons-calendar"
          />
        </UFormField>
      </div>
      
      <div class="flex justify-end mt-4">
        <UButton
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          icon="i-heroicons-x-mark"
          @click="clearFilters"
        >
          Clear
        </UButton>
      </div>
    </UCard>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-semibold">{{ messages.length }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Messages</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-semibold">{{ topics.length }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Topics</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-semibold text-orange-600 dark:text-orange-400">{{ highPriorityCount }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">High Priority</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-2xl font-semibold text-green-600 dark:text-green-400">{{ recentCount }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Recent</p>
        </div>
      </UCard>
    </div>

    <!-- Content -->
    <div class="min-h-[400px]">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
      </div>

      <!-- Empty -->
      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
        <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-gray-400 mb-4" />
        <p class="text-gray-500 dark:text-gray-400">No messages found</p>
        <UButton
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          class="mt-4"
          @click="clearFilters"
        >
          Clear filters
        </UButton>
      </div>

      <!-- Messages -->
      <MessageTable
        v-else
        :messages="messages"
        @select="openMessageModal"
      />
    </div>

    <!-- Modal -->
    <MessageModal
      v-if="selectedMessage"
      v-model="isModalOpen"
      :message="selectedMessage"
    />
  </UContainer>
</template>

<script setup lang="ts">
import type { MessageFilters } from '~/utils/api'

const { messages, topics, loading, highPriorityCount, recentCount, loadMessages, loadTopics } = useMessages()
const { isOpen: isModalOpen, selectedMessage, open: openMessageModal } = useMessageModal()

const filters = ref<MessageFilters & { topic: string }>({
  topic: 'all',
  search: '',
  startDate: '',
  endDate: ''
})

const topicOptions = computed(() => [
  { label: 'All Topics', value: 'all' },
  ...topics.value.map(topic => ({ label: topic, value: topic }))
])

const hasActiveFilters = computed(() => (
  (filters.value.topic && filters.value.topic !== 'all') ||
  filters.value.search ||
  filters.value.startDate ||
  filters.value.endDate
))

const getFilterParams = (): MessageFilters => {
  const params: MessageFilters = {}
  if (filters.value.topic && filters.value.topic !== 'all') params.topic = filters.value.topic
  if (filters.value.search) params.search = filters.value.search
  if (filters.value.startDate) params.startDate = filters.value.startDate
  if (filters.value.endDate) params.endDate = filters.value.endDate
  return params
}

const clearFilters = () => {
  filters.value = { topic: 'all', search: '', startDate: '', endDate: '' }
}

watch(filters, () => loadMessages(getFilterParams()), { deep: true })

onMounted(() => {
  loadTopics()
  loadMessages(getFilterParams())
})
</script>

<template>
  <UContainer class="py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-highlighted tracking-tight">
          Messages
        </h1>
        <p class="text-sm text-muted mt-0.5">
          {{ messages.length }} total across {{ topics.length }} {{ topics.length === 1 ? 'topic' : 'topics' }}
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <UFormField label="Topic" size="sm">
          <USelect
            v-model="filters.topic"
            :items="topicOptions"
            placeholder="All Topics"
          />
        </UFormField>

        <UFormField label="Search" size="sm">
          <UInput
            v-model="filters.search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search messages..."
          />
        </UFormField>

        <UFormField label="From" size="sm">
          <UInput
            v-model="filters.startDate"
            type="date"
            icon="i-heroicons-calendar"
          />
        </UFormField>

        <UFormField label="To" size="sm">
          <UInput
            v-model="filters.endDate"
            type="date"
            icon="i-heroicons-calendar"
          />
        </UFormField>
      </div>

      <div class="flex justify-end mt-2">
        <UButton
          v-if="hasActiveFilters"
          variant="ghost"
          color="neutral"
          size="xs"
          icon="i-heroicons-x-mark"
          @click="clearFilters"
        >
          Clear filters
        </UButton>
      </div>
    </div>

    <!-- Stats — inline, not card grid -->
    <div class="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm">
      <div class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-inbox" class="w-4 h-4 text-dimmed" />
        <span class="font-medium text-default">{{ messages.length }}</span>
        <span class="text-muted">messages</span>
      </div>
      <div class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-rectangle-stack" class="w-4 h-4 text-dimmed" />
        <span class="font-medium text-default">{{ topics.length }}</span>
        <span class="text-muted">topics</span>
      </div>
      <div class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-warning" />
        <span class="font-medium text-default">{{ highPriorityCount }}</span>
        <span class="text-muted">high priority</span>
      </div>
      <div class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-clock" class="w-4 h-4 text-success" />
        <span class="font-medium text-default">{{ recentCount }}</span>
        <span class="text-muted">in last 24h</span>
      </div>
    </div>

    <!-- Content -->
    <div class="min-h-[400px]">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-dimmed" />
      </div>

      <!-- Empty -->
      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
        <UIcon name="i-heroicons-inbox" class="w-10 h-10 text-dimmed mb-3" />
        <p class="text-muted">No messages found</p>
        <UButton
          v-if="hasActiveFilters"
          variant="ghost"
          color="neutral"
          size="sm"
          class="mt-3"
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

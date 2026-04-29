<template>
  <UCard>
    <UTable :data="messages" :columns="columns" @select="(_, row) => $emit('select', row.original)">
      <!-- Priority -->
      <template #priority-cell="{ row }">
        <UBadge
          :color="getPriorityColor(row.original.priority)"
          variant="subtle"
          size="xs"
        >
          {{ getPriorityLabel(row.original.priority) }}
        </UBadge>
      </template>

      <!-- Topic -->
      <template #topic-cell="{ row }">
        <UBadge
          :color="getTopicColor(row.original.topic)"
          variant="soft"
          size="xs"
        >
          {{ row.original.topic }}
        </UBadge>
      </template>

      <!-- Message -->
      <template #message-cell="{ row }">
        <div class="flex items-start gap-3">
          <UIcon
            :name="getTopicIcon(row.original.topic)"
            class="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
          />
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ row.original.title || truncate(row.original.message, 60) }}
            </p>
            <p v-if="!row.original.title" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ truncate(row.original.message, 100) }}
            </p>
          </div>
        </div>
      </template>

      <!-- Time -->
      <template #time-cell="{ row }">
        <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {{ formatDate(row.original.time) }}
        </span>
      </template>

      <!-- Tags -->
      <template #tags-cell="{ row }">
        <div v-if="row.original.tags?.length" class="flex flex-wrap gap-1">
          <UBadge
            v-for="tag in row.original.tags.slice(0, 2)"
            :key="tag"
            color="gray"
            variant="subtle"
            size="xs"
          >
            {{ tag }}
          </UBadge>
          <span
            v-if="row.original.tags.length > 2"
            class="text-xs text-gray-400"
          >
            +{{ row.original.tags.length - 2 }}
          </span>
        </div>
      </template>
    </UTable>
  </UCard>
</template>

<script setup lang="ts">
import type { MessageResponse } from '~/utils/api'

defineProps<{ messages: MessageResponse[] }>()

defineEmits<{ select: [message: MessageResponse] }>()

const columns = [
  { accessorKey: 'priority', header: 'Priority', width: 100 },
  { accessorKey: 'topic', header: 'Topic', width: 120 },
  { accessorKey: 'message', header: 'Message' },
  { accessorKey: 'time', header: 'Time', width: 150 },
  { accessorKey: 'tags', header: 'Tags', width: 150 }
]

const truncate = (str: string, length: number) => {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPriorityLabel = (priority: number) => {
  return { 1: 'Min', 2: 'Low', 3: 'Default', 4: 'High', 5: 'Urgent' }[priority] || 'Default'
}

const getPriorityColor = (priority: number) => {
  return { 1: 'gray', 2: 'blue', 3: 'green', 4: 'orange', 5: 'red' }[priority] || 'green'
}

const getTopicColor = (topic: string) => {
  return { sonarr: 'purple', radarr: 'yellow', system: 'gray', test: 'cyan' }[topic.toLowerCase()] || 'primary'
}

const getTopicIcon = (topic: string) => {
  return { sonarr: 'i-heroicons-tv', radarr: 'i-heroicons-film', system: 'i-heroicons-server', test: 'i-heroicons-beaker' }[topic.toLowerCase()] || 'i-heroicons-bell'
}
</script>

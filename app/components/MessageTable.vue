<template>
  <UCard>
    <UTable
      :data="messages"
      :columns="columns"
      @select="(e, row) => $emit('select', row.original)"
    >
      <!-- Priority Column -->
      <template #priority-cell="{ row }">
        <div class="flex items-center gap-2">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              getPriorityColor(row.original.priority)
            ]"
          />
          <span class="text-sm">{{ getPriorityLabel(row.original.priority) }}</span>
        </div>
      </template>

      <!-- Topic Column -->
      <template #topic-cell="{ row }">
        <UBadge
          :color="getTopicColor(row.original.topic)"
          variant="subtle"
          size="sm"
        >
          {{ row.original.topic }}
        </UBadge>
      </template>

      <!-- Title Column -->
      <template #title-cell="{ row }">
        <div class="flex items-center gap-2">
          <UIcon
            :name="getTopicIcon(row.original.topic)"
            class="w-4 h-4 text-gray-500 flex-shrink-0"
          />
          <span class="font-medium truncate">
            {{ row.original.title || row.original.message.substring(0, 50) + '...' }}
          </span>
        </div>
      </template>

      <!-- Time Column -->
      <template #time-cell="{ row }">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ formatDate(row.original.time) }}
        </span>
      </template>

      <!-- Tags Column -->
      <template #tags-cell="{ row }">
        <div v-if="row.original.tags && row.original.tags.length > 0" class="flex gap-1">
          <UBadge
            v-for="tag in row.original.tags.slice(0, 2)"
            :key="tag"
            color="gray"
            variant="soft"
            size="xs"
          >
            {{ tag }}
          </UBadge>
          <UBadge
            v-if="row.original.tags.length > 2"
            color="gray"
            variant="soft"
            size="xs"
          >
            +{{ row.original.tags.length - 2 }}
          </UBadge>
        </div>
      </template>
    </UTable>
  </UCard>
</template>

<script setup lang="ts">
import type { MessageResponse } from '~/utils/api'

defineProps<{
  messages: MessageResponse[]
}>()

defineEmits<{
  select: [message: MessageResponse]
}>()

// Table columns
const columns = [
  { accessorKey: 'priority', header: 'Priority' },
  { accessorKey: 'topic', header: 'Topic' },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'time', header: 'Time' },
  { accessorKey: 'tags', header: 'Tags' }
]

// Format date for display
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
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get priority label
const getPriorityLabel = (priority: number) => {
  const labels: Record<number, string> = {
    1: 'Min',
    2: 'Low',
    3: 'Default',
    4: 'High',
    5: 'Urgent'
  }
  return labels[priority] || 'Default'
}

// Get priority color
const getPriorityColor = (priority: number) => {
  const colors: Record<number, string> = {
    1: 'bg-gray-400',
    2: 'bg-blue-500',
    3: 'bg-green-500',
    4: 'bg-orange-500',
    5: 'bg-red-500'
  }
  return colors[priority] || 'bg-green-500'
}

// Get topic color
const getTopicColor = (topic: string) => {
  const colors: Record<string, string> = {
    sonarr: 'purple',
    radarr: 'yellow',
    system: 'gray',
    test: 'cyan'
  }
  return colors[topic.toLowerCase()] || 'primary'
}

// Get topic icon
const getTopicIcon = (topic: string) => {
  const icons: Record<string, string> = {
    sonarr: 'i-heroicons-tv',
    radarr: 'i-heroicons-film',
    system: 'i-heroicons-server',
    test: 'i-heroicons-beaker'
  }
  return icons[topic.toLowerCase()] || 'i-heroicons-bell'
}
</script>

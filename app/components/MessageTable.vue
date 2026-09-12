<template>
  <UCard>
    <UTable :data="messages" :columns="columns" @select="(_, row) => $emit('select', row.original)">
      <!-- Priority — just a colored dot -->
      <template #priority-cell="{ row }">
        <span
          :class="getPriorityDotClass(row.original.priority)"
          class="inline-block w-2.5 h-2.5 rounded-full"
          :title="getPriorityLabel(row.original.priority)"
        />
      </template>

      <!-- Topic — brand icon + name -->
      <template #topic-cell="{ row }">
        <div class="flex items-center gap-2">
          <UIcon
            :name="getTopicIcon(row.original.topic)"
            class="w-4 h-4 flex-shrink-0"
          />
          <UBadge
            :color="getTopicColor(row.original.topic)"
            variant="soft"
            size="sm"
          >
            {{ row.original.topic }}
          </UBadge>
        </div>
      </template>

      <!-- Message — no icon, just text -->
      <template #message-cell="{ row }">
        <div>
          <p class="font-medium text-highlighted">
            {{ row.original.title || truncate(row.original.message, 80) }}
          </p>
          <p v-if="!row.original.title" class="text-sm text-muted mt-1">
            {{ truncate(row.original.message, 120) }}
          </p>
        </div>
      </template>

      <!-- Time -->
      <template #time-cell="{ row }">
        <span class="text-sm text-muted whitespace-nowrap">
          {{ formatDate(row.original.time) }}
        </span>
      </template>

      <!-- Tags -->
      <template #tags-cell="{ row }">
        <div v-if="row.original.tags?.length" class="flex flex-wrap gap-1">
          <UBadge
            v-for="tag in row.original.tags.slice(0, 2)"
            :key="tag"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            {{ tag }}
          </UBadge>
          <span
            v-if="row.original.tags.length > 2"
            class="text-sm text-dimmed"
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
  { accessorKey: 'priority', header: 'Priority', width: 60 },
  { accessorKey: 'topic', header: 'Topic', width: 140 },
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

import { getTopicIcon, getTopicColor } from '~/utils/topicIcons'

const getPriorityLabel = (priority: number) => {
  return { 1: 'Min', 2: 'Low', 3: 'Default', 4: 'High', 5: 'Urgent' }[priority] || 'Default'
}

const getPriorityDotClass = (priority: number) => {
  return {
    1: 'bg-gray-400',
    2: 'bg-blue-500',
    3: 'bg-green-500',
    4: 'bg-orange-500',
    5: 'bg-red-500',
  }[priority] || 'bg-green-500'
}
</script>

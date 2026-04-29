<template>
  <UModal v-model:open="isOpen" class="w-full max-w-2xl">
    <template #content>
      <UCard class="p-0 overflow-hidden">
        <!-- Header -->
        <template #header>
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <UIcon
                  :name="getTopicIcon(message.topic)"
                  class="w-6 h-6 text-gray-500 flex-shrink-0"
                />
                <UBadge
                  :color="getTopicColor(message.topic)"
                  variant="soft"
                  size="sm"
                >
                  {{ message.topic }}
                </UBadge>
                <UBadge
                  v-if="message.priority !== 3"
                  :color="getPriorityBadgeColor(message.priority)"
                  variant="soft"
                  size="sm"
                >
                  {{ getPriorityLabel(message.priority) }}
                </UBadge>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {{ message.title || 'Untitled Message' }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatDate(message.time) }}
              </p>
            </div>
            <UButton
              color="gray"
              variant="Ghost"
              icon="i-heroicons-x-mark"
              class="flex-shrink-0"
              @click="isOpen = false"
            />
          </div>
        </template>

        <!-- Priority indicator -->
        <div
          :class="[getPriorityColor(message.priority), 'h-0.5']"
        />

        <!-- Content -->
        <div class="p-6 space-y-6">
          <!-- Message -->
          <div class="prose prose-sm dark:prose-invert max-w-none">
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {{ message.message }}
            </p>
          </div>

          <!-- Tags -->
          <div v-if="message.tags?.length" class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Tags
            </h4>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="tag in message.tags"
                :key="tag"
                color="gray"
                variant="subtle"
                size="sm"
              >
                {{ tag }}
              </UBadge>
            </div>
          </div>

          <!-- Metadata -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Details
            </h4>
            <dl class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt class="text-gray-500 dark:text-gray-400">Message ID</dt>
                <dd class="font-mono text-xs text-gray-900 dark:text-white mt-1 truncate">
                  {{ message.id }}
                </dd>
              </div>
              <div>
                <dt class="text-gray-500 dark:text-gray-400">Priority</dt>
                <dd class="text-gray-900 dark:text-white mt-1">
                  {{ getPriorityLabel(message.priority) }} ({{ message.priority }}/5)
                </dd>
              </div>
              <div>
                <dt class="text-gray-500 dark:text-gray-400">Topic</dt>
                <dd class="text-gray-900 dark:text-white mt-1">
                  {{ message.topic }}
                </dd>
              </div>
              <div>
                <dt class="text-gray-500 dark:text-gray-400">Sent</dt>
                <dd class="text-gray-900 dark:text-white mt-1">
                  {{ new Date(message.time).toLocaleString() }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Actions -->
          <div
            v-if="message.click || message.actions?.length"
            class="border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Actions
            </h4>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="message.click"
                :to="message.click"
                target="_blank"
                variant="soft"
                size="sm"
                icon="i-heroicons-arrow-top-right-on-square"
              >
                View Details
              </UButton>
              <UButton
                v-for="(action, idx) in message.actions"
                :key="idx"
                :to="action.url"
                target="_blank"
                variant="soft"
                size="sm"
                :icon="action.action === 'view' ? 'i-heroicons-eye' : 'i-heroicons-cursor-arrow-rays'"
              >
                {{ action.label }}
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { MessageResponse } from '~/utils/api'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  message: MessageResponse
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

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

const getPriorityBadgeColor = (priority: number) => {
  return { 1: 'gray', 2: 'blue', 3: 'green', 4: 'orange', 5: 'red' }[priority] || 'green'
}

const getPriorityColor = (priority: number) => {
  return { 1: 'bg-gray-500', 2: 'bg-blue-500', 3: 'bg-green-500', 4: 'bg-orange-500', 5: 'bg-red-500' }[priority] || 'bg-green-500'
}

const getTopicColor = (topic: string) => {
  return { sonarr: 'purple', radarr: 'yellow', system: 'gray', test: 'cyan' }[topic.toLowerCase()] || 'primary'
}

const getTopicIcon = (topic: string) => {
  return { sonarr: 'i-heroicons-tv', radarr: 'i-heroicons-film', system: 'i-heroicons-server', test: 'i-heroicons-beaker' }[topic.toLowerCase()] || 'i-heroicons-bell'
}
</script>

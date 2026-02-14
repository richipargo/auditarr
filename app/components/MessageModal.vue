<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <!-- Icon/Avatar -->
                <UAvatar
                  v-if="message.icon"
                  :src="message.icon"
                  size="md"
                  :alt="message.title || 'Message icon'"
                />
                <UIcon
                  v-else
                  :name="getTopicIcon(message.topic)"
                  class="w-8 h-8 text-gray-500"
                />

                <!-- Topic Badge -->
                <UBadge
                  :color="getTopicColor(message.topic)"
                  variant="subtle"
                >
                  {{ message.topic }}
                </UBadge>

                <!-- Priority Badge -->
                <UBadge
                  v-if="message.priority && message.priority !== 3"
                  :color="getPriorityBadgeColor(message.priority)"
                  variant="subtle"
                >
                  {{ getPriorityLabel(message.priority) }}
                </UBadge>
              </div>

              <!-- Title -->
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ message.title || 'Message Details' }}
              </h3>

              <!-- Timestamp -->
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ formatDate(message.time) }}
              </p>
            </div>

            <!-- Close Button -->
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="isOpen = false"
            />
          </div>
        </template>

        <!-- Message Content -->
        <div class="space-y-4">
          <!-- Priority Indicator Bar -->
          <div
            :class="[
              'h-1 rounded-full w-full',
              getPriorityColor(message.priority)
            ]"
          />

          <!-- Message Body -->
          <div class="prose prose-sm dark:prose-invert max-w-none">
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {{ message.message }}
            </p>
          </div>

          <!-- Extract and display images from message content -->
          <div v-if="extractedImages.length > 0" class="space-y-2">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Attachments</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <img
                v-for="(img, idx) in extractedImages"
                :key="idx"
                :src="img"
                :alt="`Attachment ${idx + 1}`"
                class="rounded-lg border border-gray-200 dark:border-gray-700 w-full h-auto"
              />
            </div>
          </div>

          <!-- Tags -->
          <div v-if="message.tags && message.tags.length > 0">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Tags</h4>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="tag in message.tags"
                :key="tag"
                color="gray"
                variant="soft"
              >
                {{ tag }}
              </UBadge>
            </div>
          </div>

          <!-- Metadata -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Metadata</h4>
            <dl class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt class="text-gray-600 dark:text-gray-400">Message ID</dt>
                <dd class="font-mono text-xs text-gray-900 dark:text-white mt-1">
                  {{ message.id }}
                </dd>
              </div>
              <div>
                <dt class="text-gray-600 dark:text-gray-400">Topic</dt>
                <dd class="text-gray-900 dark:text-white mt-1">
                  {{ message.topic }}
                </dd>
              </div>
              <div>
                <dt class="text-gray-600 dark:text-gray-400">Priority</dt>
                <dd class="text-gray-900 dark:text-white mt-1">
                  {{ getPriorityLabel(message.priority) }} ({{ message.priority }}/5)
                </dd>
              </div>
              <div>
                <dt class="text-gray-600 dark:text-gray-400">Timestamp</dt>
                <dd class="text-gray-900 dark:text-white mt-1">
                  {{ new Date(message.time).toLocaleString() }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Actions -->
          <div v-if="message.actions || message.click" class="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Actions</h4>
            <div class="flex flex-wrap gap-2">
              <!-- Click Link -->
              <UButton
                v-if="message.click"
                :to="message.click"
                target="_blank"
                variant="soft"
                icon="i-heroicons-arrow-top-right-on-square"
              >
                View Details
              </UButton>

              <!-- Action Buttons -->
              <UButton
                v-for="(action, idx) in message.actions"
                :key="idx"
                :to="action.url"
                target="_blank"
                variant="soft"
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
const props = defineProps<{
  message: any
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Extract image URLs from message content or metadata
const extractedImages = computed(() => {
  if (!props.message) return []

  const images = []

  // Check for icon
  if (props.message.icon) {
    images.push(props.message.icon)
  }

  // Extract URLs from message content that look like images
  const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg))/gi
  const matches = props.message.message.match(urlRegex)
  if (matches) {
    images.push(...matches)
  }

  return [...new Set(images)] // Remove duplicates
})

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

// Get priority badge color
const getPriorityBadgeColor = (priority: number) => {
  const colors: Record<number, string> = {
    1: 'gray',
    2: 'blue',
    3: 'green',
    4: 'orange',
    5: 'red'
  }
  return colors[priority] || 'green'
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

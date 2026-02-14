<template>
  <UContainer>
    <div class="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <UIcon name="i-heroicons-shield-check" class="w-24 h-24 text-primary mb-6" />

      <h1 class="text-5xl font-bold mb-4">
        AuditArr
      </h1>

      <p class="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
        Message audit trail for your *arr applications. Track notifications from Sonarr, Radarr, and more with a clean, searchable interface.
      </p>

      <div class="flex gap-4 mb-12">
        <UButton
          to="/messages"
          size="lg"
          icon="i-heroicons-inbox"
        >
          View Messages
        </UButton>

        <UButton
          to="https://docs.ntfy.sh"
          target="_blank"
          size="lg"
          variant="outline"
          icon="i-heroicons-book-open"
        >
          Documentation
        </UButton>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-bell" class="w-8 h-8 text-primary" />
              <h3 class="text-lg font-semibold">ntfy.sh Compatible</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-400">
            Drop-in replacement for ntfy.sh notifications. Configure your *arr apps to send messages directly.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-magnifying-glass" class="w-8 h-8 text-primary" />
              <h3 class="text-lg font-semibold">Searchable History</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-400">
            Full-text search, filtering by topic, date range, and priority. Never lose track of important events.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-server" class="w-8 h-8 text-primary" />
              <h3 class="text-lg font-semibold">Self-Hosted</h3>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-400">
            Your data stays on your server. Built with Nuxt 4, Drizzle ORM, and SQLite for reliability.
          </p>
        </UCard>
      </div>

      <!-- Quick Start -->
      <div class="mt-16 w-full max-w-2xl">
        <UCard>
          <template #header>
            <h3 class="text-xl font-semibold">Quick Start</h3>
          </template>

          <div class="space-y-4 text-left">
            <div>
              <h4 class="font-semibold mb-2">1. Send a test message:</h4>
              <UCard :ui="{ body: { base: 'bg-gray-50 dark:bg-gray-900' } }">
                <code class="text-sm">
                  curl -d "Hello from AuditArr" http://localhost:3000/api/test
                </code>
              </UCard>
            </div>

            <div>
              <h4 class="font-semibold mb-2">2. Configure Sonarr/Radarr:</h4>
              <ul class="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Go to Settings → Connect</li>
                <li>Add ntfy notification</li>
                <li>Set URL to: <code class="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">http://your-server:3000/api/sonarr</code></li>
              </ul>
            </div>

            <div>
              <h4 class="font-semibold mb-2">3. View your audit trail:</h4>
              <UButton
                to="/messages"
                icon="i-heroicons-arrow-right"
                block
              >
                Go to Messages
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'AuditArr - Message Audit Trail for *arr Applications',
  description: 'Track and monitor notifications from Sonarr, Radarr, and other applications with a clean, searchable interface.',
})
</script>

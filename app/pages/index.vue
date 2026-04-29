<template>
  <UContainer class="py-16">
    <div class="max-w-2xl mx-auto text-center">
      <!-- Logo/Icon -->
      <UIcon name="i-heroicons-shield-check" class="w-16 h-16 text-primary mx-auto mb-6" />

      <!-- Title -->
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        AuditArr
      </h1>

      <!-- Tagline -->
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Persistent notification audit trail for your *arr applications.
      </p>

      <!-- CTA -->
      <div class="flex gap-4 justify-center mb-12">
        <UButton to="/messages" size="lg" icon="i-heroicons-inbox">
          View Messages
        </UButton>
        <UButton
          to="https://github.com/ntfy/ntfy"
          target="_blank"
          size="lg"
          variant="outline"
          icon="i-heroicons-book-open"
        >
          ntfy.sh Docs
        </UButton>
      </div>

      <!-- Feature Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <UCard>
          <UIcon name="i-heroicons-bell" class="w-8 h-8 text-primary mb-4" />
          <h3 class="font-semibold text-lg mb-2">ntfy.sh Compatible</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Direct API compatibility with ntfy.sh. Configure Sonarr, Radarr, and other apps without changing your existing setup.
          </p>
        </UCard>

        <UCard>
          <UIcon name="i-heroicons-database" class="w-8 h-8 text-primary mb-4" />
          <h3 class="font-semibold text-lg mb-2">Persistent Storage</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            All messages stored in SQLite. Never lose notification history, with fast search and filtering.
          </p>
        </UCard>

        <UCard>
          <UIcon name="i-heroicons-magnifying-glass" class="w-8 h-8 text-primary mb-4" />
          <h3 class="font-semibold text-lg mb-2">Search & Filter</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Full-text search, filter by topic, priority, tags, or date range. Find what you need instantly.
          </p>
        </UCard>
      </div>

      <!-- Quick Start -->
      <div class="mt-16">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Quick Start
        </h2>

        <UCard>
          <div class="space-y-4 text-left">
            <div class="flex items-start gap-4">
              <span class="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">01</span>
              <div>
                <h3 class="font-semibold mb-1">Send a test message:</h3>
                <code class="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm mt-2">
                  curl -d "Hello AuditArr" http://localhost:3000/api/test
                </code>
              </div>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-start gap-4">
              <span class="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">02</span>
              <div>
                <h3 class="font-semibold mb-1">Configure your apps:</h3>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
                  <li>Sonarr/Radarr → Settings → Connect</li>
                  <li>Add ntfy notification</li>
                  <li>URL: <code class="text-sm bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">http://your-server:3000/api/sonarr</code></li>
                </ul>
              </div>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 pt-4 flex items-start gap-4">
              <span class="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">03</span>
              <div>
                <h3 class="font-semibold mb-1">View your messages:</h3>
                <UButton to="/messages" icon="i-heroicons-arrow-right" class="mt-2" size="sm">
                  Go to Messages
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'AuditArr - Persistent Notification Audit Trail',
  description: 'Track and monitor notifications from Sonarr, Radarr, and other applications.',
})
</script>

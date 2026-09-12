<template>
  <UContainer class="py-12 md:py-20">
    <div class="max-w-3xl">
      <h1 class="text-3xl md:text-4xl font-bold text-highlighted tracking-tight">
        Notification history for your homelab
      </h1>
      <p class="text-lg text-muted mt-3 max-w-xl">
        AuditArr catches every notification your *arr apps send and keeps them.
        Searchable, filterable, and yours.
      </p>

      <div class="flex flex-wrap gap-3 mt-6">
        <UButton to="/messages" size="lg" icon="i-heroicons-inbox">
          View Messages
        </UButton>
        <UButton
          to="/messages"
          size="lg"
          variant="outline"
          color="neutral"
          icon="i-heroicons-terminal"
          @click="copyCurl"
        >
          {{ copied ? 'Copied' : 'Try it now' }}
        </UButton>
      </div>
    </div>

    <!-- Terminal-style code block -->
    <div class="mt-10 max-w-2xl">
      <div class="bg-elevated rounded-md border border-muted overflow-hidden">
        <div class="flex items-center gap-1.5 px-4 py-2.5 border-b border-muted">
          <span class="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span class="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span class="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span class="text-xs text-dimmed ml-2 font-mono">terminal</span>
        </div>
        <pre class="p-4 text-sm font-mono text-default overflow-x-auto"><code><span class="text-dimmed"># Send a notification</span>
curl -d <span class="text-primary">"Server backup complete"</span> \
     -H <span class="text-primary">"Title: Backup"</span> \
     -H <span class="text-primary">"Priority: high"</span> \
     -H <span class="text-primary">"Tags: backup,success"</span> \
     http://localhost:3000/api/system

<span class="text-dimmed"># It shows up instantly</span>
<span class="text-secondary">→</span> open http://localhost:3000/messages</code></pre>
      </div>
    </div>

    <!-- Inline features, not card grid -->
    <div class="mt-12 max-w-2xl space-y-6">
      <div class="flex gap-4">
        <UIcon name="i-heroicons-bell" class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="font-medium text-highlighted">Drop-in ntfy.sh replacement</h3>
          <p class="text-sm text-muted mt-1">
            Point Sonarr, Radarr, or anything that speaks ntfy at your AuditArr URL.
            No client changes needed.
          </p>
        </div>
      </div>

      <div class="flex gap-4">
        <UIcon name="i-heroicons-archive-box" class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="font-medium text-highlighted">Nothing gets lost</h3>
          <p class="text-sm text-muted mt-1">
            Every message lands in SQLite with full metadata — title, priority, tags,
            actions, and rich *arr fields like quality, release group, and indexer.
          </p>
        </div>
      </div>

      <div class="flex gap-4">
        <UIcon name="i-heroicons-funnel" class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="font-medium text-highlighted">Find what you need</h3>
          <p class="text-sm text-muted mt-1">
            Filter by topic, search message content, or narrow by date range.
            Click any row for the full detail view with images and action buttons.
          </p>
        </div>
      </div>
    </div>

    <!-- Setup steps, compact -->
    <div class="mt-12 max-w-2xl">
      <h2 class="text-sm font-semibold text-dimmed uppercase tracking-wider mb-4">
        Setup in 30 seconds
      </h2>
      <div class="space-y-3">
        <div class="flex gap-3 text-sm">
          <span class="font-mono text-dimmed w-6 flex-shrink-0">1.</span>
          <p class="text-muted">
            <code class="font-mono text-default bg-elevated px-1.5 py-0.5 rounded">docker-compose up -d</code>
            and you're running.
          </p>
        </div>
        <div class="flex gap-3 text-sm">
          <span class="font-mono text-dimmed w-6 flex-shrink-0">2.</span>
          <p class="text-muted">
            In Sonarr/Radarr: Settings → Connect → Add ntfy notification.
            Set URL to <code class="font-mono text-default bg-elevated px-1.5 py-0.5 rounded">http://your-server:3000/api/sonarr</code>.
          </p>
        </div>
        <div class="flex gap-3 text-sm">
          <span class="font-mono text-dimmed w-6 flex-shrink-0">3.</span>
          <p class="text-muted">
            That's it. Messages appear at
            <NuxtLink to="/messages" class="text-primary font-medium">/messages</NuxtLink>.
          </p>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'AuditArr — Notification Audit Trail',
  description: 'Persistent notification history for Sonarr, Radarr, and ntfy.sh-compatible apps.',
})

const copied = ref(false)

async function copyCurl() {
  try {
    await navigator.clipboard.writeText(
      'curl -d "Hello AuditArr" http://localhost:3000/api/test'
    )
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Clipboard not available in non-secure context
  }
}
</script>

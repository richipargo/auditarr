<template>
  <UApp>
    <div class="min-h-screen flex flex-col bg-default">
      <UHeader>
        <template #logo>
          <NuxtLink to="/" class="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-primary" />
            <span class="font-semibold text-lg tracking-tight">AuditArr</span>
          </NuxtLink>
        </template>

        <template #right>
          <UButton
            to="/messages"
            variant="ghost"
            color="neutral"
            icon="i-heroicons-inbox"
            label="Messages"
          />
          <UColorModeButton />
        </template>
      </UHeader>

      <NuxtRouteAnnouncer />

      <UMain class="flex-1">
        <NuxtPage />
      </UMain>
    </div>
  </UApp>
</template>

<template>
  <div class="min-h-screen flex flex-col">
    <UHeader class="border-b border-gray-200 dark:border-gray-800">
      <template #logo>
        <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <UIcon name="i-heroicons-shield-check" class="w-6 h-6" />
          <span class="font-bold text-xl">AuditArr</span>
        </NuxtLink>
      </template>

      <template #right>
        <UButton
          to="/messages"
          variant="ghost"
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
</template>

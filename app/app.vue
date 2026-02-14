<template>
  <div>
    <UHeader>
      <template #logo>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-shield-check" class="w-6 h-6" />
          <span class="font-bold text-xl">AuditArr</span>
        </div>
      </template>

      <template #right>
        <UButton
          to="/messages"
          variant="ghost"
          icon="i-heroicons-inbox"
        >
          Messages
        </UButton>

        <UColorModeButton />
      </template>
    </UHeader>

    <NuxtRouteAnnouncer />

    <UMain>
      <NuxtPage />
    </UMain>
  </div>
</template>

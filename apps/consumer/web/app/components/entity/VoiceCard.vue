<script setup lang="ts">
  import { ENTITY_FALLBACK_IMAGE, type VoiceCardItem } from '~/features/entity/entity'

  defineOptions({ name: 'EntityVoiceCard' })
  defineProps<{ item: VoiceCardItem }>()
</script>

<template>
  <NuxtLink
    :to="item.to"
    class="group flex h-20 items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 px-3.5 py-3 transition-colors hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700"
  >
    <HikariImage
      :src="item.image?.src"
      :alt="item.name"
      class="size-14 shrink-0 rounded-full bg-surface-100 dark:bg-surface-800"
      image-class="object-cover object-top"
      :processing="{ gravity: 'face' }"
      preset="thumbnail"
      :fallback-src="ENTITY_FALLBACK_IMAGE"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <p
        class="truncate text-sm font-bold text-surface-900 transition-colors group-hover:text-hikari-primary-600 dark:text-surface-0 dark:group-hover:text-hikari-primary-400"
      >
        {{ item.name }}
      </p>
      <p v-if="item.sub" class="truncate text-xs text-surface-500 dark:text-surface-400">
        {{ item.sub }}
      </p>
    </div>
  </NuxtLink>
</template>

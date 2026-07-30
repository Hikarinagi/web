<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameAboutCharacterCard' })
  const props = defineProps<{ item: GalgamePageData['characters'][number] }>()

  const name = computed(() => props.item.character.trans_name || props.item.character.name)
  const cv = computed(() => props.item.actors.map(a => a.trans_name || a.name).join(' / '))
</script>

<template>
  <NuxtLink
    :to="`/characters/${item.character.id}`"
    class="group flex h-20 items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 px-3.5 py-3 transition-colors hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700"
  >
    <HikariImage
      :src="item.character.image?.src"
      :alt="name"
      class="size-14 shrink-0 rounded-full"
      image-class="object-cover object-top"
      :processing="{ gravity: 'face' }"
      preset="thumbnail"
    >
      <template #empty><span /></template>
      <template #error><span /></template>
    </HikariImage>
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <p
        class="truncate text-sm font-bold text-surface-900 transition-colors group-hover:text-hikari-primary-600 dark:text-surface-0 dark:group-hover:text-hikari-primary-400"
      >
        {{ name }}
      </p>
      <p v-if="cv" class="flex items-center gap-1 text-xs text-surface-600 dark:text-surface-400">
        <span class="shrink-0 text-[11px] text-surface-400">CV</span>
        <span class="truncate">{{ cv }}</span>
      </p>
    </div>
  </NuxtLink>
</template>

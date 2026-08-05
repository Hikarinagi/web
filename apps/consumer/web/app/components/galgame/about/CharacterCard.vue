<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'

  defineOptions({ name: 'GalgameAboutCharacterCard' })
  const props = defineProps<{ item: GalgamePageData['characters'][number] }>()

  const name = computed(() => props.item.character.trans_name || props.item.character.name)
  const actors = computed(() =>
    props.item.actors.map(actor => ({ id: actor.id, name: actor.trans_name || actor.name })),
  )
</script>

<template>
  <div
    class="group relative flex h-20 items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 px-3.5 py-3 transition-colors hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700"
  >
    <HikariImage
      :src="item.character.image?.src"
      :alt="name"
      class="size-14 shrink-0 rounded-full"
      image-class="object-cover object-top"
      :processing="{ gravity: 'face' }"
      preset="thumbnail"
      :fallback-src="ENTITY_FALLBACK_IMAGE"
    >
      <template #error><span /></template>
    </HikariImage>
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <NuxtLink
        :to="`/characters/${item.character.id}`"
        class="truncate text-sm font-bold text-surface-900 transition-colors group-hover:text-hikari-primary-600 after:absolute after:inset-0 dark:text-surface-0 dark:group-hover:text-hikari-primary-400"
      >
        {{ name }}
      </NuxtLink>
      <p
        v-if="actors.length"
        class="relative z-10 flex items-center gap-1 text-xs text-surface-600 dark:text-surface-400"
      >
        <span class="shrink-0 text-[11px] text-surface-400">CV</span>
        <span class="truncate">
          <template v-for="(actor, index) in actors" :key="actor.id">
            <span v-if="index" aria-hidden="true" class="px-1">/</span>
            <NuxtLink
              :to="`/people/${actor.id}`"
              class="transition-colors hover:text-hikari-primary-600 hover:underline dark:hover:text-hikari-primary-400"
            >
              {{ actor.name }}
            </NuxtLink>
          </template>
        </span>
      </p>
    </div>
  </div>
</template>

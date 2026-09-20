<script setup lang="ts">
  import { producerText, titleOf, type GalgameSummary } from '~/features/galgame/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameBrowseCard' })
  const props = defineProps<{ item: GalgameSummary }>()

  const title = computed(() => titleOf(props.item))
  const cover = computed(() => topVotedMedia(props.item.covers))
</script>

<template>
  <NuxtLink :to="`/galgames/${item.id}`" class="group flex min-w-0 flex-col gap-2">
    <div
      class="aspect-3/4 overflow-hidden rounded-lg border border-surface-200 bg-surface-100 transition-colors duration-150 ease-out group-hover:border-surface-300 dark:border-surface-800 dark:bg-surface-800 dark:group-hover:border-surface-700"
    >
      <HikariImage
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="size-full object-cover object-top"
        :processing="{ quality: 82 }"
        :lazy="true"
      />
    </div>
    <div class="flex min-w-0 flex-col gap-1">
      <p
        class="truncate text-sm font-semibold text-surface-900 transition-colors duration-150 ease-out group-hover:text-primary dark:text-surface-100"
      >
        {{ title }}
      </p>
      <p class="truncate text-xs font-bold text-surface-500 dark:text-surface-400">
        {{ producerText(item) }}
      </p>
    </div>
  </NuxtLink>
</template>

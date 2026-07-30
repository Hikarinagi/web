<script setup lang="ts">
  import { Image as ImageIcon, User } from '@lucide/vue'
  import {
    contributionDetailPath,
    contributionResourceLabel,
    type SpaceContribution,
  } from '~/features/space/space'
  import { TimeFormatEnum, datePartFormat } from '~/utils/time-format'

  defineOptions({ name: 'SpaceTabsContributionsRow' })

  const props = defineProps<{ item: SpaceContribution }>()
  const NuxtLink = resolveComponent('NuxtLink')

  const isEntity = computed(() =>
    ['PERSON', 'CHARACTER', 'PRODUCER'].includes(props.item.resource_type),
  )
  const to = computed(() => contributionDetailPath(props.item.change_request_id))
  const mediaClass = computed(() => (isEntity.value ? 'size-10 rounded-full' : 'h-12 w-9 rounded'))
  const mediaImageClass = computed(() =>
    isEntity.value ? 'size-full object-cover object-top' : 'size-full object-cover',
  )
  const mediaProcessing = computed(() =>
    isEntity.value
      ? { width: 80, height: 80, fit: 'cover' as const, gravity: 'face' as const, quality: 82 }
      : { width: 96, height: 128, fit: 'cover' as const, quality: 78 },
  )
</script>

<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to ?? undefined"
    :target="to ? '_blank' : undefined"
    class="group flex items-start gap-3.5 border-b border-surface-100 py-3.5 last:border-b-0 dark:border-surface-800/60"
  >
    <HikariImage
      v-if="item.resource?.cover"
      :src="item.resource.cover"
      alt=""
      class="shrink-0 bg-surface-100 dark:bg-surface-800"
      :class="mediaClass"
      :image-class="mediaImageClass"
      :processing="mediaProcessing"
    />
    <div
      v-else
      class="flex shrink-0 items-center justify-center bg-surface-100 text-muted-color dark:bg-surface-800"
      :class="mediaClass"
    >
      <component :is="isEntity ? User : ImageIcon" class="size-4" />
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <div class="flex items-center gap-2">
        <p class="truncate font-semibold text-color transition-colors group-hover:text-primary">
          {{ item.resource?.title ?? `#${item.resource_id}` }}
        </p>
        <span class="shrink-0 text-xs text-muted-color">
          {{ contributionResourceLabel(item.resource_type) }}
        </span>
      </div>
      <p class="truncate text-[13px] text-muted-color">{{ item.summary }}</p>
    </div>

    <div class="flex shrink-0 flex-col items-end gap-1.5">
      <div class="flex items-center gap-1.5">
        <span
          class="rounded bg-surface-100 px-1.5 py-0.5 text-[11px] text-muted-color dark:bg-surface-800"
        >
          v{{ item.version }}
        </span>
        <span class="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">已合并</span>
      </div>
      <span class="text-xs text-muted-color">
        {{ datePartFormat(item.created_at, TimeFormatEnum.M_D_CN) }}
      </span>
    </div>
  </component>
</template>

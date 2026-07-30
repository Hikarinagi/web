<script setup lang="ts">
  import { Check, CalendarDays } from '@lucide/vue'
  import type { GalgameSummary } from '~/features/galgame/explore'
  import { producerText, titleOf, yearText } from '~/features/galgame/explore'
  import { cn } from '~/utils/cn'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameExploreRecordWorkCard' })

  const props = defineProps<{
    item: GalgameSummary
    selected?: boolean
  }>()
  const emit = defineEmits<{ select: [item: GalgameSummary] }>()

  const title = computed(() => titleOf(props.item))
  const cover = computed(() => topVotedMedia(props.item.covers))
</script>

<template>
  <Button
    unstyled
    type="button"
    :aria-label="`选择 ${title}`"
    :class="
      cn(
        'group flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        selected
          ? 'border-primary bg-primary-50/70 dark:bg-primary-950/30'
          : 'border-surface-200 bg-surface-0 hover:border-surface-300 hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:bg-surface-800',
      )
    "
    @click="emit('select', item)"
  >
    <div
      class="h-18 w-13.5 shrink-0 overflow-hidden rounded-md border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800"
    >
      <HikariImage
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="size-full object-cover object-top"
        :processing="{ width: 160, height: 216, fit: 'cover', quality: 80 }"
        :lazy="true"
        :skeleton="false"
      />
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <span
        class="truncate text-[15px] font-semibold text-surface-900 transition-colors group-hover:text-primary dark:text-surface-100"
      >
        {{ title }}
      </span>
      <span class="truncate text-xs font-medium text-surface-500 dark:text-surface-400">
        {{ producerText(item) }}
      </span>
      <span class="inline-flex items-center gap-1 text-[11px] text-surface-400">
        <CalendarDays class="size-3" />
        {{ yearText(item) }}
      </span>
    </div>

    <span
      :class="
        cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full border transition',
          selected
            ? 'border-primary bg-primary text-primary-contrast'
            : 'border-surface-200 text-surface-300 group-hover:border-primary group-hover:text-primary dark:border-surface-700 dark:text-surface-500',
        )
      "
      aria-hidden="true"
    >
      <Check class="size-4" />
    </span>
  </Button>
</template>

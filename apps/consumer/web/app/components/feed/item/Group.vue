<script setup lang="ts">
  import { Inline, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import { timeFromNow } from '#imports'
  import { workPath as toWorkPath } from '#shared/utils/work'
  import type { FeedGroup } from '~/features/feed/feed'
  import { feedGroupSummary } from '~/features/feed/feed'
  import {
    GALGAME_STATUS_ICON,
    LIGHT_NOVEL_STATUS_ICON,
    MANGA_STATUS_ICON,
  } from '~/features/rate/status-icon'

  const props = defineProps<{ group: FeedGroup; hideName?: boolean }>()

  const summary = computed(() => feedGroupSummary(props.group))
  const icon = computed(() => {
    const icons =
      props.group.type === 'galgame_status'
        ? GALGAME_STATUS_ICON
        : props.group.type === 'light_novel_status'
          ? LIGHT_NOVEL_STATUS_ICON
          : MANGA_STATUS_ICON
    return icons[props.group.items[0]!.status]
  })
  const time = computed(() => timeFromNow(props.group.items[0]!.sort_time))
  const covers = computed(() => props.group.items.slice(0, 12))
</script>

<template>
  <Stack gap="sm" class="min-w-0">
    <Inline gap="sm" align="center" :wrap="false" class="min-w-0 text-sm">
      <UserName v-if="!hideName" :user="group.author" class="min-w-0 font-semibold text-fg" />
      <Text as="span" size="sm" tone="muted" class="shrink-0">{{ time }}</Text>
    </Inline>

    <Inline gap="none" align="center" :wrap="false" class="gap-1.5">
      <component :is="icon" class="size-4 shrink-0 text-accent-text" />
      <Text as="span">{{ summary }}</Text>
    </Inline>

    <ScrollArea direction="horizontal">
      <Inline gap="sm" align="stretch" :wrap="false" class="min-w-max pb-1">
        <WorkCardTrigger
          v-for="item in covers"
          :key="item.id"
          :work-type="item.work_ref.work_type"
          :work-id="item.work_ref.id"
          class="inline-flex shrink-0"
        >
          <NuxtLink
            :to="toWorkPath(item.work_ref.work_type, item.work_ref.id)"
            class="relative z-1"
          >
            <HikariImage
              :src="item.work_ref.cover"
              :alt="item.work_ref.title"
              class="h-16 w-12 rounded"
              image-class="size-full object-cover"
              :processing="{ q: 90, w: 100 }"
            />
          </NuxtLink>
        </WorkCardTrigger>
      </Inline>
    </ScrollArea>
  </Stack>
</template>

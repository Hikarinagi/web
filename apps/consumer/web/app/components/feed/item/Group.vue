<script setup lang="ts">
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
  <div class="flex min-w-0 flex-col gap-2">
    <div class="flex min-w-0 items-center gap-2 text-sm">
      <UserName v-if="!hideName" :user="group.author" class="min-w-0 font-semibold text-color" />
      <span class="flex shrink-0 items-center gap-1 text-muted-color">
        <span>打卡</span>
        <span>·</span>
        <span>{{ time }}</span>
      </span>
    </div>

    <p class="flex items-center gap-1.5 text-[15px] text-color">
      <component :is="icon" class="size-4 shrink-0 text-primary" />
      <span>{{ summary }}</span>
    </p>

    <ScrollArea axis="x" shadow="end">
      <div class="flex min-w-max gap-2 pb-1">
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
      </div>
    </ScrollArea>
  </div>
</template>

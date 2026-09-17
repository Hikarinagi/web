<script setup lang="ts">
  import { Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { workPath as toWorkPath, workTypeLabel } from '#shared/utils/work'
  import type { SidebarRateItem } from '~/features/feed/sidebar'
  import { TimeFormatEnum, datePartFormat } from '~/utils/time-format'

  defineProps<{ items: SidebarRateItem[] }>()

  const workPath = (item: SidebarRateItem) => toWorkPath(item.work_type, item.id)

  const typeLabel = (item: SidebarRateItem) => workTypeLabel(item.work_type)

  const activity = (item: SidebarRateItem) => {
    const verb = item.work_type === 'GALGAME' ? '最近在玩' : '最近在读'
    return `${verb} · ${datePartFormat(item.last_activity_at, TimeFormatEnum.M_D_CN)}`
  }
</script>

<template>
  <Stack gap="none" class="pb-1.5">
    <NuxtLink
      v-for="item in items"
      :key="`${item.work_type}:${item.id}`"
      :to="workPath(item)"
      class="hn-state-layer flex hn-interactive items-center gap-3 px-(--hn-panel-p) py-2.5"
    >
      <HikariImage
        :src="item.cover"
        :alt="item.title"
        class="h-13 w-9 shrink-0 rounded"
        image-class="size-full object-cover"
        :processing="{ q: 90 }"
      />
      <Stack gap="xs" class="min-w-0 flex-1">
        <Text size="sm" weight="medium" truncate>{{ item.title }}</Text>
        <Inline gap="xs" align="center" :wrap="false" class="min-w-0">
          <Tag size="sm" class="shrink-0">{{ typeLabel(item) }}</Tag>
          <Text size="xs" tone="muted" truncate>{{ activity(item) }}</Text>
        </Inline>
      </Stack>
    </NuxtLink>
  </Stack>
</template>

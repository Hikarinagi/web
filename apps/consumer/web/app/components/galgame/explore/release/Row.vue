<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamesPageData } from '~~/server/api/pages/galgames.get'
  import { ArrowUpRight } from '@lucide/vue'

  defineOptions({ name: 'GalgameExploreReleaseRow' })
  const props = defineProps<{
    release: GalgamesPageData['release'] | GalgamesPageData['last_month']
    title?: string
    to?: string
  }>()

  const heading = computed(
    () => props.title || (props.release.current_month ? '本月新作' : '新近发售'),
  )
  const total = computed(() =>
    'total_items' in props.release ? props.release.total_items : props.release.items.length,
  )
  const meta = computed(() =>
    props.title || props.release.current_month
      ? `${props.release.year} 年 ${props.release.month} 月 · ${total.value} 部`
      : `${total.value} 部`,
  )
</script>

<template>
  <Stack v-if="release.items.length" as="section" gap="md">
    <Inline gap="md" align="center" justify="between" class="flex-col py-2 sm:flex-row">
      <Stack gap="xs" align="start">
        <Inline gap="sm" align="baseline">
          <Heading :level="2" size="2xl">{{ heading }}</Heading>
          <Text as="p" size="sm" tone="muted">{{ meta }}</Text>
        </Inline>
        <Text v-if="release.current_month" as="p" size="sm" tone="muted">
          每月新作一般会集中在月末的周五发售
        </Text>
      </Stack>
      <ViewAllLink v-if="to" :to="to" class="sm:ml-auto" />
      <Button
        v-else-if="release.current_month"
        :as="NuxtLink"
        to="/create/edit"
        target="_blank"
        variant="outline"
        tone="neutral"
      >
        数据缺失？来创建！
        <template #trailing><ArrowUpRight /></template>
      </Button>
    </Inline>

    <ScrollRail class="-mx-6">
      <Inline gap="md" align="stretch" :wrap="false" class="min-w-max px-6 pb-2">
        <GalgameExploreReleaseCard v-for="item in release.items" :key="item.id" :item="item" />
      </Inline>
    </ScrollRail>
  </Stack>
</template>

<script setup lang="ts">
  import { Card, Heading, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { revisionTime } from '~/features/entry/time'
  import type { ChangePageData } from '~~/server/api/pages/create/wiki/changes/[id].get'

  defineOptions({ name: 'WikiChangesPart' })

  const props = defineProps<{
    part: ChangePageData['edit']['entries'][number]
    names: ChangePageData['names']
    several: boolean
  }>()

  const kind = computed(() => props.names[props.part.entry.type])
  const title = computed(() => `${kind.value?.label ?? ''}：${props.part.entry.label || '未命名'}`)
</script>

<template>
  <Stack gap="sm">
    <Inline gap="sm" align="baseline" justify="between">
      <Heading :level="2" size="xs" lang="ja">{{ title }}</Heading>
      <Inline gap="md">
        <Link
          v-if="part.revision"
          :as="NuxtLink"
          :to="`/entries/${part.entry.id}/history/${part.revision}`"
          class="text-sm"
        >
          查看此版本
        </Link>
        <Link :as="NuxtLink" :to="`/entries/${part.entry.id}/edit`" class="text-sm">
          编辑条目
        </Link>
      </Inline>
    </Inline>
    <Text v-if="several && part.summary" size="sm" tone="muted">{{ part.summary }}</Text>
    <Text v-if="part.reverted_at" size="sm" tone="muted">
      这一部分已于 {{ revisionTime(part.reverted_at) }} 撤销
    </Text>
    <Card v-if="part.comparison" :padded="false" class="overflow-hidden">
      <WikiDiffTable :comparison="part.comparison" :names="kind?.properties ?? {}" />
    </Card>
  </Stack>
</template>

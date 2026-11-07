<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { History, PencilLine } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { components } from '@hikarinagi/api-contract/v3'
  import {
    getRevisionEditPath,
    getRevisionHistoryPath,
    type RevisionResourceSlug,
  } from '~/features/revision/resources'

  defineOptions({ name: 'EntryMeta' })
  const props = defineProps<{
    contributors: { contributors: components['schemas']['UserRefDto'][]; count: number } | null
    resourceType: RevisionResourceSlug
    resourceId: number
    external?: { label: string; href: string }[]
    views?: number
  }>()

  const editTo = computed(() => getRevisionEditPath(props.resourceType, props.resourceId))
  const historyTo = computed(() => getRevisionHistoryPath(props.resourceType, props.resourceId))
</script>

<template>
  <Stack gap="md" class="border-t border-line pt-5 text-sm">
    <Inline v-if="contributors" gap="sm" align="center" :wrap="false">
      <AvatarStack
        v-if="contributors.contributors.length"
        :users="contributors.contributors"
        :total="contributors.count"
        :max="5"
        size="sm"
        card
      />
      <Text size="sm" tone="muted">{{ contributors.count }} 位同好参与编辑</Text>
    </Inline>
    <Inline gap="md">
      <Link
        :as="NuxtLink"
        :to="editTo"
        target="_blank"
        tone="neutral"
        class="inline-flex items-center gap-1"
      >
        <PencilLine class="size-3.5" />
        编辑条目
      </Link>
      <Link :as="NuxtLink" :to="historyTo" tone="neutral" class="inline-flex items-center gap-1">
        <History class="size-3.5" />
        修订历史
      </Link>
    </Inline>
    <Inline gap="md" align="center">
      <Link
        v-for="item in external"
        :key="item.label"
        as="a"
        :href="item.href"
        target="_blank"
        rel="noopener noreferrer"
        tone="neutral"
        class="text-muted"
      >
        {{ item.label }}
      </Link>
      <Text v-if="views !== undefined" size="xs" tone="muted" class="ml-auto tabular-nums">
        {{ views.toLocaleString() }} 次浏览
      </Text>
    </Inline>
  </Stack>
</template>

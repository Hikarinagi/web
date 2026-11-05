<script setup lang="ts">
  import { Link, Panel, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { versionName } from '~/features/wiki/history'
  import type { ComparePageData } from '~~/server/api/pages/entries/[id]/history/compare.get'

  defineOptions({ name: 'WikiHistoryCompare' })

  const props = defineProps<{ data: ComparePageData }>()
  const base = computed(() => `/entries/${props.data.entry.id}/history`)
  const name = (at: string | null) => (at ? versionName(at) : '')
</script>

<template>
  <Panel title="两个版本的对照" :padded="false">
    <template #actions>
      <Stack gap="none" align="end">
        <Link :as="NuxtLink" :to="`${base}/${data.comparison.from}`" class="text-sm">
          {{ name(data.comparison.from_at) }}
        </Link>
        <Text as="span" size="xs" tone="muted">对照</Text>
        <Link :as="NuxtLink" :to="`${base}/${data.comparison.to}`" class="text-sm">
          {{ name(data.comparison.to_at) }}
        </Link>
      </Stack>
    </template>
    <WikiDiffTable
      :comparison="data.comparison"
      :names="data.names[data.entry.type]?.properties ?? {}"
    />
  </Panel>
</template>

<script setup lang="ts">
  import { Button, Empty, Panel, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ExternalLink, Library, Pencil } from '@lucide/vue'
  import { PUBLIC_PATH, type BackendDuplicateCandidate } from '~/features/creator/duplicates'
  import { RESOURCE_SLUG } from '~/features/creator/labels'

  const props = defineProps<{ candidates: BackendDuplicateCandidate[]; query?: string }>()

  const matches = computed(() => props.candidates.filter(item => item.level !== 'author_work'))
  const works = computed(() => props.candidates.filter(item => item.level === 'author_work'))
  const authorName = computed(() => {
    const reason = works.value[0]?.reasons.find(item => item.kind === 'author')
    return reason?.name || works.value[0]?.author || ''
  })
</script>

<template>
  <Panel title="本站条目" :count="candidates.length">
    <template #icon><Library /></template>
    <Empty v-if="candidates.length === 0" size="sm" title="本站没有匹配的条目" />
    <Stack v-else gap="sm">
      <CreatorDuplicateRow v-for="item in matches" :key="item.id" :candidate="item" :query="query">
        <Button
          v-if="PUBLIC_PATH[item.resource_type]"
          :as="NuxtLink"
          :to="`${PUBLIC_PATH[item.resource_type]}${item.id}`"
          target="_blank"
          variant="ghost"
          tone="neutral"
          size="sm"
        >
          <template #icon><ExternalLink /></template>
          查看
        </Button>
        <Button
          :as="NuxtLink"
          :to="`/create/edit/${RESOURCE_SLUG[item.resource_type]}/${item.id}`"
          variant="outline"
          tone="neutral"
          size="sm"
        >
          <template #icon><Pencil /></template>
          编辑此条目
        </Button>
      </CreatorDuplicateRow>

      <Stack v-if="works.length" gap="xs">
        <Text size="sm" tone="muted">{{ authorName }}的其他作品</Text>
        <CreatorDuplicateCovers :items="works" />
      </Stack>
    </Stack>
  </Panel>
</template>

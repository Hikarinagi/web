<script setup lang="ts">
  import { AspectRatio, Card, Empty, Inline, Panel, SimpleGrid, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'

  defineOptions({ name: 'WikiHomeRecent' })

  const store = useWikiRecentStore()
  const mounted = useMounted()
  const { typeName } = useWikiDefinitions()
</script>

<template>
  <Panel v-if="mounted" title="最近打开">
    <Empty v-if="!store.entries.length" title="暂无最近打开的条目" />
    <SimpleGrid v-else min="14rem" gap="md">
      <Card
        v-for="entry in store.entries"
        :key="entry.id"
        :as="NuxtLink"
        :to="`/entries/${entry.id}/edit`"
        :padded="false"
        class="hn-state-layer hn-interactive p-3"
      >
        <Inline gap="md" align="center" :wrap="false">
          <AspectRatio
            :ratio="entry.type === 'GAME' || entry.type === 'SERIES' ? 3 / 4 : 1"
            class="w-12 shrink-0 overflow-hidden rounded-sm bg-inset"
          >
            <HikariImage
              v-if="entry.image"
              :src="entry.image"
              alt=""
              preset="small"
              class="size-full"
              image-class="size-full object-cover"
            />
          </AspectRatio>
          <Stack gap="none" class="min-w-0">
            <Text size="sm" weight="medium" lang="ja" truncate>{{ entry.label || '未命名' }}</Text>
            <Text size="xs" tone="muted">{{ typeName(entry.type) }}</Text>
          </Stack>
        </Inline>
      </Card>
    </SimpleGrid>
  </Panel>
</template>

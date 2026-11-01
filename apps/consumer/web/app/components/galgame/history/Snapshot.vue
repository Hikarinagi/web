<script setup lang="ts">
  import { Alert, Button, Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgameSnapshotPageData } from '~~/server/api/pages/galgames/[id]/revisions/[revision].get'
  import { revisionTime } from '~/features/entry/time'
  import { platformLabel } from '~/features/galgame/platforms'

  defineOptions({ name: 'GalgameHistorySnapshot' })
  defineProps<{ galgameId: number; snapshot: GalgameSnapshotPageData['snapshot'] }>()
</script>

<template>
  <Stack gap="xl" class="mx-auto max-w-app px-6 py-10">
    <Alert tone="info" :title="`${revisionTime(snapshot.created_at)} 的修订`">
      本页展示的是该次修订完成时的条目内容。
      <template #actions>
        <Button
          :as="NuxtLink"
          :to="`/galgames/${galgameId}`"
          variant="outline"
          tone="neutral"
          size="sm"
        >
          返回当前版本
        </Button>
      </template>
    </Alert>
    <Stack gap="md">
      <Inline gap="sm" wrap>
        <Tag v-for="platform in snapshot.game.platforms" :key="platform" tone="neutral" size="md">
          {{ platformLabel(platform) }}
        </Tag>
      </Inline>
      <Heading :level="1" size="2xl">{{ snapshot.game.title }}</Heading>
      <Text v-if="snapshot.game.original_title" size="lg" tone="muted" lang="ja">
        {{ snapshot.game.original_title }}
      </Text>
      <GalgameHeroMeta :display="snapshot.game" />
    </Stack>
    <WorkSection title="发行版本" :meta="`${snapshot.products.length} 个`">
      <GalgameProductsTable :products="snapshot.products" :interactive="false" />
    </WorkSection>
  </Stack>
</template>

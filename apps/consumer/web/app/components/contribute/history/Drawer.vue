<script setup lang="ts">
  import { Button, Drawer, Empty, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { REVIEW_TAG_TONE, reviewStatus } from '~/features/contribute/intake-status'
  import { useCorrectionHistory } from '~/features/contribute/useCorrectionHistory'

  const open = defineModel<boolean>('open', { default: false })
  const { rows, loading, done, more } = useCorrectionHistory(open)
</script>

<template>
  <Drawer v-model:open="open" title="我的投稿">
    <template #content>
      <Stack gap="none">
        <NuxtLink
          v-for="row in rows"
          :key="row.id"
          :to="`/light-novel-volumes/${row.volume.id}`"
          class="border-b border-line py-3"
        >
          <Stack gap="xs">
            <Inline align="center" justify="between" gap="sm" :wrap="false">
              <ContributeVolumeHead :volume="row.volume" class="flex-1" />
              <Tag size="sm" :tone="REVIEW_TAG_TONE[row.status]" class="shrink-0">
                {{ reviewStatus(row.status).label }}
              </Tag>
            </Inline>
            <Text v-if="row.status === 'REJECTED' && row.reasons.length" size="xs" tone="muted">
              {{ row.reasons.join('；') }}
            </Text>
            <Text size="xs" tone="faint">{{ timeFromNow(row.created_at) }}</Text>
          </Stack>
        </NuxtLink>
        <Empty v-if="!loading && !rows.length" title="暂无投稿记录" />
        <Button
          v-if="rows.length && !done"
          variant="ghost"
          tone="neutral"
          :loading="loading"
          class="mt-3 self-center"
          @click="more"
        >
          加载更多
        </Button>
      </Stack>
    </template>
  </Drawer>
</template>

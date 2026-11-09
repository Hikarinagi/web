<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { ArrowLeft, RotateCcw, SquarePen, Undo2 } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { BackendGameDisplay } from '~/features/entry/contract'
  import { getRevisionEditPath } from '~/features/revision/resources'

  defineOptions({ name: 'GalgameHistoryHeader' })
  const props = defineProps<{ galgameId: number; display: BackendGameDisplay; total: number }>()

  const auth = useAuthStore()
  const editTo = computed(() => getRevisionEditPath('galgame', props.galgameId))
</script>

<template>
  <Stack as="header" gap="md" class="border-b border-line pb-6">
    <Inline gap="sm" align="center" justify="between" wrap>
      <Button
        :as="NuxtLink"
        :to="`/galgames/${galgameId}`"
        variant="outline"
        tone="neutral"
        size="sm"
      >
        <template #icon><ArrowLeft /></template>
        返回详情
      </Button>
      <Inline gap="sm" align="center">
        <Button
          v-if="auth.isAuthenticated"
          :as="NuxtLink"
          :to="editTo"
          target="_blank"
          variant="outline"
          tone="neutral"
          size="sm"
        >
          <template #icon><Undo2 /></template>
          在编辑页处理
        </Button>
        <Button
          :as="NuxtLink"
          :to="editTo"
          target="_blank"
          variant="outline"
          tone="neutral"
          size="sm"
        >
          <template #icon><SquarePen /></template>
          修订此条目
        </Button>
      </Inline>
    </Inline>
    <Stack gap="xs" align="start">
      <Inline gap="sm" align="center">
        <RotateCcw class="size-4 text-muted" aria-hidden="true" />
        <Text as="span" size="sm" tone="muted">{{ display.title }} 的修订历史</Text>
      </Inline>
      <Heading :level="1" size="2xl">{{ display.title }}</Heading>
      <Text v-if="display.original_title" size="sm" tone="muted" lang="ja">
        {{ display.original_title }}
      </Text>
      <Text size="sm" tone="muted">共 {{ total }} 条修订记录</Text>
    </Stack>
  </Stack>
</template>

<script setup lang="ts">
  import { Alert, Button, Inline, Stack, Text } from '@hina-ui/vue'
  import { History } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { GalgameSnapshotPageData } from '~~/server/api/pages/galgames/[id]/revisions/[revision].get'
  import { revisionTime } from '~/features/entry/time'

  defineOptions({ name: 'GalgameHistorySnapshot' })
  defineProps<{ galgameId: number; data: GalgameSnapshotPageData }>()
</script>

<template>
  <Stack gap="none">
    <Stack gap="none" class="mx-auto w-full max-w-(--entry-container) px-4 pt-6 lg:px-6">
      <Alert tone="info">
        <Inline gap="md" align="center" justify="between">
          <Stack gap="xs" class="min-w-0">
            <Text weight="medium">{{ revisionTime(data.revision.created_at) }} 的修订</Text>
            <Inline gap="none" align="center" class="gap-x-3 gap-y-1">
              <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
                <Avatar :user="data.revision.editor" size="sm" />
                <UserName :user="data.revision.editor" class="text-sm" />
              </Inline>
              <Text size="sm" tone="muted">{{ data.revision.summary }}</Text>
            </Inline>
          </Stack>
          <Inline gap="sm" align="center">
            <Button :as="NuxtLink" :to="`/galgames/${galgameId}`" size="sm">返回当前版本</Button>
            <Button
              :as="NuxtLink"
              :to="`/galgames/${galgameId}/revisions`"
              variant="outline"
              tone="neutral"
              size="sm"
            >
              <template #icon><History /></template>
              修订历史
            </Button>
          </Inline>
        </Inline>
      </Alert>
    </Stack>
    <GalgamePage :data="data" :galgame-id="galgameId" embedded inert />
  </Stack>
</template>

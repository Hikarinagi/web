<script setup lang="ts">
  import { Banner, Button, Inline, Link, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgameSnapshotPageData } from '~~/server/api/pages/galgames/[id]/revisions/[revision].get'
  import { revisionTime } from '~/features/entry/time'

  defineOptions({ name: 'GalgameHistorySnapshot' })
  defineProps<{ galgameId: number; data: GalgameSnapshotPageData }>()
</script>

<template>
  <Stack gap="none">
    <Banner tone="info">
      {{ revisionTime(data.revision.created_at) }} 的修订
      <Inline
        as="span"
        gap="sm"
        align="center"
        :wrap="false"
        class="mx-2 inline-flex max-w-full align-middle"
      >
        <Avatar :user="data.revision.editor" size="sm" />
        <UserName
          :user="data.revision.editor"
          class="text-sm"
          handle-class="text-inherit opacity-80"
        />
      </Inline>
      {{ data.revision.summary }}
      <Link :as="NuxtLink" :to="`/galgames/${galgameId}/revisions`" underline class="ms-2">
        修订历史
      </Link>
      <template #actions>
        <Button :as="NuxtLink" :to="`/galgames/${galgameId}`" size="sm" tone="neutral">
          返回当前版本
        </Button>
      </template>
    </Banner>
    <GalgamePage
      :data="data"
      :galgame-id="galgameId"
      embedded
      inert
      class="[--app-header-height:0px]"
    />
  </Stack>
</template>

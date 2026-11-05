<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import type { WorkbenchPageData } from '~~/server/api/pages/create/wiki/index.get'

  defineOptions({ name: 'WikiHomeBoard' })

  defineProps<{ data: WorkbenchPageData }>()
  const { canAny } = useCreatorPermissions()
</script>

<template>
  <Stack gap="lg">
    <WikiHomeDrafts />
    <WikiHomeRecent />
    <WikiHomeChanges
      v-if="canAny(WIKI_PERMISSIONS.PATROL)"
      title="未检查的修改"
      :items="data.unchecked.items"
      :total="data.unchecked.meta.total_items"
      filter="unchecked"
      empty="修改都已检查"
    />
    <WikiHomeChanges
      title="我关注的条目最近的修改"
      :items="data.watched.items"
      filter="watched"
      empty="关注的条目暂无新修改"
    />
    <WikiHomeChanges
      title="全站最近的修改"
      :items="data.recent.items"
      filter="all"
      empty="暂无修改"
    />
  </Stack>
</template>

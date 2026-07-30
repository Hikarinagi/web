<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { platformLabel } from '~/features/galgame/platforms'
  import { devStatusLabel } from '~/features/galgame/labels'

  const props = defineProps<{
    galgame: GalgamePageData['galgame']
  }>()

  // 99% 是「已发售」(和发售日重复),只在 开发中 / 开发终止 时出状态 badge
  const devStatus = computed(() => {
    const status = props.galgame.dev_status
    if (!status || status === 'RELEASED') return null
    return { label: devStatusLabel(status), severity: status === 'CANCELLED' ? 'danger' : 'warn' }
  })
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
    <Tag v-if="devStatus" :value="devStatus.label" :severity="devStatus.severity" />
    <Tag v-if="galgame.nsfw" value="NSFW" severity="danger" />
    <Tag v-if="galgame.adv_type" :value="galgame.adv_type" severity="info" />
    <Tag
      v-for="platform in galgame.platforms"
      :key="platform"
      :value="platformLabel(platform)"
      severity="secondary"
    />
    <Tag v-if="!galgame.platforms.length" value="PC" severity="secondary" />
  </div>
</template>

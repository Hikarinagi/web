<script setup lang="ts">
  import { Inline, Tag } from '@hina-ui/vue'
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
    return {
      label: devStatusLabel(status),
      tone: status === 'CANCELLED' ? ('danger' as const) : ('warning' as const),
    }
  })
</script>

<template>
  <Inline gap="sm" align="center" justify="center" wrap class="lg:justify-start">
    <Tag v-if="devStatus" :tone="devStatus.tone" size="md">{{ devStatus.label }}</Tag>
    <Tag v-if="galgame.nsfw" tone="danger" size="md">NSFW</Tag>
    <Tag v-if="galgame.adv_type" tone="info" size="md">{{ galgame.adv_type }}</Tag>
    <Tag v-for="platform in galgame.platforms" :key="platform" tone="neutral" size="md">
      {{ platformLabel(platform) }}
    </Tag>
    <Tag v-if="!galgame.platforms.length" tone="neutral" size="md">PC</Tag>
  </Inline>
</template>

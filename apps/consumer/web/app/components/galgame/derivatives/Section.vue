<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameDerivativesSection' })
  const props = defineProps<{
    galgameId: number
    relations: GalgamePageData['relations']
    merchs: GalgamePageData['merchs']
    links: GalgamePageData['links']
  }>()

  const auth = useAuthStore()
  // 三个分组都为空时对游客隐藏整个板块;登录用户保留板块以提供添加入口
  const isEmpty = computed(
    () =>
      !props.relations.length &&
      !props.merchs.length &&
      !props.links.length &&
      !auth.isAuthenticated,
  )
</script>

<template>
  <GalgameSection v-if="!isEmpty" title="衍生">
    <GalgameDerivativesRelationsGroup :relations="relations" />
    <GalgameDerivativesMerchandiseGroup :items="merchs" :galgame-id="galgameId" />
    <GalgameDerivativesLinksGroup :items="links" :galgame-id="galgameId" />
  </GalgameSection>
</template>

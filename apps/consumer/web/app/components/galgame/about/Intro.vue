<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { tagRoute } from '~/features/galgame/explore'

  defineOptions({ name: 'GalgameAboutIntro' })
  const props = defineProps<{
    galgame: GalgamePageData['galgame']
    tags: GalgamePageData['tags']
  }>()

  const primary = computed(() => props.galgame.trans_intro || props.galgame.origin_intro)
  const jp = computed(() =>
    props.galgame.trans_intro &&
    props.galgame.origin_intro &&
    props.galgame.origin_intro !== props.galgame.trans_intro
      ? props.galgame.origin_intro
      : '',
  )
  const tagLinks = computed(() =>
    props.tags.map(item => ({
      id: item.tag.id,
      name: item.tag.name,
      to: tagRoute(item.tag.id),
    })),
  )
</script>

<template>
  <Stack gap="none" class="min-w-0 flex-1 gap-5">
    <WorkIntro :text="primary" :original="jp" />
    <WorkTagLinks :tags="tagLinks" />
  </Stack>
</template>

<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { tagRoute } from '~/features/light-novel/explore'

  defineOptions({ name: 'LightNovelAboutIntro' })
  const props = defineProps<{
    lightNovel: LightNovelPageData['light_novel']
    tags: LightNovelPageData['tags']
  }>()

  const primary = computed(() => props.lightNovel.summary_cn || props.lightNovel.summary)
  const jp = computed(() =>
    props.lightNovel.summary_cn &&
    props.lightNovel.summary &&
    props.lightNovel.summary !== props.lightNovel.summary_cn
      ? props.lightNovel.summary
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

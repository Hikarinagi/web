<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { getLightNovelVolumeCover } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelHeroCoverStack' })
  const props = defineProps<{
    volumes: LightNovelPageData['volumes']
    fallback: LightNovelPageData['light_novel']['covers'][number]['media'] | null
    title: string
  }>()

  const covers = computed(() => {
    const items = props.volumes.slice(-3).map(getLightNovelVolumeCover)
    return items.length ? items : [props.fallback]
  })
  const front = computed(() => covers.value.at(-1) ?? null)
  const middle = computed(() => (covers.value.length > 1 ? covers.value.at(-2) : null))
  const back = computed(() => (covers.value.length > 2 ? covers.value[0] : null))
</script>

<template>
  <Stack
    gap="none"
    class="relative mt-3 mr-3 w-(--stack-cover-sm) shrink-0 lg:mt-4 lg:mr-4 lg:w-(--stack-cover)"
  >
    <EntryBookCover
      v-if="back"
      :media="back"
      alt=""
      :lazy="false"
      class="absolute! inset-0 translate-x-3 -translate-y-3 brightness-75 lg:translate-x-4 lg:-translate-y-4"
    />
    <EntryBookCover
      v-if="middle"
      :media="middle"
      alt=""
      :lazy="false"
      class="absolute! inset-0 translate-x-1.5 -translate-y-1.5 brightness-90 lg:translate-x-2 lg:-translate-y-2"
    />
    <EntryBookCover :media="front" :alt="`${title} 封面`" :lazy="false" class="shadow-2xl" />
  </Stack>
</template>

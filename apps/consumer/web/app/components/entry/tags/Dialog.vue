<script setup lang="ts">
  import { Button as HnButton, Dialog, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import type { WorkTagResource } from '~/features/entry/tags'
  import type { WorkTagsControl } from '~/features/entry/useWorkTags'

  type SimilarPath = '/api/v3/galgames/{id}/tags/similar'

  defineOptions({ name: 'EntryTagsDialog' })
  const props = defineProps<{
    control: WorkTagsControl
    resource: WorkTagResource
    workId: number
    cast: { name: string; names: string[] }[]
    castSection: string
  }>()
  const open = defineModel<boolean>('open', { required: true })

  const similar = ref<{ id: number; name: string; works: number }[]>([])
  const { y } = useWindowScroll({ behavior: 'smooth' })

  watch(open, async next => {
    if (!next || similar.value.length) return
    similar.value = await hikariRequest<SimilarPath, 'get'>(
      `/api/v3/${props.resource}/{id}/tags/similar` as SimilarPath,
      { method: 'get', path: { id: props.workId } },
    )
  })

  function jump(target: string) {
    open.value = false
    if (target === 'top') y.value = 0
    else
      void navigateTo({
        hash: `#${target === 'cast' ? props.castSection : target}`,
        replace: true,
      })
  }
</script>

<template>
  <Dialog v-model:open="open" title="标签" size="md">
    <template #content>
      <Stack gap="lg">
        <Stack gap="xs">
          <Inline gap="sm" align="baseline">
            <Heading :level="3" size="sm">此作品的标签</Heading>
            <Text size="sm" tone="muted" class="tabular-nums">{{ control.all.value.length }}</Text>
          </Inline>
          <EntryTagsRows :control="control" />
        </Stack>
        <EntryTagsSearch :control="control" :cast="cast" @go="jump" />
        <EntryTagsSimilar v-if="similar.length" :control="control" :items="similar" />
      </Stack>
    </template>
    <template #footer>
      <HnButton @click="open = false">完成</HnButton>
    </template>
  </Dialog>
</template>

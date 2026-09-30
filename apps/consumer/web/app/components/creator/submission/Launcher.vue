<script setup lang="ts">
  import { Panel, SimpleGrid, Stack } from '@hina-ui/vue'
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'
  import { useNovelIntake } from '~/features/contribute/useNovelIntake'
  import NovelSlip from '~/components/contribute/novel/Slip.vue'

  defineProps<{ data: ContributePageData }>()

  const intake = useNovelIntake()
  const zone = useTemplateRef<{ $el: HTMLElement }>('zone')
  const slip = useTemplateRef<InstanceType<typeof NovelSlip>>('slip')
  const { isOverDropZone: dragging } = useDropZone(
    computed(() => zone.value?.$el),
    { multiple: true, onDrop: files => slip.value?.receive(files ?? []) },
  )
</script>

<template>
  <Stack gap="lg">
    <SimpleGrid min="var(--contribute-column-min)" gap="lg" class="items-start">
      <Panel ref="zone" title="投稿轻小说分卷">
        <NovelSlip ref="slip" :intake="intake" :dragging="dragging" />
      </Panel>
      <Panel title="投稿漫画章节">
        <ContributeMangaSlip :series="data.manga" />
      </Panel>
    </SimpleGrid>
    <Panel title="正在征集">
      <SimpleGrid min="var(--contribute-column-min)" gap="xl" class="items-start">
        <ContributeNovelList title="小说" :volumes="data.volumes" :target="data.target" />
        <ContributeMangaList title="漫画" :chapters="data.chapters" />
      </SimpleGrid>
    </Panel>
  </Stack>
</template>

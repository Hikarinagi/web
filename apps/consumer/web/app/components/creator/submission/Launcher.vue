<script setup lang="ts">
  import { Button, Panel, SimpleGrid, Stack } from '@hina-ui/vue'
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'
  import { useNovelIntake } from '~/features/contribute/useNovelIntake'
  import MangaStartForm from '~/components/contribute/manga/StartForm.vue'
  import NovelUpload from '~/components/contribute/upload/Novel.vue'

  defineProps<{ data: ContributePageData }>()

  const intake = useNovelIntake()
  const zone = useTemplateRef<{ $el: HTMLElement }>('zone')
  const upload = useTemplateRef<InstanceType<typeof NovelUpload>>('upload')
  const form = useTemplateRef<InstanceType<typeof MangaStartForm>>('form')
  const { isOverDropZone: dragging } = useDropZone(
    computed(() => zone.value?.$el),
    { multiple: true, onDrop: files => upload.value?.receive(files ?? []) },
  )
</script>

<template>
  <Stack gap="lg">
    <SimpleGrid min="var(--contribute-column-min)" gap="lg" class="items-start">
      <Panel ref="zone" title="上传 EPUB">
        <NovelUpload ref="upload" :intake="intake" :dragging="dragging" />
      </Panel>
      <Panel title="投稿漫画章节">
        <Stack gap="md">
          <MangaStartForm ref="form" :series="data.manga" />
          <Button :loading="form?.submitting" :disabled="!form?.ready" @click="form?.submit()">
            开始
          </Button>
        </Stack>
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

<script setup lang="ts">
  import { Button, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { SEGMENT_STATE_META } from '~/features/workbench/labels'
  import { useMangaEditor } from '~/features/workbench/manga/composables/editor-context'
  import type { EditableRegion } from '~/features/workbench/manga/composables/useMangaRegions'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'

  const props = defineProps<{
    project: BackendMangaProject
    region: EditableRegion
    index: number
    total: number
    lang?: string
  }>()

  const { store } = useMangaEditor()
  const busy = ref(false)
  const editable = computed(() => ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status))
  const can = (capability: BackendMangaProject['viewer_capabilities'][number]) =>
    editable.value && props.project.viewer_capabilities.includes(capability)
  const state = computed(() => SEGMENT_STATE_META[props.region.state])

  async function act(action: () => Promise<unknown>) {
    if (busy.value) return
    busy.value = true
    try {
      await action()
      await store.reload(props.region.page_id)
    } finally {
      busy.value = false
    }
  }

  const select = (translationId: number) =>
    act(() =>
      hikariRequest('/api/v3/manga-region-translations/{translation_id}/select', {
        method: 'post',
        path: { translation_id: translationId },
      }),
    )
  const setState = (value: 10 | 30) =>
    act(() =>
      hikariRequest('/api/v3/manga-text-regions/{region_id}/state', {
        method: 'put',
        path: { region_id: props.region.id },
        body: { state: value },
      }),
    )
</script>

<template>
  <Stack gap="md" class="p-4">
    <Inline gap="sm" align="center" :wrap="false">
      <Text size="sm" weight="semibold" class="tabular-nums">
        文本框 {{ index + 1 }} / {{ total }}
      </Text>
      <Tag size="sm" :tone="state?.tone ?? 'neutral'">{{ state?.label }}</Tag>
    </Inline>
    <Text size="sm" tone="muted" :lang="lang" class="whitespace-pre-wrap">
      {{ region.source_text || '（空）' }}
    </Text>
    <Stack v-if="region.translations.length" gap="md">
      <WorkbenchMangaSideCandidate
        v-for="row in region.translations"
        :key="row.id"
        :translation="row"
        :can-proofread="can('proofread')"
        :busy="busy"
        @select="select(row.id)"
        @changed="store.reload(region.page_id)"
      />
    </Stack>
    <Text v-else size="sm" tone="faint">尚未翻译</Text>
    <Inline v-if="can('finalize') && region.translations.length" gap="xs" justify="end">
      <Button size="sm" variant="ghost" tone="danger" :disabled="busy" @click="setState(10)">
        标记需修改
      </Button>
      <Button
        size="sm"
        variant="soft"
        :disabled="busy || region.state === 30"
        @click="setState(30)"
      >
        定稿
      </Button>
    </Inline>
    <WorkbenchMangaSideNotes
      :region-id="region.id"
      :persisted="region.persisted"
      :member="project.viewer_role !== null"
    />
  </Stack>
</template>

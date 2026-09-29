<script setup lang="ts">
  import {
    Button,
    Checkbox,
    Inline,
    Splitter,
    SplitterHandle,
    SplitterPanel,
    Stack,
    Text,
    toast,
  } from '@hina-ui/vue'
  import { useMediaQuery } from '@vueuse/core'
  import { useImportOutline } from '~/features/workbench/composables/useImportOutline'
  import type { BackendNovelProject, NovelImportDraft } from '~/features/workbench/workbench'

  const props = defineProps<{
    project: BackendNovelProject
    draft: NovelImportDraft
    existing: number
  }>()
  const emit = defineEmits<{ cancel: []; imported: [] }>()

  const { confirm } = useHikariConfirm()
  const outline = useImportOutline(props.draft.preview)
  const { chapters, current, stats, total, payload } = outline
  const chapter = computed(() => chapters.value[current.value])
  const replace = ref(false)
  const wide = useMediaQuery('(min-width: 1024px)', { ssrWidth: 1440 })
  const submitting = ref(false)

  async function run() {
    submitting.value = true
    try {
      const path = { project_id: props.project.id }
      const chosen = { replace: replace.value, chapters: payload.value }
      let result
      if (props.draft.file) {
        const body = new FormData()
        body.append('file', props.draft.file)
        body.append('replace', String(chosen.replace))
        body.append('chapters', JSON.stringify(chosen.chapters))
        result = await hikariRequest('/api/v3/novel-projects/{project_id}/import', {
          method: 'POST',
          path,
          body,
        })
      } else {
        result = await hikariRequest('/api/v3/novel-projects/{project_id}/import/current', {
          method: 'POST',
          path,
          body: chosen,
        })
      }
      toast.success(
        `导入了 ${result.chapters} 个章节、${result.segments} 个段落和 ${result.images} 幅插图。`,
      )
      emit('imported')
    } finally {
      submitting.value = false
    }
  }

  function submit() {
    if (submitting.value || !payload.value.length) return
    if (!replace.value) return void run()
    confirm({
      title: '替换现有章节',
      description: `现有的 ${props.existing} 个章节及其段落、译文和批注将被删除，然后导入 ${total.value.chapters} 个新章节。此操作无法撤消。`,
      confirmText: '替换并导入',
      cancelText: '取消',
      tone: 'danger',
      onConfirm: run,
    })
  }
</script>

<template>
  <Stack gap="none" class="min-h-0">
    <Inline
      gap="md"
      align="center"
      :wrap="false"
      class="min-h-14 shrink-0 border-b border-line bg-surface px-5 py-2"
    >
      <Stack gap="none" class="min-w-0">
        <Text size="sm" weight="semibold" truncate>导入预览：{{ draft.name }}</Text>
        <Text size="xs" tone="muted" class="tabular-nums">
          将导入 {{ total.chapters }} 个章节、{{ total.texts }} 个段落和 {{ total.images }} 幅插图
        </Text>
      </Stack>
      <Inline gap="sm" align="center" justify="end" :wrap="false" class="flex-1">
        <Checkbox v-if="existing" v-model="replace" size="sm" :disabled="submitting">
          替换现有的 {{ existing }} 章
        </Checkbox>
        <Button
          size="sm"
          variant="ghost"
          tone="neutral"
          :disabled="submitting"
          class="max-md:hidden"
          @click="outline.reset()"
        >
          恢复默认设置
        </Button>
        <Button
          size="sm"
          variant="outline"
          tone="neutral"
          :disabled="submitting"
          @click="emit('cancel')"
        >
          取消
        </Button>
        <Button size="sm" :loading="submitting" :disabled="!payload.length" @click="submit">
          导入
        </Button>
      </Inline>
    </Inline>
    <Splitter
      :key="String(wide)"
      :direction="wide ? 'horizontal' : 'vertical'"
      :auto-save-id="wide ? 'workbench-novel-import' : 'workbench-novel-import-narrow'"
      class="min-h-0 flex-1"
    >
      <SplitterPanel :default-size="wide ? 26 : 35" :min-size="16" :max-size="wide ? 40 : 60">
        <WorkbenchNovelImportOutline
          :chapters="chapters"
          :stats="stats"
          :current="current"
          :class="wide ? 'border-r border-line' : 'border-b border-line'"
          @select="current = $event"
          @toggle="outline.toggle"
        />
      </SplitterPanel>
      <SplitterHandle label="调整章节列表宽度" />
      <SplitterPanel :default-size="wide ? 74 : 65">
        <WorkbenchNovelImportChapter
          v-if="chapter"
          :key="chapter.from"
          :blocks="draft.preview.blocks"
          :chapter="chapter"
          :first="current === 0"
          :stats="stats[current] ?? { texts: 0, images: 0 }"
          :can-split="outline.canSplit"
          :lang="project.source_lang ?? undefined"
          @split="outline.split"
          @merge="outline.mergeUp(current)"
          @rename="title => outline.rename(current, title)"
          @toggle="value => outline.toggle(current, value)"
        />
      </SplitterPanel>
    </Splitter>
  </Stack>
</template>

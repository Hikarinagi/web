<script setup lang="ts">
  import { Button, IconButton, Inline, Stack, Tag, Text, Textarea } from '@hina-ui/vue'
  import { ArrowDown, ArrowUp, Trash2, Undo2 } from '@lucide/vue'
  import { SEGMENT_STATE_META } from '~/features/workbench/labels'
  import { useMangaEditor } from '~/features/workbench/manga/composables/editor-context'
  import type { EditableRegion } from '~/features/workbench/manga/composables/useMangaRegions'
  import { useRegionLock } from '~/features/workbench/manga/composables/useRegionLock'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'

  const props = defineProps<{
    project: BackendMangaProject
    region: EditableRegion
    index: number
    total: number
    lang?: string
  }>()
  const emit = defineEmits<{ advance: [direction: 1 | -1] }>()

  const auth = useAuthStore()
  const { store, translations } = useMangaEditor()
  const lock = useRegionLock()
  const input = useTemplateRef<{ focus: () => void }>('input')
  let refocus = false

  const editable = computed(() => ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status))
  const can = (capability: BackendMangaProject['viewer_capabilities'][number]) =>
    editable.value && props.project.viewer_capabilities.includes(capability)
  const locked = computed(
    () =>
      !!props.region.locked_by &&
      props.region.locked_by !== auth.user?.id &&
      new Date(props.region.lock_expires_at ?? 0).getTime() > Date.now(),
  )
  const mine = computed(() => translations.mine(props.region))
  const text = computed(() => translations.textOf(props.region))
  const machineText = computed(() => mine.value?.machine_text ?? null)
  const others = computed(() =>
    props.region.translations.filter(row => row.user.id !== auth.user?.id),
  )
  const state = computed(() => SEGMENT_STATE_META[props.region.state])

  function onKeydown(event: KeyboardEvent) {
    const commit = (event.ctrlKey || event.metaKey) && event.key === 'Enter'
    const step = event.altKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')
    if (!commit && !step) return
    event.preventDefault()
    void translations.save(props.region.id)
    refocus = true
    emit('advance', event.key === 'ArrowUp' ? -1 : 1)
    void nextTick(() => {
      refocus = false
    })
  }

  function adopt(value: string) {
    translations.edit(props.region.id, value)
    void translations.save(props.region.id)
  }

  watch(
    () => props.region.id,
    async () => {
      void lock.release()
      if (!refocus) return
      refocus = false
      await nextTick()
      input.value?.focus()
    },
  )
</script>

<template>
  <Stack gap="md" class="p-4">
    <Inline gap="sm" align="center" justify="between" :wrap="false">
      <Inline gap="sm" align="center" :wrap="false">
        <Text size="sm" weight="semibold" class="tabular-nums">
          文本框 {{ index + 1 }} / {{ total }}
        </Text>
        <Tag size="sm" :tone="state?.tone ?? 'neutral'">{{ state?.label }}</Tag>
      </Inline>
      <Inline v-if="can('label')" gap="none" :wrap="false">
        <IconButton
          label="前移"
          variant="ghost"
          tone="neutral"
          size="sm"
          :disabled="index === 0 || locked"
          @click="store.move(region.id, -1)"
        >
          <ArrowUp />
        </IconButton>
        <IconButton
          label="后移"
          variant="ghost"
          tone="neutral"
          size="sm"
          :disabled="index === total - 1 || locked"
          @click="store.move(region.id, 1)"
        >
          <ArrowDown />
        </IconButton>
        <IconButton
          label="删除文本框"
          variant="ghost"
          tone="danger"
          size="sm"
          :disabled="locked"
          @click="store.remove(region.id)"
        >
          <Trash2 />
        </IconButton>
      </Inline>
    </Inline>

    <WorkbenchMangaSideSource
      :key="region.id"
      :region="region"
      :editable="can('label')"
      :locked="locked"
      :labelplus="project.mode === 'TRANSLATION'"
      :lang="lang"
      @update="(patch, id) => store.update(id, patch)"
      @focus="region.persisted && lock.acquire(region.id)"
    />

    <Text v-if="!region.persisted" size="sm" tone="muted">保存文本框后，你可以输入译文。</Text>
    <Stack v-else-if="can('translate')" gap="xs">
      <Inline gap="xs" align="center">
        <Text size="sm" weight="medium">我的译文</Text>
        <Tag v-if="mine?.machine" size="sm" tone="warning" variant="outline"
          >未经修改的 AI 翻译</Tag
        >
        <Tag v-if="translations.states.get(region.id) === 'error'" size="sm" tone="danger">
          保存失败
        </Tag>
      </Inline>
      <Textarea
        ref="input"
        :model-value="text"
        :autosize="{ minRows: 2 }"
        placeholder="尚未翻译"
        aria-label="我的译文"
        @update:model-value="value => translations.edit(region.id, value ?? '')"
        @blur="translations.save(region.id)"
        @keydown="onKeydown"
      />
      <Button
        v-if="machineText && machineText !== text"
        size="sm"
        variant="ghost"
        tone="neutral"
        class="self-start"
        @click="adopt(machineText)"
      >
        <template #icon><Undo2 /></template>
        恢复机翻
      </Button>
    </Stack>

    <Stack v-if="others.length" gap="sm">
      <Text size="sm" weight="medium">其他成员的译文</Text>
      <Stack v-for="row in others" :key="row.id" gap="xs">
        <Inline gap="xs" align="center" justify="between" :wrap="false">
          <UserName :user="row.user" :handle="false" class="text-sm" />
          <Button
            v-if="region.persisted && can('translate')"
            size="sm"
            variant="ghost"
            @click="adopt(row.proofread_text ?? row.text)"
          >
            引用
          </Button>
        </Inline>
        <Text size="sm" class="whitespace-pre-wrap">{{ row.proofread_text ?? row.text }}</Text>
      </Stack>
    </Stack>

    <WorkbenchMangaSideNotes
      :region-id="region.id"
      :persisted="region.persisted"
      :member="project.viewer_role !== null"
    />
  </Stack>
</template>

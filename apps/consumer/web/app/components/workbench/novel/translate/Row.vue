<script setup lang="ts">
  import { Inline, Stack, Tag, Text, Textarea } from '@hina-ui/vue'
  import { Circle, ImageIcon, Minus } from '@lucide/vue'
  import type { components } from '@hikarinagi/api-contract/v3'
  import type { SaveState } from '~/features/workbench/composables/useTranslationEditor'
  import type { BackendNovelSegment, BackendNovelTerm } from '~/features/workbench/workbench'
  import { displayName } from '~/utils/user'

  const props = defineProps<{
    segment: BackendNovelSegment
    number: number | null
    text: string
    machine: boolean
    save?: SaveState
    issues?: components['schemas']['NovelQaIssueDto'][]
    terms: BackendNovelTerm[]
    readonly: boolean
    active: boolean
    editors?: components['schemas']['UserRefDto'][]
  }>()
  const emit = defineEmits<{
    update: [text: string]
    focus: []
    blur: []
    move: [target: 'next' | 'prev' | 'empty']
  }>()

  const input = useTemplateRef<InstanceType<typeof Textarea>>('input')

  function insertTag(open: string, close: string) {
    const element = input.value?.input
    if (!element) return
    const { selectionStart: start, selectionEnd: end, value } = element
    emit(
      'update',
      value.slice(0, start) + open + value.slice(start, end) + close + value.slice(end),
    )
    void nextTick(() => {
      element.focus()
      element.setSelectionRange(start + open.length, end + open.length)
    })
  }

  function onClick(event: MouseEvent) {
    if (props.readonly) return emit('focus')
    if ((event.target as HTMLElement).closest('textarea, button, a, [role="button"]')) return
    if (!window.getSelection()?.isCollapsed) return
    const element = input.value?.input
    if (!element) return
    element.focus()
    element.setSelectionRange(element.value.length, element.value.length)
  }

  const dot = computed(() => {
    if (props.segment.state === 10) return 'fill-danger text-danger'
    if (props.machine) return 'fill-warning text-warning'
    if (props.segment.state >= 20) return 'fill-success text-success'
    return 'text-faint'
  })

  function onKeydown(event: KeyboardEvent) {
    const commit = (event.ctrlKey || event.metaKey) && event.key === 'Enter'
    if (commit) {
      event.preventDefault()
      emit('move', event.shiftKey ? 'empty' : 'next')
    } else if (event.altKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault()
      emit('move', event.key === 'ArrowDown' ? 'next' : 'prev')
    } else if (event.key === 'Escape') {
      ;(event.target as HTMLElement).blur()
    }
  }
</script>

<template>
  <Inline
    v-if="segment.kind !== 'TEXT'"
    gap="lg"
    :wrap="false"
    class="border-b border-line px-5 py-2"
  >
    <Inline class="w-6 shrink-0" aria-hidden="true" />
    <Inline
      gap="sm"
      align="center"
      class="flex-1 rounded-md border border-dashed border-line-strong bg-subtle px-3 py-2 text-muted"
    >
      <ImageIcon v-if="segment.kind === 'IMAGE'" class="size-4" aria-hidden="true" />
      <Minus v-else class="size-4" aria-hidden="true" />
      <Text size="xs" tone="muted">{{ segment.kind === 'IMAGE' ? '插图' : '分隔' }}</Text>
    </Inline>
  </Inline>
  <Inline
    v-else
    gap="lg"
    align="start"
    :wrap="false"
    :role="readonly ? 'button' : undefined"
    :tabindex="readonly ? 0 : undefined"
    :aria-label="readonly ? `选择第 ${number} 段` : undefined"
    :class="
      cn(
        'border-b border-line px-5 py-3.5',
        active && 'bg-accent-soft/40',
        readonly ? 'hn-state-layer hn-interactive' : 'cursor-text',
      )
    "
    @click="onClick"
    @keydown.enter="readonly && emit('focus')"
  >
    <Stack gap="xs" align="center" class="w-6 shrink-0">
      <Inline gap="sm" align="center" :wrap="false" class="h-7">
        <Circle :class="cn('size-2 shrink-0', dot)" aria-hidden="true" />
        <Text
          as="span"
          size="xs"
          :tone="active ? 'accent' : 'faint'"
          :weight="active ? 'semibold' : 'normal'"
          class="tabular-nums"
        >
          {{ number }}
        </Text>
      </Inline>
      <AvatarStack
        v-if="editors?.length"
        v-tooltip="`${editors.map(user => displayName(user)).join('、')}正在编辑`"
        :users="editors"
        :max="1"
        size="sm"
      />
    </Stack>
    <Inline
      gap="lg"
      align="start"
      :wrap="false"
      class="min-w-0 flex-1 max-lg:flex-col max-lg:gap-2"
    >
      <WorkbenchMarkupText
        :text="segment.text ?? ''"
        :terms="terms"
        :tags="segment.tags"
        tagged
        lang="ja"
        class="min-w-0 flex-1 max-lg:w-full max-lg:text-muted"
      />
      <Stack gap="xs" class="min-w-0 flex-1 max-lg:w-full">
        <WorkbenchMarkupText v-if="readonly && text" :text="text" :tags="segment.tags" tagged />
        <Text v-else-if="readonly" tone="faint" class="leading-loose">尚未翻译</Text>
        <Textarea
          v-else
          ref="input"
          :model-value="text"
          variant="bare"
          :autosize="{ minRows: 1 }"
          :data-segment-input="segment.id"
          :aria-label="`第 ${number} 段译文`"
          placeholder="尚未翻译"
          :class="cn('p-0 leading-loose', machine && !active && 'text-muted')"
          @update:model-value="value => emit('update', value ?? '')"
          @focus="emit('focus')"
          @blur="emit('blur')"
          @keydown="onKeydown"
        />
        <WorkbenchNovelTranslateTagBar
          v-if="active && !readonly && segment.tags.length"
          :source="segment.text ?? ''"
          :tags="segment.tags"
          @insert="insertTag"
        />
        <Inline
          v-if="machine || segment.state === 10 || save === 'error' || issues?.length"
          gap="xs"
          align="center"
        >
          <Tag v-if="segment.state === 10" size="sm" tone="danger">需修改</Tag>
          <Tag v-if="machine" size="sm" tone="warning" variant="outline">未经修改的 AI 翻译</Tag>
          <Tag v-if="save === 'error'" size="sm" tone="danger" variant="outline">保存失败</Tag>
          <Text
            v-for="(issue, i) in issues"
            :key="i"
            size="xs"
            :tone="issue.level === 'error' ? 'danger' : 'warning'"
          >
            {{ issue.message }}
          </Text>
        </Inline>
      </Stack>
    </Inline>
  </Inline>
</template>

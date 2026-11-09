<script setup lang="ts">
  import { Button, Empty, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { revisionTime } from '~/features/entry/time'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { ENTRY_PAGE } from '~/features/wiki/editor/page'
  import { HINT_KINDS, type WikiHint } from '~/features/wiki/hints'
  import { valueText } from '~/features/wiki/values'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiEditorSideHints' })

  const props = defineProps<{ entry: number; base: string }>()
  const emit = defineEmits<{ changed: [] }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const page = inject(ENTRY_PAGE)!
  const { accepting, accept } = useHintAcceptance(editor, async () => {
    emit('changed')
  })
  const focus = computed(() => (typeof route.query.focus === 'string' ? route.query.focus : ''))
  const subject = (hint: WikiHint) => hint.proposal ?? hint.statement
  const keyOf = (hint: WikiHint) => {
    const value = subject(hint)
    return value ? `${value.entry_id}|${value.property}` : `${hint.entries[0]?.id ?? ''}|`
  }
  const title = (hint: WikiHint) => {
    const value = subject(hint)
    if (!value) return hint.entries.map(item => item.label || '未命名').join('、')
    const type = editor.entries.value.get(value.entry_id)?.type
    const label =
      (type &&
        editor.definitions.value
          .get(type)
          ?.properties.find(item => item.property === value.property)?.label) ??
      value.property
    const owner =
      value.entry_id === props.entry ? '' : `${editor.entries.value.get(value.entry_id)?.label}：`
    return `${owner}${label}`
  }
  const before = (hint: WikiHint) =>
    hint.proposal?.current
      ? valueText(hint.proposal.current)
      : hint.statement
        ? valueText(hint.statement)
        : ''
</script>

<template>
  <Empty v-if="!page.hints.value.length" title="暂无待处理的建议" />
  <Stack v-else gap="sm">
    <Stack
      v-for="hint in page.hints.value"
      :key="hint.id"
      gap="sm"
      :class="
        cn(
          'min-w-0 rounded-md border border-line p-3',
          focus.includes('|') && keyOf(hint).startsWith(focus) && 'ring-2 ring-accent',
        )
      "
    >
      <Text size="xs" tone="muted" lang="ja">{{ title(hint) }}</Text>
      <WikiDiffText v-if="hint.proposal" :before="before(hint)" :after="valueText(hint.proposal)" />
      <Text v-else size="sm">{{ hint.problem || HINT_KINDS[hint.kind] }}</Text>
      <Text v-if="hint.proposal && hint.problem" size="xs" tone="muted">{{ hint.problem }}</Text>
      <Inline gap="sm" align="center" justify="between" :wrap="false">
        <Stack gap="none" class="min-w-0">
          <Inline gap="xs" align="center" :wrap="false" class="min-w-0">
            <Avatar :user="hint.created_by" size="sm" />
            <UserName :user="hint.created_by" class="text-xs" />
          </Inline>
          <Text size="xs" tone="muted">{{ revisionTime(hint.created_at) }}</Text>
        </Stack>
        <Inline gap="sm" align="center" :wrap="false" class="shrink-0">
          <Link
            :as="NuxtLink"
            :to="{
              path: base,
              query: { ...route.query, panel: 'dismiss', hint: String(hint.id) },
            }"
            class="text-sm"
          >
            驳回
          </Link>
          <Button
            v-if="hint.suggestion"
            size="xs"
            variant="soft"
            :loading="accepting === hint.id"
            :disabled="accepting !== null"
            @click="accept(hint)"
          >
            采纳
          </Button>
        </Inline>
      </Inline>
    </Stack>
  </Stack>
</template>

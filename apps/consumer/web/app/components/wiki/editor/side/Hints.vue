<script setup lang="ts">
  import {
    Button,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Empty,
    Inline,
    Skeleton,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { revisionTime } from '~/features/entry/time'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { HINT_KINDS, type WikiHint } from '~/features/wiki/hints'
  import { valueText } from '~/features/wiki/values'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiEditorSideHints' })

  const props = defineProps<{ entry: number; base: string }>()
  const emit = defineEmits<{ changed: [] }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const { data, status, refresh } = useEntryHints(props.entry)
  const { accepting, accept } = useHintAcceptance(editor, async () => {
    await refresh()
    emit('changed')
  })
  const focus = computed(() => Number(route.query.focus))
  const owner = (id: number) =>
    id === props.entry ? null : (editor.entries.value.get(id)?.label ?? null)
  const others = (hint: WikiHint) =>
    hint.entries.filter(item => item.id !== props.entry).map(item => item.label || '未命名')
</script>

<template>
  <Stack v-if="!data && status !== 'success' && status !== 'error'" gap="md">
    <Skeleton v-for="index in 3" :key="index" class="h-14" />
  </Stack>
  <Empty v-else-if="!data?.items.length" title="暂无建议" />
  <Stack v-else gap="lg">
    <Stack
      v-for="hint in data.items"
      :key="hint.id"
      gap="xs"
      :class="
        cn(
          'min-w-0 rounded-sm',
          (hint.proposal?.current?.id ?? hint.statement?.id) === focus && 'bg-accent-soft p-2',
        )
      "
    >
      <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
        <Avatar :user="hint.created_by" size="sm" />
        <UserName :user="hint.created_by" class="text-sm" />
      </Inline>
      <Text size="sm">{{ hint.problem || HINT_KINDS[hint.kind] }}</Text>
      <Text v-if="hint.statement && !hint.proposal" size="sm" tone="muted">
        {{ valueText(hint.statement) }}
      </Text>
      <Text v-if="others(hint).length" size="sm" tone="muted">{{ others(hint).join('、') }}</Text>
      <DescriptionList v-if="hint.proposal" orientation="horizontal" class="min-w-0 text-sm">
        <template v-if="owner(hint.proposal.entry_id)">
          <DescriptionTerm>条目</DescriptionTerm>
          <DescriptionDetails>{{ owner(hint.proposal.entry_id) }}</DescriptionDetails>
        </template>
        <DescriptionTerm>现值</DescriptionTerm>
        <DescriptionDetails>
          {{ hint.proposal.current ? valueText(hint.proposal.current) : '无' }}
        </DescriptionDetails>
        <DescriptionTerm>建议</DescriptionTerm>
        <DescriptionDetails>{{ valueText(hint.proposal) }}</DescriptionDetails>
      </DescriptionList>
      <Inline gap="sm" align="center">
        <Button
          v-if="hint.suggestion"
          size="sm"
          :loading="accepting === hint.id"
          :disabled="accepting !== null"
          @click="accept(hint)"
        >
          采纳
        </Button>
        <Button
          size="sm"
          variant="ghost"
          tone="neutral"
          @click="
            navigateTo({ path: `${base}/suggestions/${hint.id}/dismiss`, query: route.query })
          "
        >
          驳回
        </Button>
        <Text as="span" size="xs" tone="muted" class="ml-auto">
          {{ revisionTime(hint.created_at) }}
        </Text>
      </Inline>
    </Stack>
  </Stack>
</template>

<script setup lang="ts">
  import { Button, Inline, Stack, Text } from '@hina-ui/vue'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import type { WorkingValue } from '~/features/wiki/editor/working'
  import { qualifierText, valueText } from '~/features/wiki/values'

  defineOptions({ name: 'WikiFieldChange' })

  const props = defineProps<{ item: WorkingValue; long: boolean; image: boolean }>()
  const emit = defineEmits<{ revert: [] }>()

  const compare = ref(false)
  const disclosed = computed(() => {
    const before = props.item.before
    return props.item.state === 'changed' &&
      before &&
      before.is_public !== props.item.value.is_public
      ? before.is_public
        ? '公开'
        : '未公开'
      : null
  })
  const describe = (value: ValueDraft) => {
    const qualifier = [qualifierText(value), disclosed.value === '公开' ? '公开' : null]
      .filter(Boolean)
      .join('，')
    const text = valueText({ ...value, property: props.item.property })
    return qualifier ? `${text}（${qualifier}）` : text
  }
  const STATES: Partial<Record<WorkingValue['state'], string>> = {
    added: '新增',
    removed: '已删除',
    restored: '已恢复',
    moved_out: '移到另一个条目',
    moved_in: '从另一个条目移来',
  }
</script>

<template>
  <Stack v-if="item.state !== 'same'" gap="xs">
    <Inline gap="sm" align="center">
      <Text v-if="item.state === 'changed' && !long && !image" as="span" size="xs" tone="muted">
        修改前：{{ item.before ? describe(item.before) || '空' : '空' }}
      </Text>
      <Text v-else-if="disclosed" as="span" size="xs" tone="muted">修改前：{{ disclosed }}</Text>
      <Text v-else-if="STATES[item.state]" as="span" size="xs" tone="muted">
        {{ STATES[item.state] }}
      </Text>
      <Button
        v-if="item.state === 'changed' && long && item.before?.text !== item.value.text"
        variant="link"
        size="sm"
        @click="compare = !compare"
      >
        {{ compare ? '收起对照' : '对照修改前的内容' }}
      </Button>
      <Button variant="link" size="sm" @click="emit('revert')">撤回</Button>
    </Inline>
    <WikiDiffImages
      v-if="item.state === 'changed' && image && item.before?.media?.id !== item.value.media?.id"
      :before="item.before?.media ?? null"
      :after="item.value.media"
    />
    <WikiDiffLines
      v-if="compare && item.before"
      :before="item.before.text ?? ''"
      :after="item.value.text ?? ''"
    />
  </Stack>
</template>

<script setup lang="ts">
  import { Button, Inline, Stack, Text } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { PropertyDefinition } from '~/features/wiki/editor/draft'
  import type { WorkingProperty } from '~/features/wiki/editor/working'
  import { LONG_PROPERTIES, valueText } from '~/features/wiki/values'

  defineOptions({ name: 'WikiFieldBefore' })

  const props = defineProps<{ view: WorkingProperty; definition: PropertyDefinition }>()
  const editor = inject(ENTRY_EDITOR)!
  const compare = ref(false)
  const long = computed(() => LONG_PROPERTIES.includes(props.definition.property))
  const original = computed(() =>
    props.view.values
      .filter(item => item.state !== 'added' && item.state !== 'moved_in')
      .map(item => item.before ?? item.value),
  )
  const before = computed(
    () =>
      original.value
        .map(value => valueText({ ...value, property: props.definition.property }))
        .filter(Boolean)
        .join('、') || '无',
  )
  const after = computed(
    () =>
      props.view.values.find(item => item.state !== 'removed' && item.state !== 'moved_out')?.value
        .text ?? '',
  )

  function revert() {
    for (const item of props.view.values) if (item.state !== 'same') editor.revert(item.id)
  }
</script>

<template>
  <Stack gap="xs">
    <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0">
      <Text v-if="!long" size="xs" tone="muted" truncate>
        修改前：<Text as="span" size="xs" class="line-through">{{ before }}</Text>
      </Text>
      <Button v-else variant="link" size="sm" @click="compare = !compare">
        {{ compare ? '收起对照' : '对照修改前的内容' }}
      </Button>
      <Button variant="link" size="sm" class="shrink-0" @click="revert">撤回</Button>
    </Inline>
    <WikiDiffLines v-if="long && compare" :before="original[0]?.text ?? ''" :after="after" />
  </Stack>
</template>

<script setup lang="ts">
  import {
    Button,
    Checkbox,
    Combobox,
    Empty,
    Inline,
    ScrollArea,
    SearchInput,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import type { useSelection } from '~/features/download/useSelection'

  const props = defineProps<{
    selection: ReturnType<typeof useSelection>
    disabled: boolean
    unit: string
  }>()
  const selected = defineModel<number[]>({ required: true })
  const {
    start,
    end,
    keyword,
    options,
    endOptions,
    visible,
    setStart,
    setEnd,
    toggle,
    selectAll,
    clear,
  } = props.selection
  const noun = computed(() => (props.unit === '卷' ? '分卷' : '章节'))
  const all = computed(() => selected.value.length === options.value.length)
</script>

<template>
  <Stack gap="sm">
    <Inline justify="between" align="center" gap="sm" :wrap="false" class="h-9">
      <Inline gap="sm" align="center" :wrap="false">
        <Button
          size="sm"
          variant="soft"
          tone="neutral"
          :disabled="disabled || all"
          @click="selectAll()"
        >
          全选
        </Button>
        <Button
          size="sm"
          variant="soft"
          tone="neutral"
          :disabled="disabled || !selected.length"
          @click="clear()"
        >
          清空
        </Button>
      </Inline>
      <slot name="toolbar" />
    </Inline>
    <Inline gap="sm" align="center" :wrap="false" class="h-9">
      <Combobox
        :model-value="start"
        :options="options"
        virtualize
        size="sm"
        :disabled="disabled"
        :aria-label="`起始${noun}`"
        class="w-40 shrink-0"
        @update:model-value="setStart"
      />
      <Text size="sm" tone="muted" class="shrink-0">至</Text>
      <Combobox
        :model-value="end"
        :options="endOptions"
        virtualize
        size="sm"
        :disabled="disabled"
        :aria-label="`结束${noun}`"
        class="w-40 shrink-0"
        @update:model-value="setEnd"
      />
      <SearchInput
        v-model="keyword"
        size="sm"
        :placeholder="`搜索${noun}`"
        :aria-label="`搜索${noun}`"
        :disabled="disabled"
        class="min-w-0 flex-1"
      />
    </Inline>
    <ScrollArea class="h-72 rounded-lg border border-line">
      <Stack v-if="visible.length" gap="none" class="p-2">
        <Checkbox
          v-for="item in visible"
          :key="item.id"
          :model-value="selected.includes(item.id)"
          :disabled="disabled"
          block
          class="rounded-md px-3 py-2"
          @update:model-value="toggle(item.id, $event)"
        >
          {{ item.label }}
        </Checkbox>
      </Stack>
      <Empty v-else :title="`没有匹配的${noun}`" size="sm" />
    </ScrollArea>
    <Text size="sm" tone="muted" class="h-5">
      已选 {{ selected.length }} / {{ options.length }} {{ unit }}
    </Text>
  </Stack>
</template>

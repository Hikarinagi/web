<script setup lang="ts">
  import {
    Button,
    Checkbox,
    Combobox,
    Empty,
    Grid,
    Inline,
    ScrollArea,
    SearchInput,
    SegmentedControl,
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
  const { mode, start, end, keyword, options, endOptions, visible, changeMode, toggle } =
    props.selection
  const noun = computed(() => (props.unit === '卷' ? '分卷' : '章节'))
</script>

<template>
  <Stack gap="lg">
    <SegmentedControl
      :model-value="mode"
      :options="[
        { value: 'all', label: '全部' },
        { value: 'range', label: '范围' },
        { value: 'custom', label: '自选' },
      ]"
      block
      :disabled="disabled"
      aria-label="选择下载内容"
      @update:model-value="changeMode"
    />
    <Grid v-if="mode === 'range'" :cols="2" gap="md">
      <Stack gap="sm">
        <Text size="sm" tone="muted">从</Text>
        <Combobox
          v-model="start"
          :options="options"
          virtualize
          :disabled="disabled"
          :aria-label="`起始${noun}`"
          :placeholder="`起始${noun}`"
        />
      </Stack>
      <Stack gap="sm">
        <Text size="sm" tone="muted">至</Text>
        <Combobox
          v-model="end"
          :options="endOptions"
          virtualize
          :disabled="disabled"
          :aria-label="`结束${noun}`"
          :placeholder="`结束${noun}`"
        />
      </Stack>
    </Grid>
    <Stack v-else-if="mode === 'custom'" gap="sm">
      <SearchInput
        v-model="keyword"
        :placeholder="`搜索${noun}`"
        :aria-label="`搜索${noun}`"
        :disabled="disabled"
      />
      <Inline justify="between">
        <Text size="sm" tone="muted">{{
          keyword ? `找到 ${visible.length} ${unit}` : `共 ${options.length} ${unit}`
        }}</Text>
        <Button
          size="sm"
          variant="ghost"
          tone="neutral"
          :disabled="disabled || !selected.length"
          @click="selected = []"
          >清空选择</Button
        >
      </Inline>
      <ScrollArea class="h-64">
        <Grid v-if="visible.length" :cols="2" gap="sm" class="sm:grid-cols-3">
          <Checkbox
            v-for="item in visible"
            :key="item.id"
            :model-value="selected.includes(item.id)"
            :disabled="disabled"
            block
            class="rounded-lg bg-subtle p-3"
            @update:model-value="toggle(item.id, $event)"
          >
            {{ item.label }}
          </Checkbox>
        </Grid>
        <Empty v-else :title="`没有匹配的${noun}`" size="sm" />
      </ScrollArea>
    </Stack>
  </Stack>
</template>

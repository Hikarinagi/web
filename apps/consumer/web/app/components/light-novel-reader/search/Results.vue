<script setup lang="ts">
  import { Center, Empty, Listbox, Mark, Spinner, Stack, Text } from '@hina-ui/vue'
  import type { ComponentPublicInstance } from 'vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import { groupResults, snippet } from '~/features/light-novel-reader/search'

  defineOptions({ name: 'LightNovelReaderSearchResults' })

  const { search, location, shell } = useReader()
  const { results, current, status, term } = search
  const list = useTemplateRef<ComponentPublicInstance>('list')
  const shortcut = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘F' : 'Ctrl F'

  const options = computed(() =>
    groupResults(results.value, location.rows.value).map(group => ({
      label: `${group.label || '未命名章节'}（${group.hits.length} 处）`,
      options: group.hits.map(({ index, result }) => {
        const parts = snippet(result.context, term.value)
        return {
          value: index,
          label: `${parts.before}${parts.match}${parts.after}`,
          page: result.pageIndex + 1,
          ...parts,
        }
      }),
    })),
  )

  function pick(index: string | number | (string | number)[] | null | undefined) {
    if (typeof index !== 'number') return
    search.go(index)
    if (shell.phone.value) shell.settle()
  }

  watch(
    current,
    () =>
      void nextTick(() => {
        const root: unknown = list.value?.$el
        if (!(root instanceof Element)) return
        root.querySelector('[data-current]')?.scrollIntoView({ block: 'nearest' })
      }),
    { flush: 'post' },
  )
</script>

<template>
  <Empty
    v-if="status === 'idle'"
    size="sm"
    title="输入关键词搜索全书"
    :description="shell.phone.value ? undefined : `在顶栏的搜索框中输入，或按 ${shortcut}`"
    class="py-10"
  />
  <Center v-else-if="status === 'preparing'" class="py-10">
    <Text size="sm" tone="muted">正在准备全书内容</Text>
  </Center>
  <Center v-else-if="status === 'searching'" class="py-10">
    <Spinner size="sm" />
  </Center>
  <Empty v-else-if="status === 'empty'" size="sm" title="没有找到匹配的内容" class="py-10" />
  <Listbox
    v-else-if="status === 'found'"
    ref="list"
    :model-value="null"
    :options="options"
    variant="bare"
    max-height="none"
    aria-label="搜索结果"
    data-tour="search-results"
    class="p-2"
    @update:model-value="pick"
  >
    <template #option="{ option }">
      <Stack
        as="span"
        gap="none"
        class="min-w-0"
        :data-current="option.value === current || undefined"
      >
        <Text
          as="span"
          size="sm"
          :tone="option.value === current ? undefined : 'muted'"
          :weight="option.value === current ? 'medium' : undefined"
        >
          {{ option.before }}<Mark>{{ option.match }}</Mark
          >{{ option.after }}
        </Text>
        <Text as="span" size="xs" tone="faint" class="tabular-nums">第 {{ option.page }} 页</Text>
      </Stack>
    </template>
    <template #trailing />
  </Listbox>
</template>

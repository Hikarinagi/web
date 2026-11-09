<script setup lang="ts">
  import { Inline, Select, Tabs, TabsList, TabsTrigger, Tag } from '@hina-ui/vue'
  import type { EditorPart } from '~/features/wiki/editor/parts'

  defineOptions({ name: 'WikiEditorParts' })

  const props = defineProps<{
    entry: number
    parts: readonly EditorPart[]
    current: string
    changes: Record<string, number>
    totals: Record<string, number>
  }>()
  const route = useRoute()
  const nav = usePageNav()

  const options = computed(() =>
    props.parts.map(part => ({
      value: part.key,
      label: props.changes[part.key]
        ? `${part.label}（${props.changes[part.key]} 处修改）`
        : part.label,
    })),
  )

  function open(part: string | number | null | undefined) {
    if (!part || part === props.current) return
    const { focus: _focus, ...query } = route.query
    void nav.push({ path: `/entries/${props.entry}/edit/${String(part)}`, query })
  }
</script>

<template>
  <Select
    :model-value="current"
    :options="options"
    aria-label="编辑的部分"
    class="mb-3 md:hidden"
    @update:model-value="open"
  />
  <Tabs :model-value="current" variant="underline" class="max-md:hidden" @update:model-value="open">
    <TabsList label="编辑的部分">
      <TabsTrigger v-for="part in parts" :key="part.key" :value="part.key">
        <Inline gap="xs" align="center" :wrap="false">
          {{ part.label }}
          <Tag v-if="changes[part.key]" tone="accent" variant="soft" size="sm" pill>
            {{ changes[part.key] }} 处修改
          </Tag>
          <Tag v-else-if="totals[part.key]" tone="neutral" variant="soft" size="sm" pill>
            {{ totals[part.key] }}
          </Tag>
        </Inline>
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>

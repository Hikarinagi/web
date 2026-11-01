<script setup lang="ts">
  import { Chip, Inline, SegmentedControl } from '@hina-ui/vue'

  defineOptions({ name: 'CreatorChangesFilters' })
  defineProps<{ types: { value: string; label: string }[]; taskName?: string | null }>()
  const filter = defineModel<string>('filter', { required: true })
  const section = defineModel<string>('section', { required: true })
  const type = defineModel<string>('type', { required: true })
  const task = defineModel<number | null>('task', { default: null })

  const FILTERS = [
    { value: 'all', label: '全部' },
    { value: 'unpatrolled', label: '未巡查' },
    { value: 'new_members', label: '新成员' },
    { value: 'deletions', label: '删除' },
    { value: 'work_content', label: '作品内事实' },
    { value: 'structural', label: '结构编辑' },
    { value: 'bot', label: '维基机器人' },
  ]
</script>

<template>
  <Inline gap="md" align="center">
    <SegmentedControl v-model="filter" :options="FILTERS" size="sm" />
    <CreatorSectionFilter v-model:section="section" v-model:type="type" :types="types" />
    <Chip v-if="task" removable @remove="task = null"> 任务：{{ taskName ?? `#${task}` }} </Chip>
  </Inline>
</template>

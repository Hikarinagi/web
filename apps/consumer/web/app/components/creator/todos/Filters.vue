<script setup lang="ts">
  import { Inline, Select } from '@hina-ui/vue'

  defineOptions({ name: 'CreatorTodosFilters' })
  defineProps<{ types: { value: string; label: string }[] }>()
  const kind = defineModel<string>('kind', { required: true })
  const section = defineModel<string>('section', { required: true })
  const type = defineModel<string>('type', { required: true })

  const KINDS = [
    { value: 'all', label: '全部待完善事项' },
    { value: 'CLUE', label: '无来源' },
    { value: 'IMPORTED_NEEDS_SOURCE', label: '导入值需来源' },
    { value: 'SUGGESTED_EDIT', label: '维基机器人建议' },
    { value: 'POSSIBLE_DUPLICATE', label: '疑似重复' },
    { value: 'IDENTIFIER_CONFLICT', label: '共用编号' },
    { value: 'CONSTRAINT_VIOLATION', label: '违反规则' },
    { value: 'SOURCE_MISMATCH', label: '来源不符' },
    { value: 'DOWNSTREAM_DIFF', label: '与其他数据库有差异' },
    { value: 'NEW_BOOK_PLACEMENT', label: '待归置的新书' },
    { value: 'NEW_GAME_PLACEMENT', label: '待归置的新游戏' },
    { value: 'APPEARANCE_LABEL_CONFLICT', label: '出场角色名称冲突' },
    { value: 'CHARACTER_GROUP_CANDIDATE', label: '可能为同一角色' },
    { value: 'CREDIT_LINK_CANDIDATE', label: '待关联的人物' },
  ]
</script>

<template>
  <Inline gap="md" align="center">
    <Select v-model="kind" :options="KINDS" size="sm" class="w-48" aria-label="事项" />
    <CreatorSectionFilter v-model:section="section" v-model:type="type" :types="types" />
  </Inline>
</template>

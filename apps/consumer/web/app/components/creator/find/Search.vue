<script setup lang="ts">
  import { Button, Form, FormField, Inline, Input, Panel, Select } from '@hina-ui/vue'
  import { Search } from '@lucide/vue'
  import { AUTHOR_SEARCH_TYPES } from '~/features/creator/duplicates'
  import {
    EDITOR_RESOURCE_OPTIONS,
    findSchema,
    type FindValues,
  } from '~/features/creator/schemas/find.schema'

  const props = defineProps<{ initial: FindValues; loading: boolean }>()
  const emit = defineEmits<{ search: [values: FindValues] }>()

  const values = reactive<FindValues>({ ...props.initial })
  watch(
    () => props.initial,
    next => Object.assign(values, next),
  )

  const withAuthor = computed(() => AUTHOR_SEARCH_TYPES.includes(values.resource_type))
  const isGalgame = computed(() => values.resource_type === 'galgame')
  const isCharacter = computed(() => values.resource_type === 'character')

  function onSubmit() {
    emit('search', {
      resource_type: values.resource_type,
      q: values.q.trim(),
      author: withAuthor.value ? (values.author ?? '').trim() : '',
      work: isCharacter.value ? (values.work ?? '').trim() : '',
    })
  }
</script>

<template>
  <Panel title="查找条目" description="请在编辑或新建前先查找。标题与作者名可使用任意文字输入。">
    <template #icon><Search /></template>
    <Form :values="values" :rules="findSchema" :disabled="loading" @submit="onSubmit">
      <Inline gap="md" align="end">
        <FormField name="resource_type" label="条目类型" required class="w-40 max-sm:w-full">
          <Select v-model="values.resource_type" :options="EDITOR_RESOURCE_OPTIONS" />
        </FormField>
        <FormField name="q" :label="isCharacter ? '名称' : '标题'" required class="min-w-60 flex-1">
          <Input
            v-model="values.q"
            placeholder="原名、中文名或别名；或 Bangumi 链接或本站编号"
            autofocus
          />
        </FormField>
        <FormField
          v-if="withAuthor"
          name="author"
          :label="isGalgame ? '品牌（可选）' : '作者（可选）'"
          class="w-60 max-sm:w-full"
        >
          <Input
            v-model="values.author"
            :placeholder="isGalgame ? '品牌名（任意文字）' : '任意写法的作者名'"
          />
        </FormField>
        <FormField
          v-if="isCharacter"
          name="work"
          label="所属作品（可选）"
          class="w-80 max-sm:w-full"
        >
          <Input v-model="values.work" />
        </FormField>
        <Button type="submit" :loading="loading">
          <template #icon><Search /></template>
          查找
        </Button>
      </Inline>
    </Form>
  </Panel>
</template>

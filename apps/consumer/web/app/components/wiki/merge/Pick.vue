<script setup lang="ts">
  import { Panel } from '@hina-ui/vue'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import type { MergePickPageData } from '~~/server/api/pages/entries/[id]/merge.get'

  defineOptions({ name: 'WikiMergePick' })

  const props = defineProps<{ data: MergePickPageData }>()
  const target = ref<ValueDraft['target']>(null)

  watch(target, picked => {
    if (picked && picked.id !== props.data.entry.id)
      void navigateTo(`/entries/${props.data.entry.id}/merge/${picked.id}`)
  })
</script>

<template>
  <Panel :title="`把重复的条目并入「${data.entry.label}」`">
    <WikiFieldTarget
      v-model="target"
      :types="[data.entry.type]"
      label="重复的条目"
      placeholder="按名字查找重复的条目"
    />
  </Panel>
</template>

<script setup lang="ts">
  import { Button, Page } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { MergePickPageData } from '~~/server/api/pages/entries/[id]/merge.get'

  defineOptions({ name: 'WikiMergePick' })

  const props = defineProps<{ data: MergePickPageData }>()
  const { typeName } = useWikiDefinitions()
  const active = usePageActive()
  const nav = useTabNav()
  const edit = computed(() => `/entries/${props.data.entry.id}/edit`)
</script>

<template>
  <Page size="lg" class="max-md:py-4">
    <WikiPageHead
      :eyebrow="`${typeName(data.entry.type)}：${data.entry.label || '未命名'}`"
      title="与重复的条目合并"
    >
      <template #actions>
        <Button :as="NuxtLink" :to="edit" variant="outline" tone="neutral" size="sm">
          <template #icon><ArrowLeft /></template>
          返回编辑
        </Button>
      </template>
    </WikiPageHead>
  </Page>
  <WikiEditorPick
    :open="active"
    title="选择重复的条目"
    :types="[data.entry.type]"
    :exclude="[data.entry.id]"
    confirm="下一步"
    @close="nav.dismiss(edit, true)"
    @pick="item => navigateTo(`/entries/${data.entry.id}/merge/${item.id}`)"
  />
</template>

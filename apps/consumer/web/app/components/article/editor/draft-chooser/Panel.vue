<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'

  defineOptions({ name: 'ArticleEditorDraftChooserPanel' })

  defineProps<{
    drafts: ApiData<'/api/v3/user/me/drafts', 'get'>['items']
    selectedId: number | null
  }>()
  defineEmits<{ select: [id: number]; confirm: []; cancel: [] }>()
</script>

<template>
  <div class="flex min-h-0 flex-col">
    <ScrollArea class="max-h-[60dvh]">
      <div class="flex flex-col gap-1 pr-1">
        <ArticleEditorDraftChooserItem
          v-for="d in drafts"
          :key="d.id"
          :draft="d"
          :selected="d.id === selectedId"
          @select="$emit('select', d.id)"
        />
      </div>
    </ScrollArea>
    <div
      class="mt-3 flex shrink-0 items-center justify-end gap-2 border-t border-surface-200 pt-3 dark:border-surface-800"
    >
      <Button label="取消" severity="secondary" text @click="$emit('cancel')" />
      <Button label="确定" :disabled="selectedId === null" @click="$emit('confirm')" />
    </div>
  </div>
</template>

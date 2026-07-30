<script setup lang="ts">
  import { Circle, CircleDot, FileText } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'ArticleEditorDraftChooserItem' })

  defineProps<{
    draft: ApiData<'/api/v3/user/me/drafts', 'get'>['items'][number]
    selected: boolean
  }>()
  defineEmits<{ select: [] }>()
</script>

<template>
  <Button
    unstyled
    :class="[
      'flex w-full shrink-0 cursor-pointer items-center gap-3 rounded-lg border p-2.5 text-left transition-colors',
      selected
        ? 'border-primary-400 bg-primary-50/60 dark:border-primary-500/60 dark:bg-primary-500/10'
        : 'border-transparent hover:bg-surface-100 dark:hover:bg-surface-800',
    ]"
    @click="$emit('select')"
  >
    <component
      :is="selected ? CircleDot : Circle"
      :size="18"
      class="shrink-0"
      :class="selected ? 'text-primary-600' : 'text-surface-300 dark:text-surface-600'"
    />
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-color">{{ draft.title || '无标题' }}</p>
      <p class="mt-0.5 line-clamp-2 text-xs text-muted-color">{{ draft.excerpt || '暂无内容' }}</p>
      <p class="mt-1.5 text-xs text-surface-400 dark:text-surface-500">
        {{ timeFromNow(draft.updated_at) }} · {{ draft.char_count }} 字
      </p>
    </div>
    <HikariImage
      v-if="draft.cover"
      :src="draft.cover.src"
      alt=""
      class="aspect-2/1 w-20 shrink-0 overflow-hidden rounded-md border border-surface-200 dark:border-surface-800"
      image-class="size-full object-cover"
      :processing="{ q: 60 }"
    />
    <div
      v-else
      class="grid aspect-2/1 w-20 shrink-0 place-items-center rounded-md bg-surface-100 text-surface-400 dark:bg-surface-800"
    >
      <FileText :size="18" />
    </div>
  </Button>
</template>

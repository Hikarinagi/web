<script setup lang="ts">
  import { Check } from '@lucide/vue'
  import type { TopicOption, TopicSection } from './useTopics'

  defineOptions({ name: 'TopicPicker' })

  defineProps<{
    loading: boolean
    sections: TopicSection[]
    canCreate: boolean
    kw: string
    selectedIds: Set<number>
  }>()
  const query = defineModel<string>('query', { required: true })
  const emit = defineEmits<{ pick: [topic: TopicOption]; create: [] }>()

  const SKELETON_WIDTHS = ['66%', '82%', '52%', '74%', '60%']

  function formatCount(n: number) {
    return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n)
  }
</script>

<template>
  <div class="w-72">
    <InputText v-model="query" placeholder="搜索或输入新话题…" size="small" fluid class="mb-2" />
    <div class="max-h-64 overflow-y-auto">
      <div v-if="loading" class="flex flex-col gap-2 px-1 py-1">
        <Skeleton
          v-for="(w, i) in SKELETON_WIDTHS"
          :key="i"
          height="1.5rem"
          :width="w"
          border-radius="0.375rem"
        />
      </div>
      <Button
        v-else-if="canCreate"
        unstyled
        class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm text-color transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
        @click="emit('create')"
      >
        <span class="truncate">
          <span class="text-primary-600">#</span>
          {{ kw }}
        </span>
        <Tag class="shrink-0 rounded px-1.5! py-0.5! text-[11px]! font-medium">创建</Tag>
      </Button>
      <p v-else-if="!sections.length" class="px-1 py-6 text-center text-sm text-muted-color">
        没有匹配的话题
      </p>
      <div v-for="sec in sections" :key="sec.key" class="not-first:mt-1">
        <p class="px-1 pb-1 text-xs font-medium text-muted-color">{{ sec.label }}</p>
        <Button
          v-for="t in sec.items"
          :key="sec.key + t.id"
          unstyled
          class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
          :class="selectedIds.has(t.id) ? 'text-primary-600' : 'text-color'"
          @click="emit('pick', t)"
        >
          <span class="truncate">
            <span class="text-primary-600">#</span>
            {{ t.name }}
          </span>
          <Check v-if="selectedIds.has(t.id)" :size="15" class="shrink-0 text-primary-600" />
          <span v-else class="shrink-0 text-xs text-muted-color tabular-nums">
            {{ formatCount(t.use_count) }}
          </span>
        </Button>
      </div>
    </div>
  </div>
</template>

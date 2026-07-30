<script setup lang="ts">
  import { X } from '@lucide/vue'
  import AutoComplete, { type AutoCompleteOptionSelectEvent } from 'primevue/autocomplete'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import type { ImportType } from '~/features/creator/editor/import'

  type SearchItem = ApiData<'/api/v3/external-source/{source}/search', 'get'>[number]

  const props = defineProps<{ source: 'bangumi' | 'vndb'; label: string; type: ImportType }>()
  const picked = defineModel<SearchItem | null>({ default: null })

  const results = ref<SearchItem[]>([])
  const loading = ref(false)

  async function complete(event: { query: string }) {
    const q = event.query.trim()
    if (!q) {
      results.value = []
      return
    }
    loading.value = true
    try {
      results.value = await hikariRequest('/api/v3/external-source/{source}/search', {
        path: { source: props.source },
        query: { q, type: props.type },
      })
    } finally {
      loading.value = false
    }
  }

  function onSelect(event: AutoCompleteOptionSelectEvent) {
    picked.value = event.value as SearchItem
  }

  const isExisting = (option: SearchItem) => option.existing_id != null
</script>

<template>
  <div class="flex flex-col gap-2">
    <label class="text-sm font-medium">{{ label }}</label>

    <div
      v-if="picked"
      class="flex items-center gap-3 rounded-lg border border-surface-200 p-2 dark:border-surface-700"
    >
      <HikariImage
        :src="picked.cover ?? ''"
        alt=""
        preset="small"
        class="h-14 w-10 shrink-0 rounded bg-surface-100 dark:bg-surface-800"
        image-class="size-full object-cover"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <div class="flex min-w-0 flex-1 flex-col">
        <span class="truncate text-sm font-medium">{{ picked.title }}</span>
        <span class="font-mono text-xs text-muted-color">
          {{ picked.external_id }}
          <template v-if="picked.year">· {{ picked.year }}</template>
        </span>
      </div>
      <Button text rounded severity="secondary" aria-label="清除" @click="picked = null">
        <template #icon><X :size="16" /></template>
      </Button>
    </div>

    <AutoComplete
      v-else
      :suggestions="results"
      :loading="loading"
      option-label="title"
      :option-disabled="isExisting"
      :placeholder="`搜索 ${label} 标题 / 条目 ID…`"
      fluid
      complete-on-focus
      @complete="complete"
      @option-select="onSelect"
    >
      <template #option="{ option }">
        <div class="flex items-center gap-3" :class="{ 'opacity-60': isExisting(option) }">
          <HikariImage
            :src="option.cover ?? ''"
            alt=""
            preset="small"
            class="h-12 w-9 shrink-0 rounded bg-surface-100 dark:bg-surface-800"
            image-class="size-full object-cover"
          >
            <template #empty><span /></template>
            <template #error><span /></template>
          </HikariImage>
          <div class="flex min-w-0 flex-col">
            <span class="flex items-center gap-2">
              <span class="truncate text-sm font-medium">{{ option.title }}</span>
              <Tag v-if="isExisting(option)" value="已收录" severity="secondary" />
            </span>
            <span v-if="option.subtitle" class="truncate text-xs text-muted-color">
              {{ option.subtitle }}
            </span>
            <span class="font-mono text-xs text-muted-color">
              {{ option.external_id }}
              <template v-if="option.year">· {{ option.year }}</template>
            </span>
          </div>
        </div>
      </template>
    </AutoComplete>
  </div>
</template>

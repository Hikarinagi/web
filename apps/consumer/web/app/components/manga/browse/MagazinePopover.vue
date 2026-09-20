<script setup lang="ts">
  import { Check, Search } from '@lucide/vue'
  import { BROWSE_FILTER_KEY } from '~/features/manga/useBrowseFilter'

  defineOptions({ name: 'MangaBrowseMagazinePopover' })
  const props = defineProps<{ modelValue?: number; disabled?: boolean }>()
  const emit = defineEmits<{ 'update:modelValue': [value: number | undefined] }>()

  const filter = inject(BROWSE_FILTER_KEY)
  const pop = ref()
  const query = ref('')
  const results = ref<{ id: number; name: string }[]>([])
  const loading = ref(false)
  const searched = ref(false)
  let seq = 0

  const active = computed(() => props.modelValue != null)
  const label = computed(() =>
    props.modelValue != null
      ? (filter?.entityLabel('magazine', props.modelValue) ?? '杂志')
      : '杂志',
  )

  async function fetchList() {
    const current = ++seq
    loading.value = true
    try {
      const rows = await hikariRequest('/api/v3/mangas/magazines', {
        query: { search: query.value.trim() || undefined },
      })
      if (current !== seq) return
      results.value = rows
      searched.value = true
    } catch {
      if (current !== seq) return
      results.value = []
    } finally {
      if (current === seq) loading.value = false
    }
  }

  const debouncedFetch = useDebounceFn(fetchList, 250)
  watch(query, () => {
    searched.value = false
    void debouncedFetch()
  })

  function toggle(event: Event) {
    pop.value?.toggle(event)
    if (!results.value.length) void fetchList()
  }

  function select(row: { id: number; name: string } | null) {
    if (row) filter?.remember('magazine', [row])
    emit('update:modelValue', row?.id)
    pop.value?.hide()
  }
</script>

<template>
  <Button
    unstyled
    :disabled="disabled"
    :class="[
      'box-border inline-flex h-9 min-w-24 items-center gap-1.5 rounded-lg border px-3 py-0 text-sm leading-none whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60',
      active
        ? 'border-hikari-primary-500 bg-hikari-primary-50 text-hikari-primary-700 dark:bg-hikari-primary-950 dark:text-hikari-primary-300'
        : 'border-surface-200 bg-surface-0 text-surface-700 hover:bg-surface-50 active:bg-surface-100 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:border-surface-600 dark:hover:bg-surface-800 dark:active:bg-surface-800',
    ]"
    @click="toggle"
  >
    <Search class="size-3.5 shrink-0" />
    <span class="max-w-40 truncate font-medium">{{ label }}</span>
  </Button>

  <Popover ref="pop" :pt="{ content: { class: 'p-0!' }, root: { class: 'popover-no-arrow' } }">
    <div class="flex w-72 max-w-[calc(100vw-2rem)] flex-col p-2">
      <InputText v-model="query" placeholder="搜索杂志…" size="small" fluid />
      <ScrollArea class="mt-2 max-h-64" :aria-busy="loading">
        <div v-if="loading" class="flex flex-col gap-1" role="status" aria-label="搜索中">
          <Skeleton v-for="index in 5" :key="index" class="h-8!" />
        </div>
        <template v-else>
          <Button
            unstyled
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
            @click="select(null)"
          >
            <span
              class="min-w-0 flex-1 truncate text-[13px] text-surface-700 dark:text-surface-300"
            >
              全部杂志
            </span>
            <Check
              v-if="!active"
              class="size-4 shrink-0 text-hikari-primary-600 dark:text-hikari-primary-400"
            />
          </Button>
          <Button
            v-for="row in results"
            :key="row.id"
            unstyled
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
            @click="select(row)"
          >
            <span
              class="min-w-0 flex-1 truncate text-[13px] text-surface-700 dark:text-surface-300"
            >
              {{ row.name }}
            </span>
            <Check
              v-if="row.id === modelValue"
              class="size-4 shrink-0 text-hikari-primary-600 dark:text-hikari-primary-400"
            />
          </Button>
          <p
            v-if="searched && !results.length"
            class="px-2 py-3 text-center text-xs text-surface-400"
          >
            没有匹配的杂志
          </p>
        </template>
      </ScrollArea>
    </div>
  </Popover>
</template>

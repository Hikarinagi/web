<script setup lang="ts">
  import { Check, Search } from '@lucide/vue'
  import {
    useEntitySearch,
    type EntityTarget,
    type ProducerType,
  } from '~/features/creator/composables/useEntitySearch'
  import { BROWSE_FILTER_KEY } from '~/features/galgame/useBrowseFilter'

  defineOptions({ name: 'GalgameBrowseEntitySearchPopover' })
  const props = defineProps<{
    target: EntityTarget
    kind: 'producer' | 'tag' | 'staff'
    label: string
    note?: string
    producerTypes?: ProducerType[]
  }>()
  const model = defineModel<number[]>({ default: () => [] })

  const filter = inject(BROWSE_FILTER_KEY)
  const pop = ref()
  const active = computed(() => model.value.length > 0)
  const hasMedia = computed(() => props.target !== 'tag')
  const { query, results, loading, searched } = useEntitySearch(() => props.target, {
    scope: 'public',
    producerTypes: props.producerTypes,
  })

  watch(results, rows => filter?.remember(props.kind, rows))

  function toggle(entity: { id: number; name: string }) {
    filter?.remember(props.kind, [entity])
    const set = new Set(model.value)
    if (set.has(entity.id)) set.delete(entity.id)
    else set.add(entity.id)
    model.value = [...set]
  }
</script>

<template>
  <Button
    unstyled
    :class="[
      'box-border inline-flex h-9 min-w-24 items-center gap-1.5 rounded-lg border px-3 py-0 text-sm leading-none whitespace-nowrap transition-colors',
      active
        ? 'border-hikari-primary-500 bg-hikari-primary-50 text-hikari-primary-700 dark:bg-hikari-primary-950 dark:text-hikari-primary-300'
        : 'border-surface-200 bg-surface-0 text-surface-700 hover:bg-surface-50 active:bg-surface-100 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:border-surface-600 dark:hover:bg-surface-800 dark:active:bg-surface-800',
    ]"
    @click="pop?.toggle($event)"
  >
    <Search class="size-3.5" />
    <span class="font-medium">{{ label }}</span>
    <Tag v-if="active" class="h-4! min-w-4! px-1! py-0! text-[10px]! leading-none!" rounded>
      {{ model.length }}
    </Tag>
  </Button>

  <Popover ref="pop" :pt="{ content: { class: 'p-0!' }, root: { class: 'popover-no-arrow' } }">
    <div class="flex w-72 flex-col">
      <p
        v-if="note"
        class="border-b border-surface-100 px-3 py-2 text-[11px] text-surface-400 dark:border-surface-800 dark:text-surface-500"
      >
        {{ note }}
      </p>
      <div class="p-2">
        <InputText v-model="query" :placeholder="`搜索${label}…`" size="small" fluid />
      </div>
      <div class="max-h-72 overflow-auto px-2 pb-2" :aria-busy="loading">
        <div v-if="loading" class="flex flex-col gap-1" role="status" aria-label="搜索中">
          <div
            v-for="index in 5"
            :key="index"
            class="flex items-center gap-2 rounded-md px-2 py-1.5"
          >
            <Skeleton v-if="hasMedia" class="size-7! shrink-0 rounded!" />
            <Skeleton class="h-4! min-w-0 flex-1" />
            <Skeleton class="size-4! shrink-0 rounded-full!" />
          </div>
        </div>
        <template v-else>
          <Button
            v-for="row in results"
            :key="row.id"
            unstyled
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
            @click="toggle(row)"
          >
            <HikariImage
              v-if="hasMedia && row.cover"
              :src="row.cover"
              preset="small"
              class="size-7 shrink-0 rounded"
              image-class="object-cover"
            >
              <template #empty><span /></template>
              <template #error><span /></template>
            </HikariImage>
            <span
              v-else-if="hasMedia"
              class="size-7 shrink-0 rounded bg-surface-100 dark:bg-surface-800"
            />
            <span
              class="min-w-0 flex-1 truncate text-[13px] text-surface-700 dark:text-surface-300"
            >
              {{ row.name }}
            </span>
            <Check
              v-if="model.includes(row.id)"
              class="size-4 shrink-0 text-hikari-primary-600 dark:text-hikari-primary-400"
            />
          </Button>
        </template>
        <p
          v-if="!loading && searched && !results.length"
          class="px-2 py-3 text-center text-xs text-surface-400"
        >
          {{ query ? '没有匹配结果' : '没有可选项' }}
        </p>
        <p
          v-if="!loading && !searched && !query && !results.length"
          class="px-2 py-3 text-center text-xs text-surface-400"
        >
          输入关键词开始搜索
        </p>
      </div>
    </div>
  </Popover>
</template>

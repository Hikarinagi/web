<script setup lang="ts">
  import {
    Card,
    Inline,
    Popover,
    Ripple,
    ScrollArea,
    SearchInput,
    Skeleton,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { Check } from '@lucide/vue'
  import {
    useEntitySearch,
    type EntityTarget,
    type ProducerType,
  } from '~/features/creator/composables/useEntitySearch'
  import { BROWSE_FILTER_RECALL_KEY } from '~/features/browse/filter'

  defineOptions({ name: 'BrowseEntityMultiPopover' })
  const props = defineProps<{
    target: EntityTarget
    kind: string
    label: string
    note?: string
    producerTypes?: ProducerType[]
  }>()
  const model = defineModel<number[]>({ default: () => [] })

  const filter = inject(BROWSE_FILTER_RECALL_KEY)
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
  <Popover :padded="false" class="w-72 max-w-[calc(100vw-2rem)]">
    <BrowseFilterTrigger :label="label" :active="active" :count="model.length" />

    <template #content>
      <Stack gap="none">
        <Text v-if="note" size="xs" tone="faint" class="border-b border-line px-3 py-2">
          {{ note }}
        </Text>

        <Stack gap="none" class="p-2">
          <SearchInput v-model="query" size="sm" clearable :placeholder="`搜索${label}…`" />
        </Stack>

        <ScrollArea class="max-h-72 px-2 pb-2" :aria-busy="loading">
          <Stack v-if="loading" gap="xs" role="status" aria-label="搜索中">
            <Inline v-for="index in 5" :key="index" gap="sm" class="rounded-md px-2 py-1.5">
              <Skeleton v-if="hasMedia" class="size-7 shrink-0 rounded" />
              <Skeleton class="h-4 min-w-0 flex-1" />
              <Skeleton class="size-4 shrink-0 rounded-full" />
            </Inline>
          </Stack>
          <template v-else>
            <Card
              v-for="row in results"
              :key="row.id"
              as="button"
              :padded="false"
              class="hn-state-layer flex w-full hn-interactive items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1.5 text-left shadow-none hn-press-none"
              @click="toggle(row)"
            >
              <Ripple />
              <HikariImage
                v-if="hasMedia && row.cover"
                :src="row.cover"
                preset="small"
                class="size-7 shrink-0 rounded"
                image-class="object-cover"
              >
                <template #empty />
                <template #error />
              </HikariImage>
              <Stack v-else-if="hasMedia" gap="none" class="size-7 shrink-0 rounded bg-subtle" />
              <Text as="span" size="sm" truncate class="min-w-0 flex-1">{{ row.name }}</Text>
              <Check v-if="model.includes(row.id)" class="size-4 shrink-0 text-accent-text" />
            </Card>
          </template>

          <Text
            v-if="!loading && searched && !results.length"
            size="xs"
            tone="faint"
            class="px-2 py-3 text-center"
          >
            {{ query ? '没有匹配结果' : '没有可选项' }}
          </Text>
          <Text
            v-if="!loading && !searched && !query && !results.length"
            size="xs"
            tone="faint"
            class="px-2 py-3 text-center"
          >
            输入关键词开始搜索
          </Text>
        </ScrollArea>
      </Stack>
    </template>
  </Popover>
</template>

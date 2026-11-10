<script setup lang="ts">
  import {
    Button,
    Empty,
    Inline,
    ScrollArea,
    SearchInput,
    Skeleton,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { useEntitySearch } from '~/features/creator/composables/useEntitySearch'
  import { BROWSE_FILTER_RECALL_KEY, type TagFilterGroup } from '~/features/browse/filter'
  import { excludeTag, includeTag, tagIdsOf } from '~/features/browse/tag-groups'

  defineOptions({ name: 'BrowseTagPicker' })
  const props = defineProps<{ groups: TagFilterGroup[]; limit?: number }>()
  const emit = defineEmits<{ update: [groups: TagFilterGroup[]] }>()

  const filter = inject(BROWSE_FILTER_RECALL_KEY, null)
  const { query, results, loading, searched, refresh } = useEntitySearch(() => 'tag', {
    scope: 'public',
  })
  const chosen = computed(() => new Set(tagIdsOf(props.groups)))
  const rows = computed(() => {
    const list = results.value.filter(row => !chosen.value.has(row.id))
    return props.limit && !query.value.trim() ? list.slice(0, props.limit) : list
  })

  watch(results, list => filter?.remember('tag', list))
  onMounted(() => void refresh())

  function pick(row: { id: number; name: string }, include: boolean) {
    filter?.remember('tag', [row])
    emit('update', include ? includeTag(props.groups, row.id) : excludeTag(props.groups, row.id))
  }
</script>

<template>
  <Stack gap="sm">
    <SearchInput v-model="query" placeholder="标签名" aria-label="查找标签" />
    <component
      :is="limit ? Stack : ScrollArea"
      :class="limit ? '' : 'max-h-72'"
      :aria-busy="loading"
    >
      <Stack gap="none">
        <template v-if="loading">
          <Skeleton v-for="index in 5" :key="index" class="my-1.5 h-5" />
        </template>
        <template v-else>
          <Inline
            v-for="row in rows"
            :key="row.id"
            gap="xs"
            align="center"
            :wrap="false"
            class="rounded-md ps-2 hover:bg-subtle"
          >
            <Text size="sm" truncate class="min-w-0 flex-1">{{ row.name }}</Text>
            <Button
              variant="ghost"
              tone="neutral"
              size="sm"
              :aria-label="`包含「${row.name}」`"
              @click="pick(row, true)"
            >
              包含
            </Button>
            <Button
              variant="ghost"
              tone="neutral"
              size="sm"
              :aria-label="`不含「${row.name}」`"
              @click="pick(row, false)"
            >
              不含
            </Button>
          </Inline>
          <Empty v-if="searched && !rows.length" size="sm" title="没有这个标签" />
        </template>
      </Stack>
    </component>
  </Stack>
</template>

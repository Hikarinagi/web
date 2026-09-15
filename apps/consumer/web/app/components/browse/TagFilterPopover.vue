<script setup lang="ts">
  import {
    Button,
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
  import { Check, Plus } from '@lucide/vue'
  import {
    useEntitySearch,
    type EntityTarget,
  } from '~/features/creator/composables/useEntitySearch'
  import { BROWSE_FILTER_RECALL_KEY, type TagFilterGroup } from '~/features/browse/filter'

  defineOptions({ name: 'BrowseTagFilterPopover' })
  const props = defineProps<{
    groups: TagFilterGroup[]
    disabled?: boolean
  }>()
  const emit = defineEmits<{ update: [value: { tag_groups: TagFilterGroup[] }] }>()

  const filter = inject(BROWSE_FILTER_RECALL_KEY)
  const activeIndex = ref(0)
  const drafts = ref<TagFilterGroup[]>([createGroup()])
  const target = computed<EntityTarget>(() => 'tag')
  const activeGroups = computed(() => props.groups.length)
  const activeTagCount = computed(() =>
    props.groups.reduce((count, group) => count + group.tag_ids.length, 0),
  )
  const active = computed(() => activeGroups.value > 0)
  const buttonText = computed(() => (active.value ? `标签 · ${activeGroups.value} 组` : '标签'))
  const activeGroup = computed(() => drafts.value[activeIndex.value] ?? drafts.value[0])
  const { query, results, loading, searched } = useEntitySearch(() => target.value, {
    scope: 'public',
  })

  watch(results, rows => filter?.remember('tag', rows))
  watch(
    () => props.groups,
    groups => {
      drafts.value = groups.length ? groups.map(copyGroup) : [createGroup()]
      activeIndex.value = Math.min(activeIndex.value, drafts.value.length - 1)
    },
    { immediate: true },
  )

  function createGroup(): TagFilterGroup {
    return { op: 'include', match: 'and', tag_ids: [] }
  }

  function copyGroup(group: TagFilterGroup): TagFilterGroup {
    return { op: group.op, match: group.match, tag_ids: [...group.tag_ids] }
  }

  function clean(groups: TagFilterGroup[]): TagFilterGroup[] {
    const seen = new Set<string>()
    const out: TagFilterGroup[] = []
    for (const group of groups) {
      const tag_ids = [...new Set(group.tag_ids.filter(id => Number.isInteger(id) && id > 0))]
      if (!tag_ids.length) continue

      const next = { op: group.op, match: group.match, tag_ids }
      const key = `${next.op}.${next.match}.${next.tag_ids.join('.')}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(next)
    }
    return out
  }

  function sync(next: TagFilterGroup[]) {
    drafts.value = next.length ? next : [createGroup()]
    activeIndex.value = Math.min(activeIndex.value, drafts.value.length - 1)
    emit('update', { tag_groups: clean(next) })
  }

  function addGroup() {
    drafts.value = [...drafts.value, createGroup()]
    activeIndex.value = drafts.value.length - 1
  }

  function updateGroup(index: number, group: TagFilterGroup) {
    const next = drafts.value.map((item, i) => (i === index ? copyGroup(group) : item))
    sync(next)
  }

  function removeGroup(index: number) {
    sync(drafts.value.filter((_, i) => i !== index))
  }

  function removeTag(index: number, id: number) {
    const group = drafts.value[index]
    if (!group) return
    updateGroup(index, { ...group, tag_ids: group.tag_ids.filter(item => item !== id) })
  }

  function selectGroup(index: number) {
    activeIndex.value = index
  }

  function toggle(entity: { id: number; name: string }) {
    filter?.remember('tag', [entity])
    const group = activeGroup.value ?? createGroup()
    const tag_ids = group.tag_ids.includes(entity.id)
      ? group.tag_ids.filter(id => id !== entity.id)
      : [...group.tag_ids, entity.id]
    updateGroup(activeIndex.value, { ...group, tag_ids })
  }

  function selected(id: number) {
    return !!activeGroup.value?.tag_ids.includes(id)
  }
</script>

<template>
  <Popover :padded="false" class="w-120 max-w-[calc(100vw-2rem)]">
    <BrowseFilterTrigger
      :label="buttonText"
      :active="active"
      :count="activeTagCount"
      :disabled="disabled"
    />

    <template #content>
      <Stack gap="none">
        <Inline justify="between" :wrap="false" class="border-b border-line p-3">
          <Stack gap="none" class="min-w-0">
            <Text size="sm" weight="semibold">标签条件组</Text>
            <Text size="xs" tone="muted" class="mt-0.5">所有条件组同时生效</Text>
          </Stack>
          <Button variant="ghost" tone="neutral" size="sm" @click="addGroup">
            <template #icon><Plus /></template>
            添加组
          </Button>
        </Inline>

        <ScrollArea class="max-h-72">
          <Stack gap="sm" class="p-2">
            <BrowseTagFilterGroup
              v-for="(group, index) in drafts"
              :key="index"
              class="shrink-0"
              :group="group"
              :active="index === activeIndex"
              :can-remove="drafts.length > 1 || group.tag_ids.length > 0"
              @activate="selectGroup(index)"
              @remove="removeGroup(index)"
              @remove-tag="id => removeTag(index, id)"
              @update="value => updateGroup(index, value)"
            />
          </Stack>
        </ScrollArea>

        <Stack gap="sm" class="border-t border-line p-2">
          <SearchInput v-model="query" size="sm" clearable placeholder="搜索并加入当前条件组…" />

          <ScrollArea class="max-h-56" :aria-busy="loading">
            <Stack v-if="loading" gap="xs" role="status" aria-label="搜索中">
              <Inline v-for="index in 5" :key="index" gap="sm" class="rounded-md px-2 py-1.5">
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
                <Text as="span" size="sm" truncate class="min-w-0 flex-1">{{ row.name }}</Text>
                <Check v-if="selected(row.id)" class="size-4 shrink-0 text-accent-text" />
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
      </Stack>
    </template>
  </Popover>
</template>

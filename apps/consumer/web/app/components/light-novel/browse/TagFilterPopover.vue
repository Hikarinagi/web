<script setup lang="ts">
  import { Check, Plus, Search } from '@lucide/vue'
  import {
    useEntitySearch,
    type EntityTarget,
  } from '~/features/creator/composables/useEntitySearch'
  import type { LightNovelBrowseState, TagFilterGroup } from '~/features/light-novel/explore'
  import { BROWSE_FILTER_KEY } from '~/features/light-novel/useBrowseFilter'

  defineOptions({ name: 'LightNovelBrowseTagFilterPopover' })
  const props = defineProps<{
    groups: TagFilterGroup[]
    disabled?: boolean
  }>()
  const emit = defineEmits<{ update: [value: Partial<LightNovelBrowseState>] }>()

  const filter = inject(BROWSE_FILTER_KEY)
  const pop = ref()
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
  <Button
    unstyled
    :disabled="disabled"
    :class="[
      'box-border inline-flex h-9 min-w-24 items-center gap-1.5 rounded-lg border px-3 py-0 text-sm leading-none whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60',
      active
        ? 'border-hikari-primary-500 bg-hikari-primary-50 text-hikari-primary-700 dark:bg-hikari-primary-950 dark:text-hikari-primary-300'
        : 'border-surface-200 bg-surface-0 text-surface-700 hover:bg-surface-50 active:bg-surface-100 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:border-surface-600 dark:hover:bg-surface-800 dark:active:bg-surface-800',
    ]"
    @click="pop?.toggle($event)"
  >
    <Search class="size-3.5" />
    <span class="font-medium">{{ buttonText }}</span>
    <Tag v-if="active" class="h-4! min-w-4! px-1! py-0! text-[10px]! leading-none!" rounded>
      {{ activeTagCount }}
    </Tag>
  </Button>

  <Popover ref="pop" :pt="{ content: { class: 'p-0!' }, root: { class: 'popover-no-arrow' } }">
    <div class="flex w-120 max-w-[calc(100vw-2rem)] flex-col">
      <div
        class="flex items-center justify-between gap-3 border-b border-surface-100 p-3 dark:border-surface-800"
      >
        <div class="min-w-0">
          <p class="text-sm font-semibold text-surface-900 dark:text-surface-50">标签条件组</p>
          <p class="mt-0.5 text-xs text-surface-500 dark:text-surface-400">所有条件组同时生效</p>
        </div>
        <Button size="small" severity="secondary" text @click="addGroup">
          <Plus class="size-4" />
          添加组
        </Button>
      </div>

      <ScrollArea class="max-h-72">
        <div class="flex flex-col gap-2 p-2">
          <LightNovelBrowseTagFilterGroup
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
        </div>
      </ScrollArea>

      <div class="border-t border-surface-100 p-2 dark:border-surface-800">
        <InputText v-model="query" placeholder="搜索并加入当前条件组…" size="small" fluid />
        <ScrollArea class="mt-2 max-h-56" :aria-busy="loading">
          <div v-if="loading" class="flex flex-col gap-1" role="status" aria-label="搜索中">
            <div
              v-for="index in 5"
              :key="index"
              class="flex items-center gap-2 rounded-md px-2 py-1.5"
            >
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
              <span
                class="min-w-0 flex-1 truncate text-[13px] text-surface-700 dark:text-surface-300"
              >
                {{ row.name }}
              </span>
              <Check
                v-if="selected(row.id)"
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
        </ScrollArea>
      </div>
    </div>
  </Popover>
</template>

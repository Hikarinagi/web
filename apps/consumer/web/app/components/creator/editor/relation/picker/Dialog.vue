<script setup lang="ts">
  import {
    Button,
    Card,
    Center,
    Dialog,
    Empty,
    Grid,
    Ripple,
    SearchInput,
    SegmentedControl,
    Skeleton,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import type { BackendEntitySummary } from '~/features/creator/editor'
  import { CREATABLE_ENTITY } from '~/features/creator/editor/entity-create'
  import {
    useEntitySearch,
    type EntityTarget,
  } from '~/features/creator/composables/useEntitySearch'
  import type CreatorEditorRelationPickerCreate from './Create.vue'

  const props = defineProps<{
    target: EntityTarget
    mode: 'single' | 'multi'
    title?: string
    selectedEntities?: BackendEntitySummary[]
  }>()
  const visible = defineModel<boolean>('visible', { default: false })
  const emit = defineEmits<{ select: [items: BackendEntitySummary[]] }>()

  const tab = ref<'all' | 'selected'>('all')
  const staged = ref<BackendEntitySummary[]>([])
  const selectedIds = ref<Set<number>>(new Set())
  const { query, results, loading, searched, refresh, reset } = useEntitySearch(() => props.target)

  const createConfig = computed(() => CREATABLE_ENTITY[props.target] ?? null)
  const showCreate = computed(() => {
    if (!createConfig.value || tab.value !== 'all') return false
    const q = query.value.trim().toLowerCase()
    if (!q || loading.value || !searched.value) return false
    return true
  })
  const createLabel = computed(() => `新建「${query.value.trim()}」`)
  const creating = ref(false)
  const create = useTemplateRef<InstanceType<typeof CreatorEditorRelationPickerCreate>>('create')

  watch(visible, async v => {
    if (!v) return
    tab.value = 'all'
    creating.value = false
    reset()
    const initial = props.selectedEntities ?? []
    staged.value = [...initial]
    selectedIds.value = new Set(initial.map(i => i.id))
    await refresh()
  })

  const tabOptions = computed(() => [
    { value: 'all', label: '全部' },
    { value: 'selected', label: `已选 ${selectedIds.value.size}` },
  ])

  const visibleItems = computed(() => {
    if (tab.value === 'all') return results.value
    const q = query.value.toLowerCase().trim()
    if (!q) return staged.value
    return staged.value.filter(
      item => (item.name ?? '').toLowerCase().includes(q) || String(item.id).includes(q),
    )
  })

  const emptyText = computed(() => {
    if (tab.value === 'all') return query.value ? '没有匹配项' : '搜索以查看候选'
    return '尚未选择任何项'
  })

  const showSkeleton = computed(() => loading.value && tab.value === 'all')

  function toggle(item: BackendEntitySummary) {
    if (props.mode === 'single') {
      staged.value = [item]
      selectedIds.value = new Set([item.id])
      confirm()
      return
    }
    const next = new Set(selectedIds.value)
    if (next.has(item.id)) {
      next.delete(item.id)
    } else {
      next.add(item.id)
      if (!staged.value.some(s => s.id === item.id)) {
        staged.value = [...staged.value, item]
      }
    }
    selectedIds.value = next
  }

  function confirm() {
    emit(
      'select',
      staged.value.filter(s => selectedIds.value.has(s.id)),
    )
    visible.value = false
  }

  function onCreated(entity: BackendEntitySummary) {
    creating.value = false
    if (props.mode === 'single') {
      staged.value = [entity]
      selectedIds.value = new Set([entity.id])
      confirm()
      return
    }
    if (!staged.value.some(s => s.id === entity.id)) staged.value = [entity, ...staged.value]
    selectedIds.value = new Set([...selectedIds.value, entity.id])
    tab.value = 'selected'
  }
</script>

<template>
  <Dialog
    v-model:open="visible"
    :title="title || (mode === 'single' ? '选择' : '选择多个')"
    size="xl"
  >
    <template #content>
      <CreatorEditorRelationPickerCreate
        v-if="creating"
        ref="create"
        :target="target"
        :preset-name="query"
        @created="onCreated"
      />

      <Stack v-else gap="sm">
        <SearchInput v-model="query" placeholder="搜索 名字 / 别名 / ID…" />

        <SegmentedControl v-if="mode === 'multi'" v-model="tab" :options="tabOptions" size="sm" />

        <Grid v-if="showSkeleton" :cols="3" gap="sm">
          <Stack v-for="index in 9" :key="index" gap="xs" class="rounded-lg border border-line p-2">
            <Skeleton class="aspect-square w-full rounded" />
            <Skeleton class="h-3.5 w-3/5" />
            <Skeleton class="h-3 w-1/3" />
          </Stack>
        </Grid>

        <Grid v-else-if="visibleItems.length || showCreate" :cols="3" gap="sm">
          <Card
            v-if="showCreate"
            as="button"
            type="button"
            :padded="false"
            :class="'hn-state-layer w-full hn-interactive border-dashed p-2 text-start hn-press-lg'"
            @click="creating = true"
          >
            <Ripple />
            <Stack gap="xs">
              <Center class="aspect-square w-full rounded bg-inset">
                <Plus class="size-6 text-muted" aria-hidden="true" />
              </Center>
              <Text as="span" size="sm" weight="medium" truncate>{{ createLabel }}</Text>
              <Text as="span" size="xs" tone="muted">{{ createConfig?.label }}</Text>
            </Stack>
          </Card>

          <CreatorEditorRelationPickerCard
            v-for="item in visibleItems"
            :key="item.id"
            :item="item"
            :target="target"
            :selected="selectedIds.has(item.id)"
            @click="toggle(item)"
          />
        </Grid>

        <Empty v-else size="sm" :title="emptyText" />
      </Stack>
    </template>

    <template #footer>
      <template v-if="creating">
        <Button
          variant="ghost"
          tone="neutral"
          :disabled="create?.submitting"
          @click="creating = false"
        >
          返回
        </Button>
        <Button :loading="create?.submitting" @click="create?.submit()">创建并选择</Button>
      </template>
      <template v-else>
        <Text size="sm" tone="muted" class="min-w-0 flex-1 self-center text-start">
          已选 {{ selectedIds.size }} 项
        </Text>
        <Button variant="ghost" tone="neutral" @click="visible = false">取消</Button>
        <Button v-if="mode === 'multi'" @click="confirm">确认</Button>
      </template>
    </template>
  </Dialog>
</template>

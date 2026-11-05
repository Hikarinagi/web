<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { Button, Card, Dialog, Heading, Skeleton, Stack, Text, toast } from '@hina-ui/vue'
  import { shownEntries } from '~/features/wiki/changes'
  import type { ChangePageData } from '~~/server/api/pages/create/wiki/changes/[id].get'

  defineOptions({ name: 'WikiChangesUndo' })

  const props = defineProps<{
    edit: ChangePageData['edit']
    names: ChangePageData['names']
    entry?: number
  }>()
  const emit = defineEmits<{ done: [] }>()
  const open = defineModel<boolean>('open', { required: true })

  const plan = shallowRef<ApiData<'/api/v3/wiki/edits/{id}/revert', 'get'> | null>(null)
  const submitting = ref(false)
  const bus = useWikiSavedBus()
  const parts = computed(() =>
    shownEntries(props.edit.entries.map(part => ({ ...part, type: part.entry.type }))).filter(
      part =>
        part.comparison && !part.reverted_at && (!props.entry || part.entry.id === props.entry),
    ),
  )
  const rest = computed(() =>
    props.entry ? 0 : props.edit.entry_count - props.edit.entries.length,
  )
  const kept = (entry: number) =>
    plan.value?.kept.flatMap(item =>
      item.entry_id === entry && item.statement_id !== null ? [item.statement_id] : [],
    ) ?? []
  const changedSince = (entry: number) =>
    plan.value?.kept.some(item => item.entry_id === entry && item.statement_id === null) ?? false

  watch(
    open,
    async next => {
      if (!next) return
      plan.value = null
      plan.value = await hikariRequest('/api/v3/wiki/edits/{id}/revert', {
        path: { id: props.edit.id },
        query: props.entry ? { entry_id: props.entry } : {},
      })
    },
    { immediate: true },
  )

  async function confirm() {
    submitting.value = true
    try {
      const result = await hikariRequest('/api/v3/wiki/edits/{id}/revert', {
        method: 'POST',
        path: { id: props.edit.id },
        body: props.entry ? { entry_id: props.entry } : {},
      })
      if ('entries' in result) bus.emit(result.entries)
      toast.success(
        result.kept.length
          ? `已撤销，${result.kept.length} 处此后已有新的修改，保持不变`
          : '已撤销',
      )
      emit('done')
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="open" title="撤销本次修改" size="md" :locked="submitting">
    <template #content>
      <Stack v-if="!plan" gap="sm">
        <Skeleton class="h-6 w-1/3" />
        <Skeleton class="h-20" />
      </Stack>
      <Stack v-else gap="lg">
        <Stack v-for="part in parts" :key="part.entry.id" gap="sm">
          <Heading :level="3" size="xs">
            {{ names[part.entry.type]?.label }}：{{ part.entry.label || '未命名' }}
          </Heading>
          <Text v-if="changedSince(part.entry.id)" size="sm" tone="danger">
            此后已有新的修改，条目本身保持不变
          </Text>
          <Card :padded="false" class="overflow-hidden">
            <WikiDiffTable
              :comparison="part.comparison!"
              :names="names[part.entry.type]?.properties ?? {}"
              :kept="kept(part.entry.id)"
              reverse
            />
          </Card>
        </Stack>
        <Text v-if="rest" size="sm" tone="muted">另有 {{ rest }} 个条目上的修改一并撤销</Text>
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button tone="danger" :loading="submitting" :disabled="!plan || plan.empty" @click="confirm">
        撤销
      </Button>
    </template>
  </Dialog>
</template>

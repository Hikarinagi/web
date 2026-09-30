<script setup lang="ts">
  import {
    Button,
    Center,
    Dialog,
    Empty,
    RadioGroup,
    Spinner,
    Stack,
    Text,
    toast,
  } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { getLightNovelVolumeLabel, getLightNovelVolumeTitle } from '~/utils/media/light-novel'

  type TermSource = ApiData<'/api/v3/novel-projects/{project_id}/terms/sources', 'get'>[number]

  const props = defineProps<{ projectId: number }>()
  const open = defineModel<boolean>('open', { required: true })
  const emit = defineEmits<{ imported: [] }>()

  const sources = ref<TermSource[] | null>(null)
  const picked = ref<number>()
  const importing = ref(false)

  const options = computed(() =>
    (sources.value ?? []).map(source => ({
      value: source.id,
      label: getLightNovelVolumeLabel(source.volume) ?? getLightNovelVolumeTitle(source.volume),
      description: `${displayName(source.owner)} · 术语：${source.term_count}`,
    })),
  )
  const selected = computed(() => sources.value?.find(source => source.id === picked.value))
  const preview = computed(() => {
    if (!selected.value) return ''
    const kept = selected.value.term_count - selected.value.new_count
    const added = `这将添加 ${selected.value.new_count} 项。`
    return kept ? `${added}${kept} 项已存在，不会更改。` : added
  })

  watch(open, async next => {
    if (!next) return
    sources.value = null
    try {
      sources.value = await hikariRequest('/api/v3/novel-projects/{project_id}/terms/sources', {
        path: { project_id: props.projectId },
      })
      picked.value = sources.value[0]?.id
    } catch {
      open.value = false
    }
  })

  async function submit() {
    if (!selected.value || importing.value) return
    importing.value = true
    try {
      await hikariRequest('/api/v3/novel-projects/{project_id}/terms/import', {
        method: 'POST',
        path: { project_id: props.projectId },
        body: { from_project_id: selected.value.id },
      })
      toast.success('术语表已导入。')
      open.value = false
      emit('imported')
    } finally {
      importing.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="open" title="导入术语表" size="sm" :locked="importing">
    <template #content>
      <Center v-if="!sources" class="py-8"><Spinner /></Center>
      <Empty v-else-if="!sources.length" size="sm" title="本系列中没有其他项目有术语表" />
      <Stack v-else gap="md">
        <RadioGroup v-model="picked" :options="options" aria-label="源项目" />
        <Text v-if="selected" size="sm" tone="muted">{{ preview }}</Text>
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="importing" @click="open = false">
        取消
      </Button>
      <Button :loading="importing" :disabled="!selected?.new_count" @click="submit">导入</Button>
    </template>
  </Dialog>
</template>

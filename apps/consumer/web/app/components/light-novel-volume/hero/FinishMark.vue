<script setup lang="ts">
  import { Button, DropdownMenu, DropdownMenuItem, toast } from '@hina-ui/vue'
  import { ChevronDown } from '@lucide/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

  defineOptions({ name: 'LightNovelVolumeHeroFinishMark' })

  const props = defineProps<{
    volumeId: number
    progress: LightNovelVolumePageData['progress']
    precedingCount: number
  }>()
  const emit = defineEmits<{ change: [NonNullable<LightNovelVolumePageData['progresses']>] }>()

  const busy = ref(false)
  const marked = computed(() => Boolean(props.progress?.marked_finished_at))

  async function mark(through: boolean) {
    if (busy.value) return
    busy.value = true
    try {
      const result = await hikariRequest<'/api/v3/reader/volumes/{volume_id}/finished', 'put'>(
        '/api/v3/reader/volumes/{volume_id}/finished',
        { method: 'put', path: { volume_id: props.volumeId }, body: { through } },
      )
      emit('change', result.progresses)
      toast.success(through ? `已将 ${props.precedingCount} 卷标记为已读` : '已将本卷标记为已读')
    } catch {
      /* empty */
    } finally {
      busy.value = false
    }
  }

  async function undo() {
    if (busy.value) return
    busy.value = true
    try {
      const result = await hikariRequest<'/api/v3/reader/volumes/{volume_id}/finished', 'delete'>(
        '/api/v3/reader/volumes/{volume_id}/finished',
        { method: 'delete', path: { volume_id: props.volumeId } },
      )
      emit('change', result.progresses)
      toast.success('已撤销标记')
    } catch {
      /* empty */
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <Button
    v-if="marked"
    variant="link"
    tone="neutral"
    size="sm"
    class="text-xs"
    :loading="busy"
    @click="undo"
  >
    撤销标记
  </Button>

  <Button
    v-else-if="precedingCount <= 1"
    variant="link"
    tone="neutral"
    size="sm"
    class="text-xs"
    :loading="busy"
    @click="mark(false)"
  >
    标记为已读
  </Button>

  <DropdownMenu v-else label="标记为已读" align="start">
    <Button variant="link" tone="neutral" size="sm" class="text-xs" :loading="busy">
      标记为已读
      <template #trailing><ChevronDown /></template>
    </Button>
    <template #content>
      <DropdownMenuItem @select="mark(false)">仅本卷</DropdownMenuItem>
      <DropdownMenuItem @select="mark(true)">
        本卷及之前的 {{ precedingCount - 1 }} 卷
      </DropdownMenuItem>
    </template>
  </DropdownMenu>
</template>

<script setup lang="ts">
  import { Empty, IconButton, Inline, Link, Panel, Stack, Text } from '@hina-ui/vue'
  import { Trash2 } from '@lucide/vue'
  import type { BackendMangaNote } from '~/features/workbench/manga/manga'
  import { useMangaReview } from '~/features/workbench/manga/review/context'

  const emit = defineEmits<{ navigate: [] }>()

  const auth = useAuthStore()
  const { notes, state, project, focus, openNote } = useMangaReview()
  const numbers = computed(() => new Map(state.rows.value.map(row => [row.page.id, row.number])))
  const removable = (note: BackendMangaNote) =>
    note.user.id === auth.user?.id && project.value.status === 'REVIEW'
  const removing = ref<number | null>(null)

  function open(note: BackendMangaNote) {
    openNote(note)
    emit('navigate')
  }

  async function remove(note: BackendMangaNote) {
    if (removing.value) return
    removing.value = note.id
    try {
      await hikariRequest('/api/v3/manga-project-notes/{note_id}', {
        method: 'delete',
        path: { note_id: note.id },
      })
      notes.value = notes.value.filter(item => item.id !== note.id)
      if (focus.value?.page_id === note.page_id) focus.value = null
    } finally {
      removing.value = null
    }
  }
</script>

<template>
  <Panel title="批注" :count="notes.length">
    <Empty v-if="!notes.length" size="sm" :icon="false" title="暂无批注" />
    <Stack v-else gap="xs">
      <Stack v-for="note in notes" :key="note.id" gap="xs" class="rounded-lg bg-subtle px-3 py-2">
        <Inline gap="sm" align="center" :wrap="false">
          <Link as="button" type="button" class="text-sm font-medium" @click="open(note)">
            第 {{ numbers.get(note.page_id) ?? '?' }} 页
          </Link>
          <Text size="xs" tone="muted" truncate class="min-w-0 flex-1">
            {{ note.user.id === auth.user?.id ? '你' : note.user.nickname || note.user.name }}
            · {{ timeFromNow(note.created_at) }}
          </Text>
          <IconButton
            v-if="removable(note)"
            label="删除批注"
            size="sm"
            variant="ghost"
            tone="neutral"
            :loading="removing === note.id"
            @click="remove(note)"
          >
            <Trash2 />
          </IconButton>
        </Inline>
        <Text size="sm" class="break-words whitespace-pre-line">{{ note.content }}</Text>
      </Stack>
    </Stack>
  </Panel>
</template>

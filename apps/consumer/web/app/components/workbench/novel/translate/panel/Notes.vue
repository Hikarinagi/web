<script setup lang="ts">
  import { Button, IconButton, Inline, Stack, Text, Textarea } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { X } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'

  const props = defineProps<{ segmentId: string }>()

  const auth = useAuthStore()
  const notes = ref<ApiData<'/api/v3/novel-segments/{segment_id}/notes', 'get'>>([])
  const content = ref('')
  const posting = ref(false)

  async function load(id: string) {
    notes.value = await hikariRequest('/api/v3/novel-segments/{segment_id}/notes', {
      path: { segment_id: id },
      toast: false,
    }).catch(() => [])
  }

  watch(() => props.segmentId, load, { immediate: true })

  async function post() {
    const text = content.value.trim()
    if (!text || posting.value) return
    posting.value = true
    try {
      await hikariRequest('/api/v3/novel-segments/{segment_id}/notes', {
        method: 'POST',
        path: { segment_id: props.segmentId },
        body: { content: text },
      })
      content.value = ''
      await load(props.segmentId)
    } finally {
      posting.value = false
    }
  }

  async function remove(noteId: number) {
    await hikariRequest('/api/v3/novel-notes/{note_id}', {
      method: 'DELETE',
      path: { note_id: noteId },
    })
    await load(props.segmentId)
  }
</script>

<template>
  <Stack gap="sm">
    <Text v-if="!notes.length" size="sm" tone="muted">还没有批注。</Text>
    <Stack v-else gap="none" class="divide-y divide-line">
      <Stack v-for="note in notes" :key="note.id" gap="none">
        <Inline gap="sm" align="start" :wrap="false" class="py-2">
          <Stack gap="none" class="min-w-0 flex-1">
            <Inline gap="xs" align="center">
              <UserName :user="note.user" :handle="false" class="text-sm" />
              <Text size="xs" tone="muted">{{ timeFormat(note.created_at) }}</Text>
            </Inline>
            <Text size="sm" class="whitespace-pre-wrap">{{ note.content }}</Text>
          </Stack>
          <IconButton
            v-if="note.user.id === auth.user?.id"
            label="删除批注"
            variant="ghost"
            size="sm"
            @click="remove(note.id)"
          >
            <X />
          </IconButton>
        </Inline>
      </Stack>
    </Stack>
    <Textarea
      v-model="content"
      :rows="2"
      placeholder="写下有关此段落的问题或批注"
      aria-label="批注"
    />
    <Inline justify="end">
      <Button size="sm" :loading="posting" :disabled="!content.trim()" @click="post">发表</Button>
    </Inline>
  </Stack>
</template>

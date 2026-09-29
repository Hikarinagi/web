<script setup lang="ts">
  import { Button, IconButton, Inline, Stack, Text, Textarea } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { X } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'

  const props = defineProps<{ regionId: string; persisted: boolean; member: boolean }>()

  const auth = useAuthStore()
  const notes = ref<ApiData<'/api/v3/manga-text-regions/{region_id}/notes', 'get'>>([])
  const content = ref('')
  const posting = ref(false)

  async function load() {
    if (!props.persisted) {
      notes.value = []
      return
    }
    notes.value = await hikariRequest('/api/v3/manga-text-regions/{region_id}/notes', {
      path: { region_id: props.regionId },
      toast: false,
    }).catch(() => [])
  }

  watch(() => [props.regionId, props.persisted], load, { immediate: true })

  async function post() {
    const text = content.value.trim()
    if (!text || posting.value) return
    posting.value = true
    try {
      await hikariRequest('/api/v3/manga-text-regions/{region_id}/notes', {
        method: 'post',
        path: { region_id: props.regionId },
        body: { content: text },
      })
      content.value = ''
      await load()
    } finally {
      posting.value = false
    }
  }

  async function remove(noteId: number) {
    await hikariRequest('/api/v3/manga-project-notes/{note_id}', {
      method: 'delete',
      path: { note_id: noteId },
    })
    await load()
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
    <template v-if="member && persisted">
      <Textarea
        v-model="content"
        :rows="2"
        placeholder="写下有关此文本框的问题或解释"
        aria-label="批注"
      />
      <Inline justify="end">
        <Button
          size="sm"
          variant="soft"
          :loading="posting"
          :disabled="!content.trim()"
          @click="post"
        >
          添加批注
        </Button>
      </Inline>
    </template>
  </Stack>
</template>

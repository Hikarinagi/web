<script setup lang="ts">
  import { Button, Inline, Stack, Tag, Text, Textarea } from '@hina-ui/vue'
  import type { BackendMangaRegion } from '~/features/workbench/manga/manga'

  const props = defineProps<{
    translation: BackendMangaRegion['translations'][number]
    canProofread: boolean
    busy: boolean
  }>()
  const emit = defineEmits<{ select: []; changed: [] }>()

  const editing = ref(false)
  const saving = ref(false)
  const draft = ref('')

  function open() {
    draft.value = props.translation.proofread_text ?? props.translation.text
    editing.value = true
  }

  async function save(clear: boolean) {
    if (saving.value) return
    saving.value = true
    try {
      await hikariRequest('/api/v3/manga-region-translations/{translation_id}/proofread', {
        method: 'put',
        path: { translation_id: props.translation.id },
        body: { text: clear ? null : draft.value.trim() || null },
      })
      editing.value = false
      emit('changed')
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <Stack gap="xs">
    <Inline gap="xs" align="center">
      <UserName :user="translation.user" :handle="false" class="text-sm" />
      <Tag v-if="translation.selected" size="sm" tone="success" variant="soft">已选用</Tag>
      <Tag v-if="translation.machine" size="sm" tone="warning" variant="outline">机翻</Tag>
      <Tag v-if="translation.proofread_text" size="sm" tone="info" variant="outline">已校对</Tag>
    </Inline>
    <Text size="sm" class="whitespace-pre-wrap">
      {{ translation.proofread_text ?? translation.text }}
    </Text>
    <Text v-if="translation.proofread_text" size="xs" tone="faint" class="whitespace-pre-wrap">
      原译：{{ translation.text }}
    </Text>
    <template v-if="editing">
      <Textarea v-model="draft" :rows="2" autosize aria-label="校对稿" />
      <Inline gap="xs" justify="end">
        <Button
          size="sm"
          variant="ghost"
          tone="neutral"
          :disabled="saving"
          @click="editing = false"
        >
          取消
        </Button>
        <Button
          v-if="translation.proofread_text"
          size="sm"
          variant="ghost"
          tone="danger"
          :disabled="saving"
          @click="save(true)"
        >
          清除校对
        </Button>
        <Button size="sm" :loading="saving" @click="save(false)">保存校对</Button>
      </Inline>
    </template>
    <Inline v-else-if="canProofread" gap="xs" justify="end">
      <Button size="sm" variant="ghost" tone="neutral" :disabled="busy" @click="open">校对</Button>
      <Button
        v-if="!translation.selected"
        size="sm"
        variant="soft"
        :disabled="busy"
        @click="emit('select')"
      >
        选用
      </Button>
    </Inline>
  </Stack>
</template>

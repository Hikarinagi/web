<script setup lang="ts">
  import { Button, Inline, Stack, Tag, Text, Textarea } from '@hina-ui/vue'
  import type {
    BackendNovelProject,
    BackendNovelSegment,
    BackendNovelTranslation,
  } from '~/features/workbench/workbench'

  const props = defineProps<{ project: BackendNovelProject; segment: BackendNovelSegment }>()
  const emit = defineEmits<{ changed: []; useText: [text: string] }>()

  const canProofread = computed(() => props.project.viewer_capabilities.includes('proofread'))
  const proofreading = ref<number | null>(null)
  const proofText = ref('')
  const busy = ref(false)

  function startProofread(item: BackendNovelTranslation) {
    proofreading.value = item.id
    proofText.value = item.proofread_text ?? item.text
  }

  async function select(item: BackendNovelTranslation) {
    busy.value = true
    try {
      await hikariRequest('/api/v3/novel-translations/{translation_id}/select', {
        method: 'POST',
        path: { translation_id: item.id },
      })
      emit('changed')
    } finally {
      busy.value = false
    }
  }

  async function saveProofread(item: BackendNovelTranslation, text: string | null) {
    busy.value = true
    try {
      await hikariRequest('/api/v3/novel-translations/{translation_id}/proofread', {
        method: 'PUT',
        path: { translation_id: item.id },
        body: { text },
      })
      proofreading.value = null
      emit('changed')
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <Text v-if="!segment.translations.length" size="sm" tone="muted">还没有人翻译这一段。</Text>
  <Stack v-else gap="none" class="divide-y divide-line">
    <Stack v-for="item in segment.translations" :key="item.id" gap="none">
      <Stack gap="xs" class="py-3">
        <Inline gap="xs" align="center">
          <UserName :user="item.user" :handle="false" class="text-sm" />
          <Tag v-if="item.selected" size="sm" tone="success">选定</Tag>
          <Tag v-if="item.machine" size="sm" tone="warning" variant="outline">机翻</Tag>
          <Tag v-else-if="item.from_machine" size="sm" tone="warning" variant="outline"
            >机翻修改</Tag
          >
        </Inline>
        <WorkbenchMarkupText :text="item.text" />
        <Stack v-if="item.proofread_text && proofreading !== item.id" gap="none">
          <Text size="xs" tone="muted">校对稿</Text>
          <WorkbenchMarkupText :text="item.proofread_text" />
        </Stack>
        <Stack v-if="proofreading === item.id" gap="xs">
          <Textarea
            v-model="proofText"
            :autosize="{ minRows: 2, maxRows: 8 }"
            aria-label="校对稿"
          />
          <Inline gap="xs" justify="end">
            <Button size="sm" variant="ghost" tone="neutral" @click="proofreading = null"
              >取消</Button
            >
            <Button
              v-if="item.proofread_text"
              size="sm"
              variant="ghost"
              tone="danger"
              :disabled="busy"
              @click="saveProofread(item, null)"
            >
              清除校对稿
            </Button>
            <Button
              size="sm"
              :loading="busy"
              :disabled="!proofText.trim()"
              @click="saveProofread(item, proofText)"
            >
              保存校对
            </Button>
          </Inline>
        </Stack>
        <Inline v-else gap="xs">
          <Button
            size="sm"
            variant="ghost"
            @click="emit('useText', item.proofread_text ?? item.text)"
          >
            引用
          </Button>
          <template v-if="canProofread">
            <Button size="sm" variant="ghost" @click="startProofread(item)">校对</Button>
            <Button
              v-if="!item.selected"
              size="sm"
              variant="ghost"
              :disabled="busy"
              @click="select(item)"
            >
              选定
            </Button>
          </template>
        </Inline>
      </Stack>
    </Stack>
  </Stack>
</template>

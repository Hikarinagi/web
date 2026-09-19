<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import {
    Button,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Dialog,
    FormField,
    Stack,
    Text,
    Textarea,
  } from '@hina-ui/vue'
  import { Flag } from '@lucide/vue'

  defineOptions({ name: 'HikariReaderReportDialog' })

  const props = defineProps<{
    snapshot: Record<string, unknown> | null
    submitting: boolean
  }>()

  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{
    submit: [note: string | null]
  }>()

  const note = ref('')

  watch(visible, value => {
    if (value) note.value = ''
  })

  const summary = computed(() => {
    const s = props.snapshot ?? {}
    const chapter = s.chapter as { title?: string | null } | null
    const ritoVersion = s.rito_version as { core?: string } | null
    const spread =
      typeof s.current_spread === 'number' && typeof s.total_spreads === 'number' && s.total_spreads
        ? `${s.current_spread + 1} / ${s.total_spreads}`
        : '—'
    const progress = typeof s.progress === 'number' ? `${(s.progress * 100).toFixed(1)}%` : '—'
    const runtime = s.runtime_error as { message?: string; source?: string } | null
    return {
      chapter: chapter?.title || '—',
      spread,
      progress,
      rito: ritoVersion?.core ? `Rito ${ritoVersion.core}` : '—',
      error: (s.error as string | null) || runtime?.message || null,
      source: runtime?.source || null,
    }
  })

  function submit() {
    const trimmed = note.value.trim()
    emit('submit', trimmed.length ? trimmed : null)
  }

  function cancel() {
    if (props.submitting) return
    visible.value = false
  }
</script>

<template>
  <Dialog
    v-model:open="visible"
    title="报告渲染问题"
    description="提交后会附带当前页面的渲染快照（章节、页码、进度、视口、阅读设置等），帮助我们定位并修复 Rito 排版问题。"
    :locked="submitting"
  >
    <template #icon><Flag /></template>

    <template #content>
      <Stack gap="md">
        <DescriptionList class="rounded-md bg-subtle p-3 text-sm">
          <DescriptionTerm>章节</DescriptionTerm>
          <DescriptionDetails class="truncate">{{ summary.chapter }}</DescriptionDetails>
          <DescriptionTerm>页码</DescriptionTerm>
          <DescriptionDetails>{{ summary.spread }}</DescriptionDetails>
          <DescriptionTerm>进度</DescriptionTerm>
          <DescriptionDetails>{{ summary.progress }}</DescriptionDetails>
          <DescriptionTerm>版本</DescriptionTerm>
          <DescriptionDetails>{{ summary.rito }}</DescriptionDetails>
          <template v-if="summary.error">
            <DescriptionTerm>报错</DescriptionTerm>
            <DescriptionDetails>
              <Text as="span" tone="danger" size="sm" class="break-all">{{ summary.error }}</Text>
            </DescriptionDetails>
          </template>
          <template v-if="summary.source">
            <DescriptionTerm>来源</DescriptionTerm>
            <DescriptionDetails>
              <Text as="span" tone="muted" size="sm" class="break-all">{{ summary.source }}</Text>
            </DescriptionDetails>
          </template>
        </DescriptionList>

        <FormField label="补充说明（可选）">
          <Textarea
            v-model="note"
            autosize
            maxlength="1000"
            placeholder="描述一下哪里渲染不对，比如文字重叠、图片缺失、空白页…"
          />
        </FormField>
      </Stack>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="cancel">取消</Button>
      <Button :loading="submitting" @click="submit">提交反馈</Button>
    </template>
  </Dialog>
</template>

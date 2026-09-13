<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
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
    return {
      chapter: chapter?.title || '—',
      spread,
      progress,
      rito: ritoVersion?.core ? `Rito ${ritoVersion.core}` : '—',
      error: (s.error as string | null) || null,
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
    v-model:visible="visible"
    modal
    :draggable="false"
    :close-on-escape="!submitting"
    :dismissable-mask="!submitting"
    class="mx-4 w-[calc(100vw-2rem)] max-w-md"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <Flag :size="18" class="text-primary" aria-hidden="true" />
        <span class="text-base font-semibold">报告渲染问题</span>
      </div>
    </template>

    <div class="space-y-4">
      <p class="text-sm leading-6 text-muted-color">
        提交后会附带当前页面的渲染快照（章节、页码、进度、视口、阅读设置等），帮助我们定位并修复
        Rito 排版问题。
      </p>

      <dl class="grid grid-cols-[4rem_1fr] gap-x-3 gap-y-1.5 rounded-md p-3 text-sm bg-emphasis">
        <dt class="text-muted-color">章节</dt>
        <dd class="truncate">{{ summary.chapter }}</dd>
        <dt class="text-muted-color">页码</dt>
        <dd>{{ summary.spread }}</dd>
        <dt class="text-muted-color">进度</dt>
        <dd>{{ summary.progress }}</dd>
        <dt class="text-muted-color">版本</dt>
        <dd>{{ summary.rito }}</dd>
        <template v-if="summary.error">
          <dt class="text-muted-color">报错</dt>
          <dd class="break-all text-red-500">{{ summary.error }}</dd>
        </template>
      </dl>

      <div class="space-y-1.5">
        <label for="reader-report-note" class="text-sm font-medium">补充说明（可选）</label>
        <Textarea
          id="reader-report-note"
          v-model="note"
          rows="3"
          auto-resize
          maxlength="1000"
          class="w-full"
          placeholder="描述一下哪里渲染不对，比如文字重叠、图片缺失、空白页…"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          label="取消"
          severity="secondary"
          variant="text"
          :disabled="submitting"
          @click="cancel"
        />
        <Button label="提交反馈" :loading="submitting" @click="submit" />
      </div>
    </template>
  </Dialog>
</template>

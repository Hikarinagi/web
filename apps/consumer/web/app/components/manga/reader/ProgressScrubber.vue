<script setup lang="ts">
  defineOptions({ name: 'MangaReaderProgressScrubber' })

  const props = defineProps<{
    total: number
    /** Highest page reached in the current spread. */
    filled: number
  }>()

  const emit = defineEmits<{ jump: [page: number] }>()

  /** Non-null only while the user is scrubbing, so the track can lead the page. */
  const draft = ref<number | null>(null)

  const value = computed(() => draft.value ?? props.filled)
  const label = computed(() => `${value.value} / ${props.total}`)

  /**
   * `slideend` covers dragging, but a click on the track only emits `change`,
   * so both paths funnel here. Landing on the current page is a no-op.
   */
  function commit() {
    const target = value.value
    draft.value = null
    if (target !== props.filled) emit('jump', target)
  }
</script>

<template>
  <div v-if="total > 1" class="flex items-center gap-3">
    <!--
      The stage is fixed right-to-left, so the track is too: page 1 sits at the
      right end and the fill grows leftwards. `dir` is what drives that — Slider
      resolves RTL from the computed direction, mirroring both its pointer maths
      and the logical `inset-inline-start` its range and handle are placed with.
      The bound value stays the real page number; mirroring it by hand would
      leave the fill running backwards.
    -->
    <Slider
      dir="rtl"
      :model-value="value"
      :min="1"
      :max="total"
      :step="1"
      class="flex-1"
      :aria-label="`阅读进度，第 ${value} 页，共 ${total} 页`"
      :pt="{
        root: { class: '!h-1 !bg-white/20' },
        range: { class: '!bg-primary' },
        handle: { class: '!border-2 !border-white !bg-primary' },
      }"
      @change="next => (draft = Array.isArray(next) ? next[0]! : next)"
      @slideend="commit"
      @pointerup="commit"
    />
    <p class="w-16 shrink-0 text-right text-[11px] text-[#b8c2d1] tabular-nums">{{ label }}</p>
  </div>
</template>

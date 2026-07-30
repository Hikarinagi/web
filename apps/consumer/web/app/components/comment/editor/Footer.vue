<script setup lang="ts">
  import { AtSign, Boxes, EyeOff, Image, Smile } from '@lucide/vue'

  defineOptions({ name: 'CommentEditorFooter' })

  const props = defineProps<{
    submitting?: boolean
    submitLabel: string
    cancelLabel: string
    showCancel: boolean
    isEmpty: boolean
    imageFull?: boolean
    charCount?: number
    charLimit?: number
    overLimit?: boolean
    selectionEmpty?: boolean
    spoilerActive?: boolean
  }>()

  defineEmits<{
    'emoji-click': [event: MouseEvent]
    'mention-click': []
    'spoiler-click': []
    'image-click': []
    'work-card-click': [event: MouseEvent]
    submit: []
    cancel: []
  }>()

  const countColor = computed(() => {
    if (props.overLimit) return 'text-red-500'
    if (props.charLimit && (props.charCount ?? 0) > props.charLimit * 0.9) return 'text-amber-500'
    return 'text-surface-400'
  })
</script>

<template>
  <div class="flex items-center gap-2 px-2 py-1.5 dark:border-surface-800">
    <ScrollArea
      axis="x"
      shadow="end"
      visibility="hidden"
      wheel-to-horizontal
      class="min-w-0 flex-1"
    >
      <div class="flex min-w-max items-center gap-1">
        <Button
          v-tooltip.top="'插入贴纸'"
          text
          severity="secondary"
          size="small"
          :disabled="submitting"
          class="shrink-0 py-1!"
          @click="(e: MouseEvent) => $emit('emoji-click', e)"
        >
          <template #icon>
            <Smile :size="18" />
          </template>
        </Button>
        <Button
          v-tooltip.top="imageFull ? '最多 9 张图片' : '添加图片'"
          text
          severity="secondary"
          size="small"
          :disabled="submitting || imageFull"
          class="shrink-0 py-1!"
          @click="$emit('image-click')"
        >
          <template #icon>
            <Image :size="18" />
          </template>
        </Button>
        <Button
          v-tooltip.top="'插入作品'"
          aria-label="插入作品"
          text
          severity="secondary"
          size="small"
          :disabled="submitting"
          class="shrink-0 py-1!"
          @click="(e: MouseEvent) => $emit('work-card-click', e)"
        >
          <template #icon>
            <Boxes :size="18" />
          </template>
        </Button>
        <Button
          v-tooltip.top="'提及用户'"
          aria-label="提及用户"
          text
          severity="secondary"
          size="small"
          :disabled="submitting"
          class="shrink-0 py-1!"
          @mousedown.prevent
          @click="$emit('mention-click')"
        >
          <template #icon>
            <AtSign :size="18" />
          </template>
        </Button>
        <Button
          v-tooltip.top="selectionEmpty ? '选中文字后设为剧透' : '设为剧透'"
          aria-label="设为剧透"
          text
          :severity="spoilerActive ? undefined : 'secondary'"
          size="small"
          :disabled="submitting || selectionEmpty"
          class="shrink-0 py-1!"
          @mousedown.prevent
          @click="$emit('spoiler-click')"
        >
          <template #icon>
            <EyeOff :size="18" />
          </template>
        </Button>
      </div>
    </ScrollArea>

    <div class="flex shrink-0 items-center gap-2">
      <span
        v-if="charLimit && (charCount ?? 0) > 0"
        class="shrink-0 text-xs tabular-nums"
        :class="countColor"
      >
        {{ charCount }}/{{ charLimit }}
      </span>
      <Button
        v-if="showCancel"
        :label="cancelLabel"
        severity="secondary"
        text
        size="small"
        class="shrink-0 py-1!"
        :disabled="submitting"
        @click="$emit('cancel')"
      />
      <Button
        :label="submitLabel"
        size="small"
        :loading="submitting"
        :disabled="isEmpty || overLimit"
        class="shrink-0 py-1!"
        @click="$emit('submit')"
      />
    </div>
  </div>
</template>

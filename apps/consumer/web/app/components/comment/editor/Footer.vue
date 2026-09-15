<script setup lang="ts">
  import { Button, IconButton, Inline, Text } from '@hina-ui/vue'
  import { AtSign, Boxes, EyeOff, Image, Smile } from '@lucide/vue'
  import { cn } from '~/utils/cn'

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
    if (props.overLimit) return 'text-danger-text'
    if (props.charLimit && (props.charCount ?? 0) > props.charLimit * 0.9)
      return 'text-warning-text'
    return 'text-faint'
  })
</script>

<template>
  <Inline gap="sm" :wrap="false" class="px-2 py-1.5">
    <ScrollArea
      axis="x"
      shadow="end"
      visibility="hidden"
      wheel-to-horizontal
      class="min-w-0 flex-1"
    >
      <Inline gap="xs" class="min-w-max">
        <IconButton
          label="插入贴纸"
          size="sm"
          :disabled="submitting"
          class="shrink-0"
          @click="(e: MouseEvent) => $emit('emoji-click', e)"
        >
          <Smile />
        </IconButton>
        <IconButton
          :label="imageFull ? '最多 9 张图片' : '添加图片'"
          size="sm"
          :disabled="submitting || imageFull"
          class="shrink-0"
          @click="$emit('image-click')"
        >
          <Image />
        </IconButton>
        <IconButton
          label="插入作品"
          size="sm"
          :disabled="submitting"
          class="shrink-0"
          @click="(e: MouseEvent) => $emit('work-card-click', e)"
        >
          <Boxes />
        </IconButton>
        <IconButton
          label="提及用户"
          size="sm"
          :disabled="submitting"
          class="shrink-0"
          @mousedown.prevent
          @click="$emit('mention-click')"
        >
          <AtSign />
        </IconButton>
        <IconButton
          :label="selectionEmpty ? '选中文字后设为剧透' : '设为剧透'"
          size="sm"
          :tone="spoilerActive ? 'accent' : 'neutral'"
          :disabled="submitting || selectionEmpty"
          class="shrink-0"
          @mousedown.prevent
          @click="$emit('spoiler-click')"
        >
          <EyeOff />
        </IconButton>
      </Inline>
    </ScrollArea>

    <Inline gap="sm" class="shrink-0">
      <Text
        v-if="charLimit && (charCount ?? 0) > 0"
        as="span"
        size="xs"
        :class="cn('shrink-0 tabular-nums', countColor)"
      >
        {{ charCount }}/{{ charLimit }}
      </Text>
      <Button
        v-if="showCancel"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="shrink-0"
        :disabled="submitting"
        @click="$emit('cancel')"
      >
        {{ cancelLabel }}
      </Button>
      <Button
        size="sm"
        :loading="submitting"
        :disabled="isEmpty || overLimit"
        class="shrink-0"
        @click="$emit('submit')"
      >
        {{ submitLabel }}
      </Button>
    </Inline>
  </Inline>
</template>

<script setup lang="ts">
  import {
    Button,
    Divider,
    DropdownMenu,
    DropdownMenuItem,
    IconButton,
    Inline,
    Text,
  } from '@hina-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { ComponentPublicInstance } from 'vue'
  import { AtSign, EyeOff, Image as ImageIcon, Link2, Smile, Vote } from '@lucide/vue'
  import { TRANSITION } from '~/lib/motion'
  import { cn } from '~/utils/cn'
  import type { ToolbarDropdownItem } from '~/components/hikari-editor/plugins'

  defineOptions({ name: 'FeedComposerToolbar' })

  const props = defineProps<{
    show: boolean
    submitting?: boolean
    canPublish: boolean
    charCount?: number
    charLimit?: number
    overLimit?: boolean
    coversFull?: boolean
    selectionEmpty?: boolean
    spoilerActive?: boolean
    hasPoll?: boolean
    entityItems: ToolbarDropdownItem[]
    hidePublish?: boolean
  }>()

  const emit = defineEmits<{
    'emoji-click': [event: MouseEvent]
    'image-click': []
    'mention-click': []
    'spoiler-click': []
    'poll-click': []
    'entity-select': [item: ToolbarDropdownItem, anchor: HTMLElement]
    publish: []
  }>()

  const countColor = computed(() => {
    if (props.overLimit) return 'text-danger-text'
    if (props.charLimit && (props.charCount ?? 0) > props.charLimit * 0.9)
      return 'text-warning-text'
    return 'text-muted'
  })

  const entityBtn = useTemplateRef<ComponentPublicInstance>('entityBtn')

  function selectEntity(item: ToolbarDropdownItem) {
    const anchor = unrefElement(entityBtn) as HTMLElement | undefined
    if (anchor) emit('entity-select', item, anchor)
  }
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="show"
      key="toolbar"
      :initial="{ height: 0, opacity: 0 }"
      :animate="{ height: 'auto', opacity: 1 }"
      :exit="{ height: 0, opacity: 0 }"
      :transition="TRANSITION"
      class="overflow-hidden"
    >
      <Divider class="mx-2 mt-1" />
      <Inline gap="sm" justify="between" :wrap="false" class="px-2 py-1.5">
        <Inline gap="none" :wrap="false">
          <IconButton
            label="插入表情"
            size="sm"
            :disabled="submitting"
            @click="(e: MouseEvent) => emit('emoji-click', e)"
          >
            <Smile />
          </IconButton>
          <IconButton
            :label="coversFull ? '最多 9 张图片' : '添加图片'"
            size="sm"
            :disabled="submitting || coversFull"
            @click="emit('image-click')"
          >
            <ImageIcon />
          </IconButton>
          <IconButton
            label="提及用户"
            size="sm"
            :disabled="submitting"
            @mousedown.prevent
            @click="emit('mention-click')"
          >
            <AtSign />
          </IconButton>

          <DropdownMenu label="插入作品卡片" align="start">
            <IconButton ref="entityBtn" label="插入作品卡片" size="sm" :disabled="submitting">
              <Link2 />
            </IconButton>

            <template #content>
              <DropdownMenuItem
                v-for="item in entityItems"
                :key="item.label"
                @select="selectEntity(item)"
              >
                <template #icon>
                  <component :is="item.icon" />
                </template>
                {{ item.label }}
              </DropdownMenuItem>
            </template>
          </DropdownMenu>

          <IconButton
            :label="hasPoll ? '已添加投票（每篇最多一个）' : '插入投票'"
            size="sm"
            :disabled="submitting || hasPoll"
            @click="emit('poll-click')"
          >
            <Vote />
          </IconButton>
          <IconButton
            :label="selectionEmpty ? '选中文字后设为剧透' : '设为剧透'"
            size="sm"
            :tone="spoilerActive ? 'accent' : 'neutral'"
            :disabled="submitting || selectionEmpty"
            @mousedown.prevent
            @click="emit('spoiler-click')"
          >
            <EyeOff />
          </IconButton>
        </Inline>

        <Inline gap="sm">
          <Text
            v-if="charLimit && ((charCount ?? 0) > charLimit * 0.8 || overLimit)"
            as="span"
            size="xs"
            :class="cn('tabular-nums', countColor)"
          >
            {{ charCount }}/{{ charLimit }}
          </Text>
          <Button
            v-if="!hidePublish"
            size="sm"
            :loading="submitting"
            :disabled="!canPublish"
            @click="emit('publish')"
          >
            发布
          </Button>
        </Inline>
      </Inline>
    </motion.div>
  </AnimatePresence>
</template>

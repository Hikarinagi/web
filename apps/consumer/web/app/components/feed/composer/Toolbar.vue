<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import { AtSign, EyeOff, Image as ImageIcon, Link2, Smile, Vote } from '@lucide/vue'
  import type Menu from 'primevue/menu'
  import type { MenuItem } from 'primevue/menuitem'
  import { TRANSITION } from '~/lib/motion'
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
    if (props.overLimit) return 'text-red-500'
    if (props.charLimit && (props.charCount ?? 0) > props.charLimit * 0.9) return 'text-amber-500'
    return 'text-muted-color'
  })

  const menu = ref<InstanceType<typeof Menu> | null>(null)
  const entityBtn = ref<HTMLElement>()
  const entityModel = computed<MenuItem[]>(() =>
    props.entityItems.map(item => ({
      label: item.label,
      iconComponent: item.icon,
      command: () => {
        if (entityBtn.value) emit('entity-select', item, entityBtn.value)
      },
    })),
  )
  function toggleEntity(event: MouseEvent) {
    entityBtn.value = event.currentTarget as HTMLElement
    menu.value?.toggle(event)
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
      <div class="mx-2 mt-1 h-px bg-surface-200 dark:bg-surface-800" />
      <div class="flex items-center justify-between gap-2 px-2 py-1.5">
        <div class="flex items-center gap-0.5">
          <Button
            v-tooltip.top="'插入表情'"
            text
            severity="secondary"
            size="small"
            :disabled="submitting"
            class="py-1!"
            @click="(e: MouseEvent) => emit('emoji-click', e)"
          >
            <template #icon><Smile :size="18" /></template>
          </Button>
          <Button
            v-tooltip.top="coversFull ? '最多 9 张图片' : '添加图片'"
            text
            severity="secondary"
            size="small"
            :disabled="submitting || coversFull"
            class="py-1!"
            @click="emit('image-click')"
          >
            <template #icon><ImageIcon :size="18" /></template>
          </Button>
          <Button
            v-tooltip.top="'提及用户'"
            aria-label="提及用户"
            text
            severity="secondary"
            size="small"
            :disabled="submitting"
            class="py-1!"
            @mousedown.prevent
            @click="emit('mention-click')"
          >
            <template #icon><AtSign :size="18" /></template>
          </Button>
          <Button
            v-tooltip.top="'插入作品卡片'"
            aria-label="插入作品卡片"
            aria-haspopup="menu"
            text
            severity="secondary"
            size="small"
            :disabled="submitting"
            class="py-1!"
            @click="toggleEntity"
          >
            <template #icon><Link2 :size="18" /></template>
          </Button>
          <Button
            v-tooltip.top="hasPoll ? '已添加投票（每篇最多一个）' : '插入投票'"
            aria-label="插入投票"
            text
            severity="secondary"
            size="small"
            :disabled="submitting || hasPoll"
            class="py-1!"
            @click="emit('poll-click')"
          >
            <template #icon><Vote :size="18" /></template>
          </Button>
          <Button
            v-tooltip.top="selectionEmpty ? '选中文字后设为剧透' : '设为剧透'"
            aria-label="设为剧透"
            text
            :severity="spoilerActive ? undefined : 'secondary'"
            size="small"
            :disabled="submitting || selectionEmpty"
            class="py-1!"
            @mousedown.prevent
            @click="emit('spoiler-click')"
          >
            <template #icon><EyeOff :size="18" /></template>
          </Button>

          <Menu ref="menu" :model="entityModel" popup>
            <template #item="{ item, props: itemProps }">
              <a v-bind="itemProps.action" class="flex items-center gap-2">
                <component :is="item.iconComponent" class="size-4 shrink-0" />
                <span>{{ item.label }}</span>
              </a>
            </template>
          </Menu>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-if="charLimit && ((charCount ?? 0) > charLimit * 0.8 || overLimit)"
            class="text-xs tabular-nums"
            :class="countColor"
          >
            {{ charCount }}/{{ charLimit }}
          </span>
          <Button
            v-if="!hidePublish"
            label="发布"
            size="small"
            :loading="submitting"
            :disabled="!canPublish"
            class="py-1!"
            @click="emit('publish')"
          />
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
</template>

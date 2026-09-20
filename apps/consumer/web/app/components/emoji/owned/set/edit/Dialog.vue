<script setup lang="ts">
  import { ImageUp, Trash2, Upload } from '@lucide/vue'
  import type Menu from 'primevue/menu'
  import type { MenuItem } from 'primevue/menuitem'
  import type { MyEmojiSet } from '~/features/emoji/composables/useMySets'

  type Emoji = MyEmojiSet['emojis'][number]

  defineOptions({ name: 'EmojiOwnedSetEditDialog' })

  const open = defineModel<boolean>('open', { required: true })
  const props = defineProps<{ set: MyEmojiSet }>()
  const emit = defineEmits<{
    replace: [updated: MyEmojiSet]
    'catalog-changed': []
  }>()

  const confirm = useConfirm()
  const uploadDialogOpen = ref(false)
  const uploadDialogTarget = ref<Emoji | null>(null)
  const deletingEmojiId = ref<number | null>(null)
  const menu = ref<InstanceType<typeof Menu> | null>(null)
  const activeEmojiId = ref<number | null>(null)
  const activeEmoji = computed(() =>
    activeEmojiId.value !== null
      ? (props.set.emojis.find(e => e.id === activeEmojiId.value) ?? null)
      : null,
  )

  const menuItems = computed<MenuItem[]>(() => {
    const emoji = activeEmoji.value
    return [
      {
        label: '替换图片',
        iconComponent: ImageUp,
        disabled: !emoji || deletingEmojiId.value === emoji?.id,
        command: () => emoji && openReplace(emoji),
      },
      {
        label: '删除',
        iconComponent: Trash2,
        danger: true,
        disabled: !emoji || deletingEmojiId.value === emoji.id,
        command: () => emoji && confirmDeleteEmoji(emoji),
      },
    ]
  })

  function openCreate() {
    uploadDialogTarget.value = null
    uploadDialogOpen.value = true
  }

  function openReplace(emoji: Emoji) {
    uploadDialogTarget.value = emoji
    uploadDialogOpen.value = true
  }

  function onUploadDone(emoji: Emoji) {
    if (uploadDialogTarget.value) {
      emit('replace', {
        ...props.set,
        emojis: props.set.emojis.map(e => (e.id === emoji.id ? emoji : e)),
      })
    } else {
      emit('replace', {
        ...props.set,
        emojis: [...props.set.emojis, emoji],
        emoji_count: props.set.emoji_count + 1,
      })
    }
    emit('catalog-changed')
  }

  function onMoreClick(event: MouseEvent, emojiId: number) {
    activeEmojiId.value = emojiId
    menu.value?.show(event)
  }

  function confirmDeleteEmoji(emoji: Emoji) {
    confirm.require({
      group: 'app-shell',
      header: '删除贴纸',
      message: `确认删除「${emoji.name}」？此名字永远无法在该贴纸包中重复使用，历史文章中仍会保留此贴纸渲染。`,
      acceptLabel: '删除',
      rejectLabel: '取消',
      closeOnEscape: false,
      loading: () => deletingEmojiId.value === emoji.id,
      onAccept: ({ close }) => void performDeleteEmoji(emoji.id, close).catch(() => {}),
    })
  }

  async function performDeleteEmoji(emojiId: number, close?: () => void) {
    if (deletingEmojiId.value !== null) return
    deletingEmojiId.value = emojiId
    try {
      await hikariRequest<'/api/v3/emoji/sets/{setId}/emojis/{emojiId}', 'delete'>(
        '/api/v3/emoji/sets/{setId}/emojis/{emojiId}',
        { method: 'delete', path: { setId: props.set.id, emojiId } },
      )
      close?.()
      emit('replace', {
        ...props.set,
        emojis: props.set.emojis.filter(e => e.id !== emojiId),
        emoji_count: props.set.emoji_count - 1,
      })
      emit('catalog-changed')
    } finally {
      deletingEmojiId.value = null
    }
  }
</script>

<template>
  <Dialog
    v-model:visible="open"
    modal
    :header="`编辑 ${set.name}`"
    :scroll="false"
    :style="{ width: '92vw', maxWidth: '32rem' }"
    :pt="{ content: { class: '!flex !min-h-0 !flex-col' } }"
  >
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <p class="text-xs text-muted-color">{{ set.emojis.length }} 个贴纸（上限 200）</p>
        <Button label="上传贴纸" size="small" severity="secondary" @click="openCreate">
          <template #icon>
            <Upload class="size-3.5" />
          </template>
        </Button>
      </div>

      <p
        v-if="set.emojis.length === 0"
        class="rounded-lg border border-dashed border-surface-200 py-10 text-center text-xs text-muted-color dark:border-surface-700"
      >
        还没有贴纸，点击上方按钮上传第一个
      </p>
      <ScrollArea v-else class="max-h-[60vh]">
        <div class="flex flex-col">
          <EmojiOwnedSetEditItem
            v-for="emoji in set.emojis"
            :key="emoji.id"
            :emoji="emoji"
            :deleting="deletingEmojiId === emoji.id"
            @more-click="onMoreClick"
          />
        </div>
      </ScrollArea>
    </div>

    <Menu
      ref="menu"
      :model="menuItems"
      popup
      aria-label="贴纸操作"
      :pt="{ root: { class: 'w-36!' }, list: { class: 'py-1!' } }"
    >
      <template #item="{ item, props: itemProps }">
        <a
          v-ripple
          v-bind="itemProps.action"
          :class="['flex items-center gap-2 px-3 py-2 text-sm', item.danger ? 'text-red-500!' : '']"
        >
          <component :is="item.iconComponent" class="size-4 shrink-0" aria-hidden="true" />
          <span class="truncate">{{ item.label }}</span>
        </a>
      </template>
    </Menu>

    <EmojiUploadDialog
      :key="uploadDialogTarget ? `replace-${uploadDialogTarget.id}` : 'create'"
      v-model:open="uploadDialogOpen"
      :set-id="set.id"
      :set-name="set.name"
      :emoji="uploadDialogTarget"
      @done="onUploadDone"
    />
  </Dialog>
</template>

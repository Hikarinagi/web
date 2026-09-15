<script setup lang="ts">
  import {
    Button,
    Dialog,
    DropdownMenu,
    DropdownMenuItem,
    Empty,
    Inline,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { ImageUp, Trash2, Upload } from '@lucide/vue'
  import type { MyEmojiSet } from '~/features/emoji/composables/useMySets'

  type Emoji = MyEmojiSet['emojis'][number]

  defineOptions({ name: 'EmojiOwnedSetEditDialog' })

  const open = defineModel<boolean>('open', { required: true })
  const props = defineProps<{ set: MyEmojiSet }>()
  const emit = defineEmits<{
    replace: [updated: MyEmojiSet]
    'catalog-changed': []
  }>()

  const { confirm } = useHikariConfirm()
  const uploadDialogOpen = ref(false)
  const uploadDialogTarget = ref<Emoji | null>(null)
  const deletingEmojiId = ref<number | null>(null)
  const menuOpen = ref(false)
  const menuAnchor = shallowRef<HTMLElement | null>(null)
  const activeEmojiId = ref<number | null>(null)
  const activeEmoji = computed(() =>
    activeEmojiId.value !== null
      ? (props.set.emojis.find(e => e.id === activeEmojiId.value) ?? null)
      : null,
  )

  const menuBusy = computed(() => {
    const emoji = activeEmoji.value
    return !emoji || deletingEmojiId.value === emoji.id
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
    const trigger = event.currentTarget ?? event.target
    activeEmojiId.value = emojiId
    menuAnchor.value = trigger instanceof HTMLElement ? trigger : null
    menuOpen.value = true
  }

  function confirmDeleteEmoji(emoji: Emoji) {
    confirm({
      title: '删除贴纸',
      description: `确认删除「${emoji.name}」？此名字永远无法在该贴纸包中重复使用，历史文章中仍会保留此贴纸渲染。`,
      confirmText: '删除',
      cancelText: '取消',
      tone: 'danger',
      onConfirm: () => performDeleteEmoji(emoji.id),
    })
  }

  async function performDeleteEmoji(emojiId: number) {
    if (deletingEmojiId.value !== null) return
    deletingEmojiId.value = emojiId
    try {
      await hikariRequest<'/api/v3/emoji/sets/{setId}/emojis/{emojiId}', 'delete'>(
        '/api/v3/emoji/sets/{setId}/emojis/{emojiId}',
        { method: 'delete', path: { setId: props.set.id, emojiId } },
      )
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
  <Dialog v-model:open="open" size="lg" :title="`编辑 ${set.name}`">
    <template #content>
      <Stack gap="sm">
        <Inline align="center" justify="between" :wrap="false">
          <Text size="xs" tone="muted">{{ set.emojis.length }} 个贴纸（上限 200）</Text>
          <Button variant="outline" tone="neutral" size="sm" @click="openCreate">
            <template #icon><Upload /></template>
            上传贴纸
          </Button>
        </Inline>

        <Empty v-if="set.emojis.length === 0" description="还没有贴纸，点击上方按钮上传第一个" />
        <ScrollArea v-else class="max-h-[60vh]">
          <Stack gap="none">
            <EmojiOwnedSetEditItem
              v-for="emoji in set.emojis"
              :key="emoji.id"
              :emoji="emoji"
              :deleting="deletingEmojiId === emoji.id"
              @more-click="onMoreClick"
            />
          </Stack>
        </ScrollArea>
      </Stack>
    </template>
  </Dialog>

  <DropdownMenu
    v-model:open="menuOpen"
    :anchor="menuAnchor"
    label="贴纸操作"
    align="end"
    class="w-36"
  >
    <template #content>
      <DropdownMenuItem :disabled="menuBusy" @select="activeEmoji && openReplace(activeEmoji)">
        <template #icon><ImageUp /></template>
        替换图片
      </DropdownMenuItem>
      <DropdownMenuItem
        tone="danger"
        :disabled="menuBusy"
        @select="activeEmoji && confirmDeleteEmoji(activeEmoji)"
      >
        <template #icon><Trash2 /></template>
        删除
      </DropdownMenuItem>
    </template>
  </DropdownMenu>

  <EmojiUploadDialog
    :key="uploadDialogTarget ? `replace-${uploadDialogTarget.id}` : 'create'"
    v-model:open="uploadDialogOpen"
    :set-id="set.id"
    :set-name="set.name"
    :emoji="uploadDialogTarget"
    @done="onUploadDone"
  />
</template>

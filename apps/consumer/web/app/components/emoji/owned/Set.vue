<script setup lang="ts">
  import type { MyEmojiSet } from '~/features/emoji/composables/useMySets'

  defineOptions({ name: 'EmojiOwnedSet' })

  const props = defineProps<{ set: MyEmojiSet }>()
  const emit = defineEmits<{
    replace: [updated: MyEmojiSet]
    remove: [id: number]
    'catalog-changed': []
  }>()

  const confirm = useConfirm()
  const visibilityPublic = ref(props.set.visibility === 'PUBLIC')
  const togglingVisibility = ref(false)
  const deleting = ref(false)
  const editOpen = ref(false)

  watch(
    () => props.set.visibility,
    v => {
      visibilityPublic.value = v === 'PUBLIC'
    },
  )

  async function onUpdateVisibility(value: boolean) {
    if (togglingVisibility.value) return
    visibilityPublic.value = value
    togglingVisibility.value = true
    try {
      const updated = await hikariRequest<'/api/v3/emoji/sets/{id}', 'patch'>(
        '/api/v3/emoji/sets/{id}',
        {
          method: 'patch',
          path: { id: props.set.id },
          body: { visibility: value ? 'PUBLIC' : 'PRIVATE' },
        },
      )
      emit('replace', updated)
    } catch {
      visibilityPublic.value = props.set.visibility === 'PUBLIC'
    } finally {
      togglingVisibility.value = false
    }
  }

  async function performDelete(close?: () => void) {
    if (deleting.value) return
    deleting.value = true
    try {
      await hikariRequest<'/api/v3/emoji/sets/{id}', 'delete'>('/api/v3/emoji/sets/{id}', {
        method: 'delete',
        path: { id: props.set.id },
      })
      close?.()
      emit('remove', props.set.id)
      emit('catalog-changed')
    } finally {
      deleting.value = false
    }
  }

  function confirmDelete() {
    confirm.require({
      group: 'app-shell',
      header: '删除贴纸包',
      message: `确认删除「${props.set.name}」？此名字永远无法重复使用，订阅了该贴纸包的用户会失去访问。`,
      acceptLabel: '删除',
      rejectLabel: '取消',
      closeOnEscape: false,
      countdown: 3,
      loading: () => deleting.value,
      onAccept: ({ close }) => void performDelete(close).catch(() => {}),
    })
  }
</script>

<template>
  <Card :pt="{ body: { class: 'p-4!' }, content: { class: 'p-0!' } }">
    <template #content>
      <div class="flex items-center justify-between gap-3">
        <EmojiOwnedSetHeader
          :name="set.name"
          :visibility-public="visibilityPublic"
          :emoji-count="set.emoji_count"
          :subscriber-count="set.subscriber_count"
        />
        <EmojiOwnedSetActions
          :visibility-public="visibilityPublic"
          :toggling-visibility="togglingVisibility"
          :deleting="deleting"
          @update:visibility-public="onUpdateVisibility"
          @edit-request="editOpen = true"
          @delete-request="confirmDelete"
        />
      </div>
    </template>
  </Card>

  <EmojiOwnedSetEditDialog
    v-model:open="editOpen"
    :set="set"
    @replace="updated => emit('replace', updated)"
    @catalog-changed="emit('catalog-changed')"
  />
</template>

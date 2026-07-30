<script setup lang="ts">
  import { Plus } from '@lucide/vue'
  import { useMySets, type MyEmojiSet } from '~/features/emoji/composables/useMySets'
  import { useUserEmojiCatalog } from '~/components/hikari-editor/plugins/emoji/composables/useUserEmojiCatalog'

  defineOptions({ name: 'EmojiOwnedList' })

  const store = useEmojiManageStore()
  const { sets, loaded, refresh, replace, remove, prepend } = useMySets()
  const { refresh: refreshCatalog } = useUserEmojiCatalog()
  const createOpen = ref(false)

  watch(
    () => store.open,
    next => {
      if (next) void refresh()
    },
  )

  function onCreated(set: MyEmojiSet) {
    prepend(set)
    void refreshCatalog()
  }
  function onCatalogChanged() {
    void refreshCatalog()
  }
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <p class="text-sm text-muted-color">
        在这里创建、编辑和删除你自己的贴纸包,公开后其他用户可订阅。
      </p>
      <Button label="新建" size="small" class="shrink-0" @click="createOpen = true">
        <template #icon>
          <Plus class="size-4" />
        </template>
      </Button>
    </div>

    <div v-if="!loaded" class="flex flex-col gap-2">
      <Skeleton height="5rem" />
      <Skeleton height="5rem" />
    </div>

    <div
      v-else-if="sets.length === 0"
      class="flex flex-col items-center gap-3 rounded-lg border border-dashed border-surface-200 py-10 text-center dark:border-surface-700"
    >
      <p class="text-sm text-muted-color">还没有创建任何贴纸包</p>
    </div>

    <EmojiOwnedSet
      v-for="set in sets"
      v-else
      :key="set.id"
      :set="set"
      @replace="replace"
      @remove="remove"
      @catalog-changed="onCatalogChanged"
    />
    <EmojiSetCreateDialog v-model:open="createOpen" @created="onCreated" />
  </div>
</template>

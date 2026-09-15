<script setup lang="ts">
  import { Button, Empty, Inline, Skeleton, Stack, Text } from '@hina-ui/vue'
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
  <Stack gap="sm">
    <Inline justify="between" align="center" gap="sm" :wrap="false">
      <Text size="sm" tone="muted">
        在这里创建、编辑和删除你自己的贴纸包，公开后其他用户可订阅。
      </Text>
      <Button size="sm" class="shrink-0" @click="createOpen = true">
        <template #icon><Plus /></template>
        新建
      </Button>
    </Inline>

    <Stack v-if="!loaded" gap="sm">
      <Skeleton v-for="index in 2" :key="index" class="h-20" />
    </Stack>

    <Empty v-else-if="sets.length === 0" size="sm" title="还没有创建任何贴纸包" />

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
  </Stack>
</template>

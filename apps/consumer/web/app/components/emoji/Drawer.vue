<script setup lang="ts">
  import { Drawer, Sheet } from '@hina-ui/vue'
  import { storeToRefs } from 'pinia'

  defineOptions({ name: 'EmojiDrawer' })

  const store = useEmojiManageStore()
  const { open } = storeToRefs(store)
  const narrow = useNarrow()
</script>

<template>
  <Sheet v-if="narrow" v-model:open="open" title="贴纸包管理">
    <template #content>
      <EmojiManagePanel />
    </template>
  </Sheet>

  <Drawer v-else v-model:open="open" side="end" size="lg" title="贴纸包管理">
    <template #content>
      <EmojiManagePanel />
    </template>
  </Drawer>
</template>

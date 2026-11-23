<script setup lang="ts">
  import { BookUp } from '@lucide/vue'

  defineOptions({ name: 'MangaHeroContribute' })
  defineProps<{ mangaId: number; title: string }>()

  const open = ref(false)
</script>

<template>
  <Button
    login-required
    variant="soft"
    tone="neutral"
    size="sm"
    class="self-start"
    @click="open = true"
  >
    <template #icon><BookUp /></template>
    投稿
  </Button>
  <ContributeMangaStartDialog v-model:open="open" :series="{ id: mangaId, title }" />
</template>

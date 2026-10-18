<script setup lang="ts">
  import { Button, Center, Grid, Panel } from '@hina-ui/vue'
  import { BookCopy, ChevronDown } from '@lucide/vue'
  import type { VolumeCard } from '~/features/manga/volumes'

  defineOptions({ name: 'MangaChaptersVolumes' })

  const COLLAPSED_COUNT = 16

  const props = defineProps<{
    mangaId: number
    cards: VolumeCard[]
  }>()
  const emit = defineEmits<{ edit: [chapter: NonNullable<VolumeCard['whole']>] }>()

  const expanded = ref(false)
  const visible = computed(() =>
    expanded.value ? props.cards : props.cards.slice(0, COLLAPSED_COUNT),
  )
  const hasMore = computed(() => props.cards.length > COLLAPSED_COUNT)
</script>

<template>
  <Panel title="单行本" :count="cards.length">
    <template #icon><BookCopy /></template>
    <Grid :cols="3" class="gap-3 sm:grid-cols-5 lg:grid-cols-8">
      <MangaChaptersVolumeCard
        v-for="card in visible"
        :key="card.key"
        :manga-id="mangaId"
        :card="card"
        @edit="emit('edit', $event)"
      />
    </Grid>

    <Center v-if="hasMore && !expanded" class="mt-3">
      <Button variant="ghost" tone="neutral" size="sm" @click="expanded = true">
        <template #icon><ChevronDown /></template>
        全部 {{ cards.length }} 卷
      </Button>
    </Center>
  </Panel>
</template>

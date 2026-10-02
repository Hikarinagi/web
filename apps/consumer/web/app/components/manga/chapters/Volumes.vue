<script setup lang="ts">
  import { Button, Center, Grid, Panel } from '@hina-ui/vue'
  import { BookCopy, ChevronDown } from '@lucide/vue'
  import type { VolumeCard } from '~/features/manga/volumes'

  defineOptions({ name: 'MangaChaptersVolumes' })

  const COLLAPSED_COUNT = 16

  const props = defineProps<{
    mangaId: number
    mangaTitle: string
    cards: VolumeCard[]
  }>()

  const { requireLogin } = useAuthGate()
  const expanded = ref(false)
  const visible = computed(() =>
    expanded.value ? props.cards : props.cards.slice(0, COLLAPSED_COUNT),
  )
  const hasMore = computed(() => props.cards.length > COLLAPSED_COUNT)
  const starting = shallowRef<{ id: number; label: string } | null>(null)
  const open = ref(false)

  function contribute(card: VolumeCard) {
    if (!card.entry || !requireLogin()) return
    starting.value = { id: card.entry.id, label: card.title }
    open.value = true
  }
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
        @contribute="contribute"
      />
    </Grid>

    <Center v-if="hasMore && !expanded" class="mt-3">
      <Button variant="ghost" tone="neutral" size="sm" @click="expanded = true">
        <template #icon><ChevronDown /></template>
        全部 {{ cards.length }} 卷
      </Button>
    </Center>
  </Panel>
  <ContributeMangaStartDialog
    v-if="starting"
    v-model:open="open"
    :series="{ id: mangaId, title: mangaTitle }"
    :volume="starting"
    scope="VOLUME"
  />
</template>

<script setup lang="ts">
  import { Button, Grid, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { BookOpen, RefreshCw } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { LightNovelsLandingData } from '~~/server/api/pages/light-novels.get'
  import { titleOf } from '~/features/light-novel/explore'
  import { TRANSITION } from '~/lib/motion'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'LightNovelExploreHero' })
  const props = defineProps<{
    hero: NonNullable<LightNovelsLandingData['hero']>
  }>()

  const current = shallowRef({
    item: props.hero.item,
    detail: props.hero.detail,
    volumes: props.hero.volumes,
  })
  const cache = new Map<number, typeof current.value>([[current.value.item.id, current.value]])
  const remaining = ref(props.hero.candidate_ids.filter(id => id !== current.value.item.id))
  const pending = ref(false)

  const title = computed(() => titleOf(current.value.item))
  const summary = computed(
    () => current.value.detail.summary_cn || current.value.detail.summary || '',
  )
  const meta = computed(() =>
    [
      current.value.item.author?.name,
      current.value.item.bunko?.name,
      current.value.detail.total_volumes ? `全 ${current.value.detail.total_volumes} 卷` : null,
      '已完结',
    ]
      .filter((part): part is string => Boolean(part))
      .join(' · '),
  )
  const startVolume = computed(() => {
    const readable = current.value.volumes.filter(volume => volume.online_reading_available)
    return [...readable].sort((left, right) => {
      const leftDate = left.publication_date
        ? new Date(left.publication_date).getTime()
        : Number.POSITIVE_INFINITY
      const rightDate = right.publication_date
        ? new Date(right.publication_date).getTime()
        : Number.POSITIVE_INFINITY
      return (
        leftDate - rightDate ||
        (left.volume_number ?? Number.POSITIVE_INFINITY) -
          (right.volume_number ?? Number.POSITIVE_INFINITY) ||
        left.id - right.id
      )
    })[0]
  })

  async function swap() {
    if (pending.value || props.hero.candidate_ids.length < 2) return
    if (!remaining.value.length) {
      remaining.value = props.hero.candidate_ids.filter(id => id !== current.value.item.id)
    }
    const index = Math.floor(Math.random() * remaining.value.length)
    const [nextId] = remaining.value.splice(index, 1)
    if (!nextId) return

    pending.value = true
    let succeeded = false
    try {
      const cached = cache.get(nextId)
      if (cached) {
        current.value = cached
        succeeded = true
        return
      }
      const [items, detail, volumes] = await Promise.all([
        hikariRequest('/api/v3/light-novels/by-ids', { query: { ids: [nextId] } }),
        hikariRequest('/api/v3/light-novels/{id}', { path: { id: nextId } }),
        hikariRequest('/api/v3/light-novels/{id}/volumes', { path: { id: nextId } }),
      ])
      const item = items[0]
      if (!item) return
      const loaded = { item, detail, volumes }
      cache.set(nextId, loaded)
      current.value = loaded
      succeeded = true
    } catch {
      // Request errors are already surfaced by hikariRequest.
    } finally {
      if (!succeeded) remaining.value.push(nextId)
      pending.value = false
    }
  }
</script>

<template>
  <Stack
    as="section"
    gap="none"
    aria-label="可在线阅读作品"
    :aria-busy="pending"
    class="border-b border-line bg-canvas"
  >
    <Stack
      gap="none"
      class="mx-auto box-content w-full max-w-app px-6 pt-[calc(var(--app-header-height)+1.5rem)] pb-7 md:pt-[calc(var(--app-header-height)+2rem)] md:pb-8"
    >
      <Grid :cols="1">
        <AnimatePresence :initial="false">
          <motion.div
            :key="current.item.id"
            class="col-start-1 row-start-1 grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-5 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-9 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-12"
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="TRANSITION"
          >
            <NuxtLink
              :to="`/light-novels/${current.item.id}`"
              class="block w-full hn-interactive rounded-sm shadow-lg hn-press-none"
              :aria-label="`查看 ${title}`"
            >
              <HikariImage
                :src="topVotedMedia(current.item.covers)"
                :alt="title"
                class="aspect-7/10 w-full overflow-hidden rounded-sm bg-subtle ring-1 ring-line"
                image-class="size-full object-contain"
                preset="medium"
              />
            </NuxtLink>

            <Stack gap="none" class="min-w-0 py-1 md:py-2">
              <Text size="xs" tone="muted" truncate class="leading-5 sm:text-sm">{{ meta }}</Text>
              <Heading
                :level="1"
                size="2xl"
                class="mt-1.5 line-clamp-3 leading-tight font-bold md:mt-2 md:text-3xl lg:text-4xl"
              >
                {{ title }}
              </Heading>
              <Text
                v-if="summary"
                size="sm"
                tone="muted"
                class="mt-3 line-clamp-2 max-w-3xl leading-6 md:line-clamp-3"
              >
                {{ summary }}
              </Text>

              <Inline align="center" gap="sm" class="mt-4 md:mt-5">
                <AuthGateButton v-if="startVolume" as-child>
                  <NuxtLink :to="`/light-novel-volumes/${startVolume.id}/read`">
                    <BookOpen aria-hidden="true" />
                    开始阅读
                  </NuxtLink>
                </AuthGateButton>
                <Button
                  variant="outline"
                  tone="neutral"
                  :loading="pending"
                  :disabled="hero.candidate_ids.length < 2"
                  @click="swap"
                >
                  <template #icon><RefreshCw aria-hidden="true" /></template>
                  换一本
                </Button>
              </Inline>
            </Stack>
          </motion.div>
        </AnimatePresence>
      </Grid>
    </Stack>
  </Stack>
</template>

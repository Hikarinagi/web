<script setup lang="ts">
  import { Card, Grid, Inline } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'

  type ScheduleItem = ApiData<'/api/v3/landing/galgames', 'get'>['schedule'][number]

  defineOptions({ name: 'LandingReleaseGallery' })
  const props = defineProps<{
    item: ScheduleItem
    title: string
    to: string
    running: boolean
    paused: boolean
  }>()
  const emit = defineEmits<{ advance: [] }>()
  const shot = defineModel<number>('shot', { required: true })

  const image = computed(() => props.item.images[shot.value] ?? props.item.images[0])
</script>

<template>
  <Card
    :as="NuxtLink"
    :to="to"
    :padded="false"
    class="relative aspect-video hn-interactive overflow-hidden border-0 bg-fg/5 shadow-xl ring-1 ring-fg/10 hn-press-lg"
  >
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="absolute inset-0 transition-opacity duration-300"
      leave-to-class="opacity-0"
    >
      <HikariImage
        v-if="image"
        :key="image.src"
        :src="image"
        :alt="`${title} 的游戏画面`"
        :processing="{ width: 1280, quality: 84, fit: 'cover' }"
        preload
        class="absolute inset-0 size-full"
        image-class="size-full object-cover"
      />
    </Transition>
  </Card>
  <Grid gap="none" class="grid-cols-1">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0"
    >
      <Inline :key="item.id" gap="sm" :wrap="false" class="col-start-1 row-start-1">
        <Card
          v-for="(media, index) in item.images"
          :key="media.src"
          as="button"
          type="button"
          :padded="false"
          :aria-label="`第 ${index + 1} 张游戏画面`"
          :aria-pressed="index === shot"
          class="relative w-16 shrink-0 hn-interactive overflow-hidden sm:w-24 lg:w-28"
          @click="shot = index"
        >
          <HikariImage
            :src="media"
            alt=""
            :ratio="16 / 9"
            :processing="{ width: 240, quality: 80, fit: 'cover' }"
            class="w-full"
            image-class="object-cover"
          />
          <Transition
            enter-active-class="transition-opacity duration-300"
            enter-from-class="opacity-0"
            leave-active-class="transition-opacity duration-300"
            leave-to-class="opacity-0"
          >
            <LandingPickRing
              v-if="index === shot"
              :running="running"
              :paused="paused"
              :cycle="`${item.id}-${shot}`"
              @done="emit('advance')"
            />
          </Transition>
        </Card>
      </Inline>
    </Transition>
  </Grid>
</template>

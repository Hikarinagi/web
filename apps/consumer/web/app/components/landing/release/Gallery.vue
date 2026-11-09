<script setup lang="ts">
  import { Card, Inline } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'

  type ScheduleItem = ApiData<'/api/v3/landing/galgames', 'get'>['schedule'][number]

  defineOptions({ name: 'LandingReleaseGallery' })
  const props = defineProps<{ item: ScheduleItem; title: string }>()
  const shot = defineModel<number>('shot', { required: true })

  const image = computed(() => props.item.images[shot.value] ?? props.item.images[0])
</script>

<template>
  <Card
    :padded="false"
    class="relative aspect-video overflow-hidden border-0 bg-fg/5 shadow-xl ring-1 ring-fg/10"
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
        :lazy="false"
        class="absolute inset-0 size-full"
        image-class="size-full object-cover"
      />
    </Transition>
  </Card>
  <Inline gap="sm" :wrap="false">
    <Card
      v-for="(media, index) in item.images"
      :key="media.src"
      as="button"
      type="button"
      :padded="false"
      :aria-label="`第 ${index + 1} 张游戏画面`"
      :aria-pressed="index === shot"
      :class="
        cn(
          'w-16 shrink-0 hn-interactive overflow-hidden sm:w-24 lg:w-28',
          index === shot && 'ring-2 ring-accent',
        )
      "
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
    </Card>
  </Inline>
</template>

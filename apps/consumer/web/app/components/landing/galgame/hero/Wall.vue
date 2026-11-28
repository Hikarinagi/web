<script setup lang="ts">
  import { Inline, Stack } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'

  type Cover = ApiData<'/api/v3/landing/galgames', 'get'>['slides'][number]['wall'][number]

  defineOptions({ name: 'LandingGalgameHeroWall' })
  const props = defineProps<{ covers: Cover[] }>()

  const ROWS = 5
  const rows = computed(() =>
    Array.from({ length: ROWS }, (_, row) => {
      const items = props.covers.filter((_, index) => index % ROWS === row)
      return [...items, ...items]
    }),
  )
  const ratioOf = ({ width, height }: Cover) =>
    width && height ? Math.min(Math.max(width / height, 0.66), 1.78) : 0.71
  const coverProcessing = { height: 256, quality: 80, fit: 'scale-down' } as const
</script>

<template>
  <Stack
    gap="none"
    aria-hidden="true"
    class="absolute inset-0 overflow-hidden mask-(--landing-wall-fade-y) sm:left-1/3 sm:mask-(--landing-wall-fade-x)"
  >
    <Stack gap="sm" justify="center" class="absolute inset-0 scale-125 -rotate-6">
      <Inline
        v-for="(row, index) in rows"
        :key="index"
        gap="sm"
        :wrap="false"
        :class="index % 2 ? '-translate-x-12' : 'translate-x-4'"
      >
        <HikariImage
          v-for="(cover, position) in row"
          :key="`${cover.id}-${position}`"
          :src="cover"
          alt=""
          :ratio="ratioOf(cover)"
          :processing="coverProcessing"
          :skeleton="false"
          class="h-20 w-auto shrink-0 overflow-hidden rounded-lg sm:h-24 lg:h-32"
          image-class="size-full object-cover"
        />
      </Inline>
    </Stack>
  </Stack>
</template>

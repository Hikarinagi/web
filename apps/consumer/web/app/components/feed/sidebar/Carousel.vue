<script setup lang="ts">
  import { Button, Card, Center, Flex, IconButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import emblaCarouselVue from 'embla-carousel-vue'
  import type { ComponentPublicInstance } from 'vue'
  import type { FeedSidebarData } from '~~/server/features/feed/sidebar'

  const props = defineProps<{ carousel: NonNullable<FeedSidebarData['carousel']> }>()

  const items = computed(() => props.carousel.items)
  const multi = computed(() => items.value.length > 1)
  const dotsShown = computed(() => props.carousel.show_dots && multi.value)

  const [emblaRef, emblaApi] = emblaCarouselVue({ loop: true, align: 'center' })
  function setViewport(el: Element | ComponentPublicInstance | null) {
    emblaRef.value = unrefElement(el as ComponentPublicInstance | null) as HTMLElement | undefined
  }
  const selected = ref(0)

  function sync() {
    const api = emblaApi.value
    if (!api) return
    selected.value = api.selectedScrollSnap()
  }
  watch(emblaApi, api => {
    if (!api) return
    sync()
    api.on('select', sync).on('reInit', sync)
  })

  const root = ref<ComponentPublicInstance>()
  const hovered = useElementHover(() => unrefElement(root))
  const reduced = usePreferredReducedMotion()
  const { pause, resume } = useIntervalFn(
    () => emblaApi.value?.scrollNext(),
    () => props.carousel.interval,
    { immediate: false },
  )
  watchEffect(() => {
    if (props.carousel.autoplay && multi.value && !hovered.value && reduced.value !== 'reduce') {
      resume()
    } else {
      pause()
    }
  })

  const navBtn = 'pointer-events-auto size-7 bg-surface/85 shadow-md'
  const navShell = 'pointer-events-none absolute inset-y-0 transition-opacity duration-200'
</script>

<template>
  <Stack ref="root" gap="none" class="relative">
    <Card :ref="setViewport" :padded="false" class="aspect-video rounded-2xl">
      <Flex class="h-full">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          :to="item.link"
          :target="item.open_in_new ? '_blank' : undefined"
          class="relative block h-full min-w-0 flex-[0_0_100%]"
        >
          <HikariImage
            :src="item.image"
            :alt="item.title"
            class="size-full"
            image-class="size-full object-cover"
            :processing="{ w: 720, q: 85 }"
            :skeleton="false"
          />
          <Stack
            gap="none"
            :class="
              cn(
                'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent pt-10 pb-2.5 pl-3',
                dotsShown ? 'pr-12' : 'pr-3',
              )
            "
          >
            <Text size="sm" weight="semibold" class="line-clamp-1 text-white">
              {{ item.title }}
            </Text>
            <Text v-if="item.description" size="xs" class="line-clamp-1 text-white/85">
              {{ item.description }}
            </Text>
          </Stack>
        </NuxtLink>
      </Flex>
    </Card>

    <template v-if="carousel.show_arrows && multi">
      <Center :class="cn(navShell, 'left-2', hovered ? 'opacity-100' : 'opacity-0')">
        <IconButton
          label="上一张"
          :tooltip="false"
          size="sm"
          pill
          :class="navBtn"
          @click="emblaApi?.scrollPrev()"
        >
          <ChevronLeft />
        </IconButton>
      </Center>
      <Center :class="cn(navShell, 'right-2', hovered ? 'opacity-100' : 'opacity-0')">
        <IconButton
          label="下一张"
          :tooltip="false"
          size="sm"
          pill
          :class="navBtn"
          @click="emblaApi?.scrollNext()"
        >
          <ChevronRight />
        </IconButton>
      </Center>
    </template>

    <Inline
      v-if="dotsShown"
      gap="none"
      class="pointer-events-none absolute right-3 bottom-3 gap-1.5"
    >
      <Button
        v-for="(item, i) in items"
        :key="item.id"
        variant="ghost"
        tone="neutral"
        :aria-label="`第 ${i + 1} 张`"
        :class="
          cn(
            'pointer-events-auto size-1.5 rounded-full p-0 shadow',
            selected === i ? 'bg-white' : 'bg-white/50',
          )
        "
        @click="emblaApi?.scrollTo(i)"
      />
    </Inline>
  </Stack>
</template>

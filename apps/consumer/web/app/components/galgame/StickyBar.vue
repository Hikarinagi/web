<script setup lang="ts">
  import { Button as HnButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { Star } from '@lucide/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { useGalgameCover } from '~/features/galgame/useCoverVote'

  defineOptions({ name: 'GalgameStickyBar' })
  const props = defineProps<{
    data: GalgamePageData
    title: string
    shown: boolean
    sections: { id: string; label: string }[]
    active: string
  }>()
  defineEmits<{ go: [id: string] }>()

  const cover = useGalgameCover(() => props.data.galgame)
  const line = computed(() =>
    [props.data.rate_stats.average?.toFixed(1), props.data.display.brands[0]?.text]
      .filter(Boolean)
      .join('　'),
  )
</script>

<template>
  <Transition
    enter-active-class="transition duration-200"
    enter-from-class="-translate-y-full opacity-0"
    leave-active-class="transition duration-150"
    leave-to-class="-translate-y-full opacity-0"
  >
    <Stack
      v-if="shown"
      gap="none"
      class="fixed inset-x-0 top-(--app-header-height) z-30 hn-scrollbar-safe hidden border-b border-line bg-surface/90 backdrop-blur-md lg:flex"
    >
      <Inline
        gap="lg"
        align="center"
        justify="between"
        :wrap="false"
        class="mx-auto h-(--sticky-bar-height) w-full max-w-(--entry-container) px-6"
      >
        <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
          <HikariImage
            v-if="cover"
            :src="cover"
            alt=""
            :ratio="5 / 7"
            preset="thumbnail"
            class="w-7 shrink-0 rounded-sm"
          />
          <Stack gap="none" class="min-w-0">
            <Text weight="semibold" truncate>{{ title }}</Text>
            <Inline v-if="line" gap="xs" align="center" :wrap="false">
              <Star
                v-if="data.rate_stats.average !== null"
                class="size-3 fill-current text-warning"
              />
              <Text size="xs" tone="muted" class="tabular-nums">{{ line }}</Text>
            </Inline>
          </Stack>
        </Inline>
        <Inline gap="none" :wrap="false">
          <HnButton
            v-for="section in sections"
            :key="section.id"
            variant="ghost"
            :tone="section.id === active ? 'accent' : 'neutral'"
            size="sm"
            @click="$emit('go', section.id)"
          >
            {{ section.label }}
          </HnButton>
        </Inline>
        <GalgameStageActions
          compact
          :galgame-id="data.galgame.id"
          :work-title="title"
          :my-rate="data.my_rate"
          :favorited="data.favorite?.favorited ?? false"
          :downloads="data.galgame.download_resource_count"
        />
      </Inline>
    </Stack>
  </Transition>
</template>

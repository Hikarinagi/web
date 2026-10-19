<script setup lang="ts">
  import { Card, Inline, Ripple, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { workPath } from '#shared/utils/work'
  import { splitWorkChips, type FeedWorkRef } from '~/features/feed/feed'

  const props = defineProps<{ works: FeedWorkRef[]; to: string }>()

  const chips = computed(() => splitWorkChips(props.works))
</script>

<template>
  <Inline gap="sm" class="relative z-1">
    <WorkCardTrigger
      v-for="w in chips.shown"
      :key="`${w.work_type}:${w.id}`"
      :work-type="w.work_type"
      :work-id="w.id"
    >
      <Card
        :as="NuxtLink"
        :to="workPath(w.work_type, w.id)"
        :padded="false"
        class="hn-state-layer inline-flex max-w-45 hn-interactive items-center gap-2 py-1 ps-1 pe-3 shadow-none"
      >
        <Ripple />
        <HikariImage
          :src="w.cover"
          :alt="w.title"
          class="size-7 shrink-0 overflow-hidden rounded"
          image-class="size-full object-cover"
          preset="thumbnail"
        />
        <Text as="span" size="xs" weight="medium" truncate class="min-w-0">{{ w.title }}</Text>
      </Card>
    </WorkCardTrigger>
    <Card
      v-if="chips.rest"
      :as="NuxtLink"
      :to="to"
      :padded="false"
      :aria-label="`查看全部 ${works.length} 部作品`"
      class="hn-state-layer inline-flex h-9.5 hn-interactive items-center px-3 shadow-none"
    >
      <Ripple />
      <Text as="span" size="xs" weight="medium" tone="muted">+{{ chips.rest }}</Text>
    </Card>
  </Inline>
</template>

<script setup lang="ts">
  import { Center, Inline, Ripple, Stack, Text } from '@hina-ui/vue'
  import { ChevronRight } from '@lucide/vue'
  import { NuxtLink } from '#components'

  defineOptions({ name: 'LandingReleaseCalendarLink' })
  const props = defineProps<{ today: string }>()

  const day = computed(() => Number(props.today.slice(8, 10)))
</script>

<template>
  <Inline
    :as="NuxtLink"
    to="/galgames/calendar"
    gap="md"
    align="center"
    :wrap="false"
    class="hn-state-layer relative isolate hn-interactive rounded-lg px-2 py-1.5 max-lg:-mx-2 lg:-mt-1.5"
  >
    <Ripple />
    <Stack
      gap="none"
      aria-hidden="true"
      class="size-11 shrink-0 overflow-hidden rounded-md bg-surface shadow-sm ring-1 ring-fg/10"
    >
      <Stack gap="none" class="h-2.5 shrink-0 bg-accent" />
      <Center class="flex-1">
        <Text as="span" size="lg" weight="semibold" class="leading-none tabular-nums">
          {{ day }}
        </Text>
      </Center>
    </Stack>
    <Text weight="semibold" class="min-w-0 flex-1">发售日历</Text>
    <ChevronRight class="size-4 shrink-0 text-muted" />
  </Inline>
</template>

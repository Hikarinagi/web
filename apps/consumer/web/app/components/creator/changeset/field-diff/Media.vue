<script setup lang="ts">
  import { Center, Inline, Text } from '@hina-ui/vue'
  import { ArrowRight } from '@lucide/vue'
  import { mediaSrc } from './helpers'

  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const from = computed(() => mediaSrc(props.op.from))
  const to = computed(() => mediaSrc(props.op.to))
</script>

<template>
  <Inline gap="sm" align="center">
    <Center class="size-24 overflow-hidden rounded-lg border border-danger-text/30 bg-danger-soft">
      <HikariImage
        v-if="from"
        :src="from"
        alt=""
        preset="small"
        class="size-full"
        image-class="size-full object-cover"
      />
      <Text v-else as="span" size="xs" tone="muted">（空）</Text>
    </Center>

    <ArrowRight class="size-3.5 shrink-0 text-muted" aria-hidden="true" />

    <Center
      class="size-24 overflow-hidden rounded-lg border border-success-text/30 bg-success-soft"
    >
      <HikariImage
        v-if="to"
        :src="to"
        alt=""
        preset="small"
        class="size-full"
        image-class="size-full object-cover"
      />
      <Text v-else as="span" size="xs" tone="muted">（空）</Text>
    </Center>
  </Inline>
</template>

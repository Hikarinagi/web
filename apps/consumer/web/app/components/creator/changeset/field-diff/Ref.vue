<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import { ArrowRight } from '@lucide/vue'

  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const from = computed(() => props.op.from)
  const to = computed(() => props.op.to)
  const fromName = computed(() =>
    typeof props.op.from_name === 'string' ? props.op.from_name : '',
  )
  const fromCover = computed(() =>
    typeof props.op.from_cover === 'string' && props.op.from_cover ? props.op.from_cover : '',
  )
  const toName = computed(() => (typeof props.op.to_name === 'string' ? props.op.to_name : ''))
  const toCover = computed(() =>
    typeof props.op.to_cover === 'string' && props.op.to_cover ? props.op.to_cover : '',
  )
</script>

<template>
  <Inline gap="sm" align="center">
    <Inline
      v-if="from != null"
      as="span"
      gap="sm"
      align="center"
      :wrap="false"
      class="rounded-lg bg-danger-soft px-2 py-1 text-danger-text"
    >
      <HikariImage
        v-if="fromCover"
        :src="fromCover"
        alt=""
        preset="small"
        class="size-7 shrink-0 overflow-hidden rounded"
        image-class="size-full object-cover"
      />
      <Text as="span" size="sm" weight="medium" class="text-inherit line-through">
        {{ fromName || `#${from}` }}
      </Text>
      <Text as="span" size="xs" class="font-mono text-inherit line-through opacity-70">
        #{{ from }}
      </Text>
    </Inline>
    <Text v-else as="span" class="rounded bg-danger-soft px-2 py-1 text-danger-text line-through">
      （空）
    </Text>

    <ArrowRight class="size-3.5 shrink-0 text-muted" aria-hidden="true" />

    <Inline
      v-if="to != null"
      as="span"
      gap="sm"
      align="center"
      :wrap="false"
      class="rounded-lg bg-success-soft px-2 py-1 text-success-text"
    >
      <HikariImage
        v-if="toCover"
        :src="toCover"
        alt=""
        preset="small"
        class="size-7 shrink-0 overflow-hidden rounded"
        image-class="size-full object-cover"
      />
      <Text as="span" size="sm" weight="medium" class="text-inherit">
        {{ toName || `#${to}` }}
      </Text>
      <Text as="span" size="xs" class="font-mono text-inherit opacity-70">#{{ to }}</Text>
    </Inline>
    <Text v-else as="span" class="rounded bg-success-soft px-2 py-1 text-success-text">（空）</Text>
  </Inline>
</template>

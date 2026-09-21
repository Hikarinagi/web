<script setup lang="ts">
  import { Button, Center, Spinner, Stack, Text } from '@hina-ui/vue'
  import type { ComponentPublicInstance } from 'vue'

  defineOptions({ name: 'StreamTail' })

  const props = withDefaults(
    defineProps<{
      loading?: boolean
      failed?: boolean
      done?: boolean
      hasItems?: boolean
      rootMargin?: string
    }>(),
    { loading: false, failed: false, done: false, hasItems: true, rootMargin: '600px' },
  )

  const emit = defineEmits<{ load: [] }>()

  const sentinel = ref<ComponentPublicInstance | null>(null)
  const nearEnd = ref(false)

  useIntersectionObserver(
    sentinel,
    ([entry]) => {
      nearEnd.value = !!entry?.isIntersecting
    },
    { rootMargin: props.rootMargin },
  )

  watchEffect(
    () => {
      if (nearEnd.value && !props.loading && !props.failed && !props.done) emit('load')
    },
    { flush: 'post' },
  )
</script>

<template>
  <Stack gap="none">
    <Stack ref="sentinel" gap="none" aria-hidden="true" class="h-px" />

    <Center v-if="loading" class="py-4">
      <Spinner size="lg" />
    </Center>
    <Center v-else-if="failed" class="py-4">
      <Button variant="ghost" tone="neutral" @click="emit('load')">重新加载</Button>
    </Center>
    <Center v-else-if="done && hasItems" class="py-4">
      <Text size="sm" tone="muted">没有更多了</Text>
    </Center>
  </Stack>
</template>

<script setup lang="ts">
  import { Card, Divider, Heading, Stack } from '@hina-ui/vue'
  import type { VNodeChild } from 'vue'

  defineOptions({ name: 'ResourceArchiveCard' })

  defineSlots<{
    default?: (props: Record<string, never>) => VNodeChild
    footer?: (props: Record<string, never>) => VNodeChild
  }>()

  const props = withDefaults(
    defineProps<{
      title?: string | null
      footerSeparated?: boolean
    }>(),
    {
      title: '档案',
      footerSeparated: true,
    },
  )
</script>

<template>
  <Card :padded="false" class="w-full lg:w-70 lg:shrink-0">
    <Stack gap="none" class="w-full">
      <Heading v-if="props.title" :level="3" size="base" class="px-5 pt-4">
        {{ props.title }}
      </Heading>

      <slot />

      <template v-if="$slots.footer">
        <Divider v-if="props.footerSeparated" decorative />
        <slot name="footer" />
      </template>
    </Stack>
  </Card>
</template>

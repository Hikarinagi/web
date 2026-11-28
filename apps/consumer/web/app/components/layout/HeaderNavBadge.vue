<script setup lang="ts">
  import { Badge } from '@hina-ui/vue'
  import type { HeaderNavBadge } from '~/config/site'

  defineOptions({ name: 'LayoutHeaderNavBadge' })

  const props = withDefaults(
    defineProps<{ badge?: HeaderNavBadge; placement?: 'top-end' | 'top-start' }>(),
    { badge: undefined, placement: 'top-end' },
  )

  const { t } = useLocaleText()
</script>

<template>
  <Badge
    :content="props.badge ? t(props.badge.label) : null"
    :tone="props.badge?.tone ?? 'accent'"
    :placement="props.placement"
    size="sm"
    shape="circle"
  >
    <slot />
  </Badge>
</template>

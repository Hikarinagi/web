<script setup lang="ts">
  import { Plus, UserCheck } from '@lucide/vue'

  const props = withDefaults(
    defineProps<{ userId: number; initialFollowing?: boolean; size?: 'sm' | 'md' | 'lg' }>(),
    { initialFollowing: false, size: 'sm' },
  )

  const { following, pending, toggle } = useFollow(props.userId, props.initialFollowing)
</script>

<template>
  <AuthGateButton
    :size="size"
    :variant="following ? 'soft' : 'solid'"
    :tone="following ? 'neutral' : 'accent'"
    :loading="pending"
    class="shrink-0"
    @click="toggle"
  >
    <template #icon>
      <component :is="following ? UserCheck : Plus" />
    </template>
    {{ following ? '已关注' : '关注' }}
  </AuthGateButton>
</template>

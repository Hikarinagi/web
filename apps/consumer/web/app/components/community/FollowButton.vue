<script setup lang="ts">
  import { Plus, UserCheck } from '@lucide/vue'

  const props = withDefaults(
    defineProps<{ userId: number; initialFollowing?: boolean; size?: 'small' | 'large' }>(),
    { initialFollowing: false, size: 'small' },
  )

  const { following, pending, toggle } = useFollow(props.userId, props.initialFollowing)
</script>

<template>
  <Button
    login-required
    :size="size"
    :label="following ? '已关注' : '关注'"
    :severity="following ? 'secondary' : undefined"
    :loading="pending"
    class="shrink-0"
    @click="toggle"
  >
    <template #icon>
      <component :is="following ? UserCheck : Plus" class="size-3.5" />
    </template>
  </Button>
</template>

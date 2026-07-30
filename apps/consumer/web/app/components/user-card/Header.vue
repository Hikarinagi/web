<script setup lang="ts">
  import { useAuthStore } from '~/stores/auth'
  import { useDecorationDetail } from '~/features/decoration/useDetail'
  import type { UserCardData } from './composables/useUserCard'

  const props = defineProps<{
    user: UserCardData | null
  }>()

  const auth = useAuthStore()
  const { open } = useDecorationDetail()
  const isSelf = computed(() => auth.user?.id === props.user?.id)
  const frame = computed(() => props.user?.equipped_frame ?? null)
</script>

<template>
  <div class="relative -mt-8 mb-3 flex items-center justify-between">
    <Avatar
      v-tooltip.top="frame?.name"
      :user="user"
      size="xlarge"
      shape="circle"
      class="z-10 border-2 border-surface-0 bg-(--p-skeleton-background) shadow-md dark:border-surface-900"
      :class="frame && 'cursor-pointer'"
      @click="frame && open(frame.id)"
    />
    <UserCardFollow v-if="user && !isSelf" />
  </div>
</template>

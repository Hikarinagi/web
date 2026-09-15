<script setup lang="ts">
  import { Inline, Skeleton } from '@hina-ui/vue'
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
  <Inline align="center" justify="between" :wrap="false" class="relative -mt-8 mb-3">
    <Skeleton v-if="!user" class="z-10 size-16 rounded-full border-2 border-surface" />
    <Avatar
      v-else
      v-tooltip="frame?.name ?? null"
      :user="user"
      size="lg"
      class="z-10 size-16 border-2 border-surface bg-subtle shadow-md"
      :class="frame && 'cursor-pointer'"
      @click="frame && open(frame.id)"
    />
    <UserCardFollow v-if="user && !isSelf" />
  </Inline>
</template>

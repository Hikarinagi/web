<script setup lang="ts">
  import { Skeleton } from '@hina-ui/vue'
  import type { EquippedBadge, EquippedDecoration } from '~/utils/user'
  import { useDecorationDetail } from '~/features/decoration/useDetail'

  defineOptions({ name: 'UserBadges' })

  const props = defineProps<{
    user?: { equipped_badges?: EquippedBadge[] | null } | null
    badges?: EquippedDecoration[] | null
    height?: string
    full?: boolean
  }>()

  const { open } = useDecorationDetail()
  const items = computed(() => props.badges ?? badgesOf(props.user))

  function ratioOf(badge: EquippedDecoration) {
    const { width, height } = badge.image
    if (!width || !height) return undefined
    return Math.min(width / height, 4)
  }
</script>

<template>
  <span v-if="items.length" class="inline-flex shrink-0 items-center gap-1 align-middle">
    <button
      v-for="(badge, index) in items"
      :key="badge.id"
      v-tooltip="badge.name"
      type="button"
      class="cursor-pointer rounded-md p-0"
      :class="[height ?? 'h-4', !full && index > 0 ? 'hidden sm:inline-flex' : 'inline-flex']"
      @click="open(badge.id)"
    >
      <HikariImage
        :src="badge.image.src"
        :alt="badge.name"
        :preview="false"
        :image-class="
          ratioOf(badge) ? 'h-full w-full object-contain' : 'h-full w-auto object-contain'
        "
        class="inline-block h-full w-auto"
        :ratio="ratioOf(badge)"
      >
        <template #skeleton>
          <Skeleton class="size-full rounded-md" />
        </template>
      </HikariImage>
    </button>
  </span>
</template>

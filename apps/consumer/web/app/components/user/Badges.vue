<script setup lang="ts">
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

  function ratioStyle(badge: EquippedDecoration) {
    const { width, height } = badge.image
    if (!width || !height) return undefined
    return { aspectRatio: width / height > 4 ? '4' : `${width} / ${height}` }
  }
</script>

<template>
  <span v-if="items.length" class="inline-flex shrink-0 items-center gap-1 align-middle">
    <button
      v-for="(badge, index) in items"
      :key="badge.id"
      v-tooltip.top="badge.name"
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
          ratioStyle(badge) ? 'h-full w-full object-contain' : 'h-full w-auto object-contain'
        "
        class="inline-block h-full w-auto"
        :style="ratioStyle(badge)"
      />
    </button>
  </span>
</template>

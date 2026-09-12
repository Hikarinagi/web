<script setup lang="ts">
  import { favoriteStateKey, type FavoriteEntityType } from '~/features/favorite/entity'
  import FavoriteStarIcon from '~/components/favorite/StarIcon.vue'
  import FavoritePickerOverlay from '~/components/favorite/picker/Overlay.vue'

  defineOptions({ name: 'FavoriteToggle', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      type: FavoriteEntityType
      id: number
      initialFavorited?: boolean
      variant?: 'icon' | 'bar'
      pickerTitle?: string
    }>(),
    { initialFavorited: false, variant: 'icon', pickerTitle: undefined },
  )

  const favorited = useState(favoriteStateKey(props.type, props.id), () => props.initialFavorited)
  const overlay = ref<InstanceType<typeof FavoritePickerOverlay> | null>(null)
</script>

<template>
  <AuthGateButton
    v-if="variant === 'icon'"
    v-bind="$attrs"
    :label="favorited ? '已收藏' : '收藏'"
    side="bottom"
    variant="outline"
    @click="overlay?.open($event)"
  >
    <FavoriteStarIcon :favorited="favorited" :variant="variant" />
  </AuthGateButton>

  <AuthGateButton
    v-else
    v-bind="$attrs"
    :label="favorited ? '已收藏' : '收藏'"
    @click="overlay?.open($event)"
  >
    <FavoriteStarIcon :favorited="favorited" :variant="variant" />
  </AuthGateButton>

  <FavoritePickerOverlay :id="id" ref="overlay" :type="type" :picker-title="pickerTitle" />
</template>

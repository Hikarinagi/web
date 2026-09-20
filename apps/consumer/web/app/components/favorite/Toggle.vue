<script setup lang="ts">
  import { favoriteStateKey, type FavoriteEntityType } from '~/features/favorite/entity'
  import FavoriteHeartIcon from '~/components/favorite/HeartIcon.vue'
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
  <Button
    v-if="variant === 'icon'"
    v-tooltip.bottom="favorited ? '已收藏' : '收藏'"
    v-bind="$attrs"
    login-required
    severity="secondary"
    outlined
    :aria-label="favorited ? '已收藏' : '收藏'"
    @click="overlay?.open($event)"
  >
    <template #icon>
      <FavoriteHeartIcon :favorited="favorited" :variant="variant" />
    </template>
  </Button>

  <Button
    v-else
    v-bind="$attrs"
    login-required
    text
    severity="secondary"
    :aria-label="favorited ? '已收藏' : '收藏'"
    @click="overlay?.open($event)"
  >
    <template #icon>
      <FavoriteHeartIcon :favorited="favorited" :variant="variant" />
    </template>
  </Button>

  <FavoritePickerOverlay :id="id" ref="overlay" :type="type" :picker-title="pickerTitle" />
</template>

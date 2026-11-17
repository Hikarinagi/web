<script setup lang="ts">
  import { Button, DropdownMenu, DropdownMenuItem, IconButton } from '@hina-ui/vue'
  import { Eye, EyeOff, SlidersHorizontal } from '@lucide/vue'
  import { useNsfwPolicy } from '~/features/nsfw/composables/useNsfwPolicy'
  import { useNsfwReveal } from '~/features/nsfw/composables/useNsfwReveal'
  import type { HikariImageSource } from '~/utils/media/image'
  import { imageSourceSafety, imageSourceSrc } from '~/utils/media/image'

  defineOptions({ name: 'NsfwControl', inheritAttrs: false })
  const props = defineProps<{ images: HikariImageSource[] }>()

  const auth = useAuthStore()
  const { requireLogin } = useAuthGate()
  const { limitOf } = useNsfwPolicy()
  const { revealed, reveal, conceal } = useNsfwReveal()

  const limited = computed(() =>
    props.images.flatMap(image => {
      const source = imageSourceSrc(image)
      if (!source) return []
      const limit = limitOf(imageSourceSafety(image))
      return limit === 'JUST_SHOW' ? [] : [{ source, limit }]
    }),
  )
  const sources = computed(() =>
    limited.value.flatMap(item => (item.limit === 'SHOW_WITH_SPOILER' ? [item.source] : [])),
  )
  const shown = computed(() => limited.value.length > 0)
  const masked = computed(() =>
    limited.value.some(
      item => item.limit !== 'SHOW_WITH_SPOILER' || !revealed.value.includes(item.source),
    ),
  )
  const hiding = computed(() => sources.value.some(source => !revealed.value.includes(source)))
</script>

<template>
  <Button
    v-if="shown && !auth.isAuthenticated"
    v-bind="$attrs"
    variant="soft"
    tone="neutral"
    size="sm"
    @click="requireLogin()"
  >
    <template #icon><EyeOff /></template>
    已模糊
  </Button>
  <DropdownMenu v-else-if="shown" :key="String(masked)" label="图片显示" align="start">
    <Button v-if="masked" v-bind="$attrs" variant="soft" tone="neutral" size="sm">
      <template #icon><EyeOff /></template>
      已模糊
    </Button>
    <IconButton v-else v-bind="$attrs" label="图片显示" variant="soft" tone="neutral" size="sm">
      <Eye />
    </IconButton>

    <template #content>
      <template v-if="sources.length">
        <DropdownMenuItem v-if="hiding" @select="reveal(sources)">
          <template #icon><Eye /></template>
          显示图片
        </DropdownMenuItem>
        <DropdownMenuItem v-else @select="conceal(sources)">
          <template #icon><EyeOff /></template>
          恢复模糊
        </DropdownMenuItem>
      </template>
      <DropdownMenuItem @select="navigateTo('/setting/preference')">
        <template #icon><SlidersHorizontal /></template>
        调整显示设置
      </DropdownMenuItem>
    </template>
  </DropdownMenu>
</template>

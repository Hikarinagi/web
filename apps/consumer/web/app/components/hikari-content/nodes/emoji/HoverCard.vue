<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
  import { SmilePlus } from '@lucide/vue'
  import { useUserEmojiCatalog } from '~/components/hikari-editor/plugins/emoji/composables/useUserEmojiCatalog'

  defineOptions({ name: 'HikariContentNodesEmojiHoverCard' })

  const props = defineProps<{
    src: string | null
    code: string
    setName: string | null
    setId: number | null
    subscribable: boolean
  }>()

  const auth = useAuthStore()
  const { sets, loaded, refresh } = useUserEmojiCatalog()
  const submitting = ref(false)

  const alreadySubscribed = computed(
    () => auth.isAuthenticated && !!props.setName && sets.value.some(s => s.name === props.setName),
  )
  const disabled = computed(() => {
    if (!props.subscribable || submitting.value) return true
    if (auth.isAuthenticated && !loaded.value) return true
    return alreadySubscribed.value
  })
  const label = computed(() => (alreadySubscribed.value ? '已添加' : '添加到我的贴纸'))

  async function onSubscribe() {
    if (!props.setId || disabled.value) return
    submitting.value = true
    try {
      await hikariRequest<'/api/v3/emoji/my-subscriptions', 'post'>(
        '/api/v3/emoji/my-subscriptions',
        { method: 'post', body: { emoji_set_id: props.setId } },
      )
      await refresh()
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Stack gap="xs" align="center">
    <HikariImage
      :src="src"
      :alt="`:${code}:`"
      :processing="false"
      :draggable="false"
      class="size-28"
      image-class="h-full w-full object-contain"
    />
    <Text as="span" size="xs" tone="muted" class="font-mono">:{{ code }}:</Text>
    <Text v-if="setName" as="span" size="xs" tone="faint">{{ setName }}</Text>
    <Button
      login-required
      variant="soft"
      tone="neutral"
      size="sm"
      pill
      :loading="submitting"
      :disabled="disabled"
      class="mt-1 w-36"
      @click="onSubscribe"
    >
      <template #icon><SmilePlus /></template>
      {{ label }}
    </Button>
  </Stack>
</template>

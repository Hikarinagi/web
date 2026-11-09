<script setup lang="ts">
  import { Alert, Button, Inline, Panel, Stack } from '@hina-ui/vue'
  import { ArrowLeft, Check, ShieldAlert } from '@lucide/vue'
  import {
    NEVER_SHOW_NSFW,
    SHOW_NSFW_WITH_SPOILER,
  } from '~/features/nsfw/composables/useNsfwPolicy'

  const props = defineProps<{
    redirectTo: string
  }>()

  const auth = useAuthStore()
  const submitting = ref(false)
  const nav = usePageNav()

  const canEnter = computed(() => !!auth.user && auth.user.content_limit !== NEVER_SHOW_NSFW)

  watch(
    () => canEnter.value && nav.current(),
    go => {
      if (go) void nav.replace(props.redirectTo)
    },
    { immediate: true },
  )

  async function enableAndContinue() {
    if (submitting.value) return

    submitting.value = true

    try {
      await hikariRequest<'/api/v3/user/me/settings', 'patch'>('/api/v3/user/me/settings', {
        method: 'PATCH',
        body: { content_limit: SHOW_NSFW_WITH_SPOILER },
      })
      const user = await hikariRequest('/api/v3/user/me', { toast: false })
      auth.setUser(user)
    } finally {
      submitting.value = false
    }
  }

  function back() {
    void nav.back('/create/wiki')
  }
</script>

<template>
  <Panel
    title="确认内容显示等级"
    description="Wiki编辑需要完整检索条目。继续前需要至少能看到 NSFW 条目（可带模糊遮罩），否则部分条目会被门禁过滤。"
    class="mx-auto w-full max-w-2xl"
  >
    <template #icon><ShieldAlert /></template>
    <Stack gap="md">
      <Alert tone="warning">
        确认后会将内容显示等级切换为「显示但带模糊遮罩」。编辑器内的搜索、关联和详情不再被 NSFW
        门禁过滤（图片仍按模糊遮罩处理）。
      </Alert>

      <Inline gap="sm">
        <Button :loading="submitting" @click="enableAndContinue">
          <template #icon><Check /></template>
          切换并继续
        </Button>
        <Button variant="outline" tone="neutral" @click="back">
          <template #icon><ArrowLeft /></template>
          返回
        </Button>
      </Inline>
    </Stack>
  </Panel>
</template>

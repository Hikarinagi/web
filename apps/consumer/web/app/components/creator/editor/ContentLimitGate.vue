<script setup lang="ts">
  import { Alert, Button, Inline, Panel, Stack } from '@hina-ui/vue'
  import { ArrowLeft, Check, ShieldAlert } from '@lucide/vue'

  const props = defineProps<{
    redirectTo: string
  }>()

  const auth = useAuthStore()
  const submitting = ref(false)
  const nav = usePageNav()

  const canEnter = computed(
    () => !!auth.user && auth.user.sexual_2_limit !== 'NEVER_SHOW_NSFW_CONTENT',
  )

  watch(
    () => canEnter.value && nav.current(),
    go => {
      if (go) void nav.replace(props.redirectTo)
    },
    { immediate: true },
  )

  async function enableAndContinue() {
    if (submitting.value || !auth.user) return

    submitting.value = true

    try {
      await hikariRequest<'/api/v3/user/me/settings', 'patch'>('/api/v3/user/me/settings', {
        method: 'PATCH',
        body: {
          sexual_1_limit:
            auth.user.sexual_1_limit === 'NEVER_SHOW_NSFW_CONTENT'
              ? 'SHOW_WITH_SPOILER'
              : auth.user.sexual_1_limit,
          sexual_2_limit: 'SHOW_WITH_SPOILER',
        },
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
        确认后，成人内容中设为「不显示」的档位改为「模糊」。编辑器内的搜索、关联和详情不再过滤 NSFW
        条目，图片仍按显示设置处理。
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

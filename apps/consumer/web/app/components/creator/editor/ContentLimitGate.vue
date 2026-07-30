<script setup lang="ts">
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
  const router = useRouter()

  const canEnter = computed(() => !!auth.user && auth.user.content_limit !== NEVER_SHOW_NSFW)

  watch(
    canEnter,
    allowed => {
      if (allowed) void navigateTo(props.redirectTo, { replace: true })
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
      await navigateTo(props.redirectTo, { replace: true })
    } finally {
      submitting.value = false
    }
  }

  function back() {
    void router.back()
  }
</script>

<template>
  <div class="mx-auto flex max-w-2xl flex-col gap-5">
    <CardPanel
      title="确认内容显示等级"
      :icon="ShieldAlert"
      description="Wiki编辑需要完整检索条目。继续前需要至少能看到 NSFW 条目(可带模糊遮罩),否则部分条目会被门禁过滤。"
    >
      <div class="flex flex-col gap-5">
        <Message severity="warn" variant="simple" size="small">
          确认后会将内容显示等级切换为「显示但带模糊遮罩」。编辑器内的搜索、关联和详情不再被 NSFW
          门禁过滤(图片仍按模糊遮罩处理)。
        </Message>

        <div class="flex flex-wrap gap-3">
          <Button label="切换并继续" :loading="submitting" @click="enableAndContinue">
            <template #icon><Check class="size-[1em]" /></template>
          </Button>
          <Button label="返回" severity="secondary" variant="outlined" @click="back">
            <template #icon><ArrowLeft class="size-[1em]" /></template>
          </Button>
        </div>
      </div>
    </CardPanel>
  </div>
</template>

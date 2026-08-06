<script setup lang="ts">
  import { isAutoUsername } from '~/utils/user'

  defineOptions({ name: 'AuthUsernamePrompt' })

  const auth = useAuthStore()
  const dismissed = useLocalStorage('hikari-username-prompt-dismissed', false)
  const open = ref(false)

  const needsSetup = computed(() => {
    const u = auth.user
    return !!u && !u.username_changed && isAutoUsername(u.name)
  })

  function maybeShow() {
    if (auth.loaded && needsSetup.value && !dismissed.value) open.value = true
  }

  onMounted(maybeShow)
  watch(() => [auth.loaded, auth.user?.id], maybeShow)
  watch(open, visible => {
    if (!visible) dismissed.value = true
  })
</script>

<template>
  <UserChangeUsernameDialog
    v-if="auth.user"
    v-model:visible="open"
    :current="auth.user.name"
    :dismissable-mask="false"
    intro="欢迎来到全新的 Hikarinagi v3！我们重新设计了用户名和昵称系统，因此我们在迁移中重置了你的初始用户名，现在你有一次修改用户名的机会"
  />
</template>

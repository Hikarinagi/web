<script setup lang="ts">
  import { SETTING_ME_KEY } from '~/features/space/setting-context'

  defineOptions({ name: 'PageSpaceSetting' })
  definePageMeta({ layout: 'default', middleware: 'auth' })

  const auth = useAuthStore()

  const { data } = await useHikariApiData('/api/pages/setting', { fatal: true })

  const me = computed(() => data.value!.me)
  provide(SETTING_ME_KEY, me)

  watch(
    () => auth.user,
    nextUser => {
      if (!data.value || !nextUser || data.value.me.id !== nextUser.id) return
      data.value = { ...data.value, me: nextUser }
    },
  )

  useHikariSeoMeta({ title: '设置', appendSiteName: true })
</script>

<template>
  <div v-if="data" class="py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-color">设置</h1>
      <p class="mt-1 text-sm text-muted-color">管理你的资料、账号安全与内容偏好</p>
    </header>

    <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <aside class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)] lg:w-56 lg:shrink-0">
        <SpaceSettingNav />
      </aside>

      <div class="min-w-0 flex-1">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Flex, Heading, Stack, Text } from '@hina-ui/vue'
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
  <Stack v-if="data" gap="lg" class="py-8">
    <Stack as="header" gap="xs">
      <Heading :level="1" size="2xl" class="font-bold">设置</Heading>
      <Text size="sm" tone="muted">管理你的资料、账号安全与内容偏好</Text>
    </Stack>

    <Flex direction="col" gap="lg" class="lg:flex-row lg:items-start lg:gap-8">
      <Stack
        as="aside"
        gap="none"
        class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)] lg:w-56 lg:shrink-0"
      >
        <SpaceSettingNav />
      </Stack>

      <Stack gap="none" class="min-w-0 flex-1">
        <NuxtPage />
      </Stack>
    </Flex>
  </Stack>
</template>

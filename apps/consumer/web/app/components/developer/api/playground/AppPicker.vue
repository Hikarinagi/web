<script setup lang="ts">
  import { Button, Code, CopyButton, Inline, Link, Select, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { playgroundCallbackUrl, usePlaygroundAuth } from '~/features/developer/usePlaygroundAuth'

  defineOptions({ name: 'DeveloperApiPlaygroundAppPicker' })
  const props = defineProps<{ authorizationEndpoint: string; scopes: string[] }>()

  const { data, status } = useHikariApiData('/api/v3/user/me/developer/apps', {
    lazy: true,
    server: false,
    watch: false,
    toast: false,
  })

  const apps = computed(() =>
    (data.value?.items ?? []).filter(app => app.enabled && app.client_type === 'public'),
  )
  const options = computed(() =>
    apps.value.map(app => ({ value: app.client_id, label: app.client_name })),
  )
  const selected = ref<string | null>(null)
  watchEffect(() => {
    if (!selected.value) selected.value = apps.value[0]?.client_id ?? null
  })

  const app = computed(() => apps.value.find(item => item.client_id === selected.value))
  const callback = ref('')
  onMounted(() => {
    callback.value = playgroundCallbackUrl(window.location.origin)
  })

  const missingScopes = computed(() => {
    const granted = new Set((app.value?.scope ?? '').split(' ').filter(Boolean))
    return props.scopes.filter(scope => !granted.has(scope))
  })
  const missingCallback = computed(
    () =>
      Boolean(app.value) &&
      Boolean(callback.value) &&
      !app.value!.redirect_uris.includes(callback.value),
  )
  const ready = computed(
    () => Boolean(app.value) && !missingScopes.value.length && !missingCallback.value,
  )

  const route = useRoute()
  const { authorize } = usePlaygroundAuth()
  const redirecting = ref(false)

  async function onAuthorize() {
    if (!app.value) return
    redirecting.value = true
    await authorize({
      authorizationEndpoint: props.authorizationEndpoint,
      clientId: app.value.client_id,
      appName: app.value.client_name,
      scopes: props.scopes,
      returnTo: route.fullPath,
    })
  }
</script>

<template>
  <Stack v-if="status !== 'error'" gap="sm">
    <Text as="p" size="sm" tone="muted">
      以名下的应用发起授权。令牌代表你本人，调用计入该应用的配额与用量。
    </Text>

    <Text v-if="!apps.length && status === 'success'" as="p" size="sm" tone="muted"
      >当前账号下没有单页应用或原生应用，请先在<Link
        :as="NuxtLink"
        to="/developers/console"
        underline
        >控制台</Link
      >创建。</Text
    >

    <template v-else-if="apps.length">
      <Inline gap="sm" align="center" :wrap="false">
        <Select
          v-model="selected"
          :options="options"
          aria-label="选择应用"
          class="min-w-0 flex-1"
        />
        <Button :loading="redirecting" :disabled="!ready" class="shrink-0" @click="onAuthorize">
          授权
        </Button>
      </Inline>

      <Stack v-if="missingScopes.length" gap="none" align="start">
        <Text as="span" size="xs" tone="warning">
          该应用缺少本端点所需的 {{ missingScopes.join('、') }}，请在控制台勾选。
        </Text>
      </Stack>

      <Stack v-if="missingCallback" gap="xs" align="start">
        <Text as="span" size="xs" tone="warning">该应用尚未登记调试台的回调地址：</Text>
        <Inline gap="xs" align="center" :wrap="false" class="w-full">
          <Code class="min-w-0 flex-1 truncate text-xs">{{ callback }}</Code>
          <CopyButton :text="callback" label="复制回调地址" class="shrink-0" />
        </Inline>
      </Stack>
    </template>
  </Stack>
</template>

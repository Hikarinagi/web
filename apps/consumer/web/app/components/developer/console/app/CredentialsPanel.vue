<script setup lang="ts">
  import {
    Button,
    Code,
    CopyButton,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Heading,
    Inline,
    Section,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { RotateCcwKey } from '@lucide/vue'
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'

  defineOptions({ name: 'DeveloperConsoleAppCredentialsPanel' })

  const props = defineProps<{
    app: DeveloperAppPageData['app']
    oauth: DeveloperAppPageData['oauth']
  }>()
  const emit = defineEmits<{ rotated: [secret: { client_id: string; client_secret: string }] }>()

  const { confirm } = useHikariConfirm()
  const busy = ref(false)

  const createdAt = computed(() => new Date(props.app.created_at).toLocaleDateString('zh-CN'))
  const confidential = computed(() => props.app.client_type === 'confidential')
  const authCodeEnabled = computed(() => props.app.grant_types.includes('authorization_code'))

  function confirmRotate() {
    confirm({
      title: '轮换密钥',
      description: '旧密钥将立即失效，正在使用该应用的服务需要更换新密钥',
      confirmText: '轮换',
      tone: 'danger',
      onConfirm: () => rotate(),
    })
  }

  async function rotate() {
    busy.value = true
    try {
      const result = await hikariRequest<
        '/api/v3/user/me/developer/apps/{client_id}/secret',
        'post'
      >('/api/v3/user/me/developer/apps/{client_id}/secret', {
        method: 'post',
        path: { client_id: props.app.client_id },
      })
      emit('rotated', { client_id: result.client_id, client_secret: result.client_secret })
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <Section class="py-6 first:pt-0 last:pb-0">
    <Stack gap="md">
      <Inline gap="md" align="center" justify="between">
        <Heading :level="3" size="base">凭据</Heading>
        <Button
          v-if="confidential"
          variant="outline"
          tone="neutral"
          :loading="busy"
          @click="confirmRotate"
        >
          <template #icon><RotateCcwKey /></template>
          轮换密钥
        </Button>
        <Text v-else as="span" size="xs" tone="muted">公共客户端不持有密钥</Text>
      </Inline>

      <DescriptionList>
        <DescriptionTerm>client_id</DescriptionTerm>
        <DescriptionDetails>
          <Inline as="span" gap="xs" align="center">
            <Code>{{ app.client_id }}</Code>
            <CopyButton :text="app.client_id" label="复制 client_id" size="sm" />
          </Inline>
        </DescriptionDetails>

        <template v-if="authCodeEnabled">
          <DescriptionTerm>授权端点</DescriptionTerm>
          <DescriptionDetails>
            <Code class="min-w-0 truncate">{{ oauth.authorization_endpoint }}</Code>
          </DescriptionDetails>
          <DescriptionTerm>令牌端点</DescriptionTerm>
          <DescriptionDetails>
            <Code class="min-w-0 truncate">{{ oauth.token_endpoint }}</Code>
          </DescriptionDetails>
        </template>

        <DescriptionTerm>创建时间</DescriptionTerm>
        <DescriptionDetails>{{ createdAt }}</DescriptionDetails>
      </DescriptionList>

      <Text v-if="authCodeEnabled" size="xs" tone="muted">
        用户授权采用授权码流程，PKCE 为必填项：发起授权时传入 code_challenge，换取令牌时传入
        code_verifier。如需在用户离线时续期，请一并申请 offline_access。
      </Text>
    </Stack>
  </Section>
</template>

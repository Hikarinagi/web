<script setup lang="ts">
  import {
    Button,
    Callout,
    CodeBlock,
    Dialog,
    Divider,
    Form,
    FormField,
    Link,
    Stack,
    Text,
    Textarea,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { useApiToken } from '~/features/developer/useApiToken'
  import {
    playgroundTokenSchema,
    type PlaygroundTokenValues,
  } from '~/features/developer/schemas/playground.schema'
  import type { DevelopersGuidePageData } from '~~/server/api/pages/developers/guide.get'

  defineOptions({ name: 'DeveloperApiPlaygroundTokenDialog' })

  defineProps<{ scopes: string[] }>()
  const open = defineModel<boolean>('open', { default: false })
  const { token, configured, save, clear } = useApiToken()

  const form = ref<InstanceType<typeof Form>>()
  const values = reactive<PlaygroundTokenValues>({ token: '' })

  const { data: guide, execute } = useHikariApiData<DevelopersGuidePageData>(
    '/api/pages/developers/guide',
    { lazy: true, server: false, immediate: false, watch: false, toast: false },
  )
  const exchange = computed(() => guide.value?.snippets.app_token)

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    values.token = token.value
    if (!guide.value) void execute()
  })

  function onSubmit(data: PlaygroundTokenValues) {
    save(data.token)
    open.value = false
  }

  function reset() {
    clear()
    values.token = ''
    open.value = false
  }
</script>

<template>
  <Dialog v-model:open="open" title="调试令牌" size="lg">
    <template #content>
      <Stack gap="md">
        <Callout tone="info">
          <Text size="sm">令牌只保存在当前标签页，关闭页面即清除，不会随页面上传。</Text>
        </Callout>

        <DeveloperApiPlaygroundAppPicker
          v-if="guide"
          :authorization-endpoint="guide.authorization_endpoint"
          :scopes
        />

        <Divider label="或" />

        <Stack gap="sm">
          <Text as="p" size="sm" tone="muted"
            >服务端应用不支持浏览器授权，请在<Link :as="NuxtLink" to="/developers/console" underline
              >控制台</Link
            >取得密钥后自行换取，令牌有效期 1 小时。</Text
          >
          <CodeBlock v-if="exchange" :code="exchange.code" :html="exchange.html" />
        </Stack>

        <Form
          ref="form"
          :values="values"
          :rules="playgroundTokenSchema"
          @submit="onSubmit as (data: unknown) => void"
        >
          <FormField
            name="token"
            label="access token"
            description="随本页的调试请求发往 api.hikarinagi.org，配额计入该令牌所属的应用。"
          >
            <Textarea
              v-model="values.token"
              :autosize="{ minRows: 3, maxRows: 6 }"
              autocomplete="off"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              data-1p-ignore
              data-lpignore="true"
              placeholder="粘贴 access token"
              class="font-mono text-xs"
            />
          </FormField>
        </Form>
      </Stack>
    </template>

    <template #footer>
      <Button v-if="configured" variant="ghost" tone="danger" @click="reset">清除</Button>
      <Button variant="soft" tone="neutral" @click="open = false">取消</Button>
      <Button @click="form?.submit()">保存</Button>
    </template>
  </Dialog>
</template>

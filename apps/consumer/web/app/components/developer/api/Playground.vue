<script setup lang="ts">
  import {
    Button,
    Card,
    Code,
    CopyButton,
    Divider,
    Form,
    FormField,
    FormLayout,
    Inline,
    Tag,
    Text,
    Textarea,
  } from '@hina-ui/vue'
  import { KeyRound } from '@lucide/vue'
  import type { ReferenceOperation } from '~~/server/features/developer/reference'
  import { useApiToken } from '~/features/developer/useApiToken'
  import { usePlayground } from '~/features/developer/usePlayground'

  defineOptions({ name: 'DeveloperApiPlayground' })
  const props = defineProps<{ operation: ReferenceOperation; base: string }>()

  const { configured, preview, source } = useApiToken()
  const settingsOpen = ref(false)

  const {
    values,
    rules,
    bodyField,
    bodyText,
    pathParams,
    queryParams,
    acceptsBody,
    requestUrl,
    curl,
    pending,
    result,
    send,
  } = usePlayground(
    () => props.operation,
    () => props.base,
  )
</script>

<template>
  <Card :padded="false" class="overflow-hidden">
    <Inline
      gap="sm"
      align="center"
      justify="between"
      class="border-b border-line bg-subtle px-4 py-2.5"
    >
      <Inline gap="sm" align="center" class="min-w-0">
        <Tag :tone="configured ? 'success' : 'neutral'" size="sm">
          {{ configured ? '已配置令牌' : '未配置令牌' }}
        </Tag>
        <Code v-if="configured" class="text-xs">{{ preview }}</Code>
        <Text v-if="configured && source" as="span" size="xs" tone="muted" class="truncate">
          来自「{{ source }}」
        </Text>
        <Text v-if="!configured" as="span" size="xs" tone="muted">设置令牌后才能发送请求</Text>
      </Inline>
      <Button
        variant="ghost"
        tone="neutral"
        size="sm"
        class="shrink-0"
        @click="settingsOpen = true"
      >
        <template #icon><KeyRound /></template>
        {{ configured ? '更换' : '设置令牌' }}
      </Button>
    </Inline>

    <Form :values="values" :rules="rules" :disabled="!configured" class="gap-5 p-4" @submit="send">
      <FormLayout
        v-if="pathParams.length"
        legend="路径参数"
        orientation="horizontal"
        description-placement="label"
        label-width="9rem"
      >
        <DeveloperApiPlaygroundField
          v-for="param in pathParams"
          :key="param.name"
          v-model="values[param.name]!"
          :param="param"
        />
      </FormLayout>

      <FormLayout
        v-if="queryParams.length"
        legend="查询参数"
        description="留空的参数不会发送"
        orientation="horizontal"
        description-placement="label"
        label-width="9rem"
      >
        <DeveloperApiPlaygroundField
          v-for="param in queryParams"
          :key="param.name"
          v-model="values[param.name]!"
          :param="param"
        />
      </FormLayout>

      <FormLayout v-if="acceptsBody" legend="请求体">
        <FormField :name="bodyField">
          <Textarea
            v-model="bodyText"
            :autosize="{ minRows: 4 }"
            aria-label="请求体 JSON"
            class="font-mono text-xs"
          />
        </FormField>
      </FormLayout>

      <Inline gap="sm" align="center" :wrap="false">
        <Code class="min-w-0 flex-1 truncate text-xs">{{ operation.method }} {{ requestUrl }}</Code>
        <CopyButton :text="curl" label="复制为 curl" class="shrink-0" />
        <Button type="submit" :loading="pending" :disabled="!configured" class="shrink-0">
          发送请求
        </Button>
      </Inline>
    </Form>

    <template v-if="result">
      <Divider />
      <DeveloperApiPlaygroundResult :result="result" class="p-4" />
    </template>

    <DeveloperApiPlaygroundTokenDialog v-model:open="settingsOpen" :scopes="operation.scopes" />
  </Card>
</template>

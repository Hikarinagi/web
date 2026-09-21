<script setup lang="ts">
  import {
    CodeBlock,
    Grid,
    Heading,
    Inline,
    Section,
    Stack,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import type { DevelopersApiOperationPageData } from '~~/server/api/pages/developers/api/[id].get'

  defineOptions({ name: 'DeveloperApiSections' })
  const props = defineProps<{ data: DevelopersApiOperationPageData }>()

  const operation = computed(() => props.data.operation)
  const queryParams = computed(() => operation.value.params.filter(param => param.in === 'query'))
  const language = ref('curl')
  const LANGUAGES = [
    { value: 'curl', label: 'curl' },
    { value: 'js', label: 'JavaScript' },
  ]
</script>

<template>
  <Section id="playground">
    <Heading :level="2" size="lg">调试</Heading>
    <DeveloperApiPlayground :operation="operation" :base="data.open_api_base" />
  </Section>

  <Section v-if="queryParams.length" id="params">
    <Heading :level="2" size="lg">查询参数</Heading>
    <Stack gap="none" class="divide-y divide-line">
      <Grid
        v-for="param in queryParams"
        :key="param.name"
        :cols="1"
        class="gap-1 py-2 sm:grid-cols-3 sm:gap-3"
      >
        <Text as="span" size="sm" class="font-mono break-words">
          {{ param.name }}
          <Text v-if="param.required" as="span" size="sm" tone="danger">*</Text>
        </Text>
        <Text as="span" size="xs" tone="muted" class="font-mono break-words">{{ param.type }}</Text>
        <Text as="span" size="sm" tone="muted">{{ param.description }}</Text>
      </Grid>
    </Stack>
  </Section>

  <Section v-if="operation.request?.length" id="request">
    <Heading :level="2" size="lg">请求体</Heading>
    <DeveloperReferenceSchemaFields :fields="operation.request" />
  </Section>

  <Section v-if="operation.response?.length" id="response">
    <Heading :level="2" size="lg">响应字段</Heading>
    <DeveloperReferenceSchemaFields :fields="operation.response" />
  </Section>

  <Section id="example">
    <Heading :level="2" size="lg">示例</Heading>
    <Tabs v-model="language">
      <TabsList label="示例语言">
        <TabsTrigger v-for="entry in LANGUAGES" :key="entry.value" :value="entry.value">
          {{ entry.label }}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="curl" class="pt-4">
        <CodeBlock :code="operation.curl" :html="operation.curlHtml" />
      </TabsContent>
      <TabsContent value="js" class="pt-4">
        <CodeBlock :code="operation.js" :html="operation.jsHtml" />
      </TabsContent>
    </Tabs>
    <template v-if="operation.responseExample">
      <Heading :level="3" size="base">响应示例</Heading>
      <CodeBlock :code="operation.responseExample" :html="operation.responseHtml" />
    </template>
  </Section>

  <Section v-if="operation.statuses.length" id="statuses">
    <Heading :level="2" size="lg">响应状态</Heading>
    <Inline gap="sm">
      <Tag v-for="status in operation.statuses" :key="status.code" tone="neutral" size="sm">
        <Text as="span" size="xs" class="font-mono">{{ status.code }}</Text>
        <Text v-if="status.label" as="span" size="xs" tone="muted" class="ms-1">
          {{ status.label }}
        </Text>
      </Tag>
    </Inline>
  </Section>
</template>

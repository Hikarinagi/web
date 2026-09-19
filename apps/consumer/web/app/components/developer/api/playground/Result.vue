<script setup lang="ts">
  import {
    Code,
    CodeBlock,
    Inline,
    Stack,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import type { PlaygroundResult } from '~/features/developer/usePlayground'

  defineOptions({ name: 'DeveloperApiPlaygroundResult' })
  const props = defineProps<{ result: PlaygroundResult }>()

  const tone = computed(() => {
    if (props.result.status >= 200 && props.result.status < 300) return 'success' as const
    if (props.result.status >= 400 && props.result.status < 500) return 'warning' as const
    return 'danger' as const
  })

  const QUOTA = ['x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset', 'retry-after']
  const quota = computed(() =>
    props.result.headers.filter(header => QUOTA.includes(header.name.toLowerCase())),
  )
  const tab = ref('body')
</script>

<template>
  <Stack gap="sm">
    <Inline gap="sm" align="center">
      <Tag :tone="tone" size="sm" class="font-mono">
        {{ result.status || '—' }} {{ result.statusText }}
      </Tag>
      <Text as="span" size="xs" tone="muted" class="tabular-nums">{{ result.durationMs }} ms</Text>
      <Tag v-if="result.bizCode" tone="danger" size="sm" class="font-mono">
        {{ result.bizCode }}
      </Tag>
      <Text
        v-for="header in quota"
        :key="header.name"
        as="span"
        size="xs"
        tone="muted"
        class="font-mono tabular-nums"
      >
        {{ header.name }}: {{ header.value }}
      </Text>
    </Inline>

    <Tabs v-model="tab">
      <TabsList label="响应">
        <TabsTrigger value="body">响应体</TabsTrigger>
        <TabsTrigger value="headers">响应头 {{ result.headers.length }}</TabsTrigger>
      </TabsList>
      <TabsContent value="body" class="pt-3">
        <CodeBlock :code="result.body" lang="json" class="max-h-96" />
      </TabsContent>
      <TabsContent value="headers" class="pt-3">
        <Stack gap="none" class="divide-y divide-line">
          <Inline
            v-for="header in result.headers"
            :key="header.name"
            gap="sm"
            align="baseline"
            :wrap="false"
            class="py-1.5"
          >
            <Code class="w-56 shrink-0 text-xs break-all">{{ header.name }}</Code>
            <Text as="span" size="xs" tone="muted" class="min-w-0 font-mono break-all">
              {{ header.value }}
            </Text>
          </Inline>
        </Stack>
      </TabsContent>
    </Tabs>
  </Stack>
</template>

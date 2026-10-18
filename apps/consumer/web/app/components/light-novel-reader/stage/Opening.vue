<script setup lang="ts">
  import { Card, Center, Heading, Inline, Progress, Spinner, Stack, Text } from '@hina-ui/vue'
  import { Check, Circle } from '@lucide/vue'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderStageOpening' })

  const { engine } = useReader()
  const { phase, received } = engine

  const ORDER = ['prepare', 'download', 'layout'] as const

  const steps = computed(() => {
    const at = ORDER.indexOf(phase.value as (typeof ORDER)[number])
    return ORDER.map((key, index) => ({
      key,
      label:
        key === 'prepare'
          ? '准备阅读环境'
          : key === 'download'
            ? received.value.font
              ? '下载字体与正文'
              : '下载正文'
            : '排版首页',
      state: index < at ? 'done' : index === at ? 'now' : 'wait',
    }))
  })

  const megabytes = (bytes: number) => (bytes / 1024 / 1024).toFixed(1)
</script>

<template>
  <Center class="absolute inset-0 bg-canvas p-4">
    <Card class="w-full max-w-xs">
      <Stack gap="md">
        <Heading :level="2" size="sm">正在打开</Heading>
        <Stack as="ol" gap="sm">
          <Inline
            v-for="step in steps"
            :key="step.key"
            as="li"
            gap="sm"
            align="start"
            :wrap="false"
          >
            <Center class="h-5.5 w-4.5 shrink-0">
              <Check
                v-if="step.state === 'done'"
                class="size-4.5 text-accent-text"
                aria-hidden="true"
              />
              <Spinner v-else-if="step.state === 'now'" />
              <Circle v-else class="size-4.5 text-disabled" aria-hidden="true" />
            </Center>
            <Stack gap="xs" class="min-w-0 flex-1">
              <Text size="sm" :tone="step.state === 'wait' ? 'faint' : undefined">
                {{ step.label }}
              </Text>
              <template v-if="step.key === 'download' && step.state === 'now' && received.total">
                <Text size="xs" tone="muted" class="tabular-nums">
                  {{ megabytes(received.loaded) }} / {{ megabytes(received.total) }} MB
                </Text>
                <Progress :value="received.loaded" :max="received.total" size="sm" />
              </template>
            </Stack>
          </Inline>
        </Stack>
      </Stack>
    </Card>
  </Center>
</template>

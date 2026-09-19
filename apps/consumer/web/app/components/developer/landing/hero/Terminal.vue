<script setup lang="ts">
  import { Card, Inline, ScrollArea, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'DeveloperLandingHeroTerminal' })

  const openApiBase = useRuntimeConfig().public.openApiBase

  const lines = [
    {
      segments: [
        { text: '$ ', accent: true },
        {
          text: `curl --get "${openApiBase}/v3/search" \\`,
          accent: false,
        },
      ],
      muted: false,
    },
    {
      segments: [
        {
          text: '    --data-urlencode "q=Yozora no Hoshi o" \\',
          accent: false,
        },
      ],
      muted: false,
    },
    {
      segments: [
        {
          text: '    -H "Authorization: Bearer $ACCESS_TOKEN"',
          accent: false,
        },
      ],
      muted: false,
    },
    { segments: [{ text: '{', accent: false }], muted: true },
    {
      segments: [
        { text: '  "success": ', accent: false },
        { text: 'true,', accent: true },
      ],
      muted: true,
    },
    {
      segments: [
        {
          text: '  "data": { "items": [ … ], "meta": { … } }',
          accent: false,
        },
      ],
      muted: true,
    },
    { segments: [{ text: '}', accent: false }], muted: true },
  ]

  function segmentClass(segment: { accent: boolean }, line: { muted: boolean }) {
    if (segment.accent) return 'text-accent-text'
    return line.muted ? 'text-muted' : 'text-fg'
  }
</script>

<template>
  <Card :padded="false" class="overflow-hidden rounded-xl bg-inset shadow-lg">
    <Inline gap="xs" align="center" :wrap="false" class="border-b border-line px-4 py-3">
      <Text v-for="dot in 3" :key="dot" as="span" class="size-2.5 rounded-full bg-line-strong" />
      <Text as="span" size="xs" tone="muted" class="ms-2 font-mono">terminal</Text>
    </Inline>

    <ScrollArea direction="horizontal">
      <Stack gap="none" class="px-4 py-4 font-mono text-xs leading-6 sm:text-sm">
        <Text v-for="(line, index) in lines" :key="index" as="div" size="xs" class="sm:text-sm">
          <Text
            v-for="(segment, segmentIndex) in line.segments"
            :key="segmentIndex"
            as="span"
            size="xs"
            class="whitespace-pre sm:text-sm"
            :class="segmentClass(segment, line)"
          >
            {{ segment.text }}
          </Text>
        </Text>
      </Stack>
    </ScrollArea>
  </Card>
</template>

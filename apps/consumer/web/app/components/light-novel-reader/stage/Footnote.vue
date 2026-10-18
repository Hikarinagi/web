<script setup lang="ts">
  import { Popover, Prose, ScrollArea, Sheet, Stack, Text, type OverlayAnchor } from '@hina-ui/vue'
  import DOMPurify from 'dompurify'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderStageFootnote' })

  const { events, shell } = useReader()
  const { footnote } = events
  const { phone } = shell

  const kind = computed(() =>
    footnote.entry?.kind === 'endnote' || footnote.entry?.kind === 'rearnote' ? '尾注' : '注释',
  )
  const html = computed(() =>
    DOMPurify.sanitize(footnote.entry?.html ?? '', {
      ALLOWED_TAGS: [
        'p',
        'br',
        'span',
        'em',
        'strong',
        'b',
        'i',
        'u',
        's',
        'sub',
        'sup',
        'small',
        'ruby',
        'rb',
        'rt',
        'rp',
        'ol',
        'ul',
        'li',
        'blockquote',
      ],
      ALLOWED_ATTR: [],
    }).trim(),
  )
  const paragraphs = computed(() =>
    (footnote.entry?.text ?? '')
      .split(/\n+/)
      .map(line => line.trim())
      .filter(Boolean),
  )
  const anchor = computed<OverlayAnchor>(() => {
    const { x, y } = footnote
    return { getBoundingClientRect: () => new DOMRect(x, y, 1, 1) }
  })
</script>

<template>
  <Sheet v-if="phone" v-model:open="footnote.open" :title="kind">
    <template #content>
      <Prose v-if="html" as-child>
        <div class="px-4 pb-4 text-sm" v-html="html" />
      </Prose>
      <Stack v-else gap="sm" class="px-4 pb-4">
        <Text v-for="(line, index) in paragraphs" :key="index" size="sm">{{ line }}</Text>
      </Stack>
    </template>
  </Sheet>
  <Popover
    v-else
    v-model:open="footnote.open"
    :anchor="anchor"
    :modal="false"
    side="top"
    :padded="false"
    :aria-label="kind"
    class="w-80"
  >
    <template #content>
      <Text size="xs" tone="muted" weight="medium" class="block px-4 pt-4 pb-2">{{ kind }}</Text>
      <ScrollArea class="max-h-72">
        <Prose v-if="html" as-child>
          <div class="px-4 pb-4 text-sm" v-html="html" />
        </Prose>
        <Stack v-else gap="sm" class="px-4 pb-4">
          <Text v-for="(line, index) in paragraphs" :key="index" size="sm">{{ line }}</Text>
        </Stack>
      </ScrollArea>
    </template>
  </Popover>
</template>

<script setup lang="ts">
  import { Flex, Heading, IconButton, Inline, Text } from '@hina-ui/vue'
  import { ArrowLeft, List } from '@lucide/vue'
  import { cn } from '~/utils/cn'
  import { MANGA_READER_CHROME_PILL } from './lib/chrome'

  defineOptions({ name: 'MangaReaderTopBar' })

  defineProps<{
    title: string
    chapterLabel: string
  }>()

  const emit = defineEmits<{
    back: []
    openCatalog: []
  }>()

  const pill = cn('pointer-events-auto', MANGA_READER_CHROME_PILL)
</script>

<template>
  <Flex
    align="center"
    gap="md"
    class="pointer-events-none bg-gradient-to-b from-neutral-1000/75 to-transparent px-4 pt-3 pb-12 sm:px-6"
  >
    <IconButton label="返回详情页" pill :class="pill" @click="emit('back')">
      <ArrowLeft aria-hidden="true" />
    </IconButton>

    <Inline :wrap="false" gap="sm" align="baseline" class="pointer-events-auto min-w-0 flex-1">
      <Heading :level="1" size="sm" weight="medium" truncate class="min-w-0 text-neutral-0">
        {{ title }}
      </Heading>
      <Text size="xs" truncate class="min-w-0 text-neutral-300">{{ chapterLabel }}</Text>
    </Inline>

    <IconButton label="章节目录" pill :class="pill" @click="emit('openCatalog')">
      <List aria-hidden="true" />
    </IconButton>
  </Flex>
</template>

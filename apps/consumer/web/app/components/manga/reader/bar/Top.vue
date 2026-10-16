<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem, Flex, Heading, IconButton, Stack } from '@hina-ui/vue'
  import {
    ArrowLeft,
    Columns2,
    Ellipsis,
    Link2,
    List,
    Maximize,
    Minimize,
    Settings2,
    SquareSplitHorizontal,
  } from '@lucide/vue'

  defineOptions({ name: 'MangaReaderBarTop' })

  defineProps<{
    title: string
    heading: string
    narrow: boolean
    dark: boolean
    paged: boolean
    double: boolean
    fullscreen: boolean
  }>()
  const emit = defineEmits<{
    back: []
    directory: []
    toggleDouble: []
    adjust: []
    settings: [event: Event]
    fullscreen: []
    copyLink: []
  }>()

  const titleElement = useTemplateRef<InstanceType<typeof Heading>>('titleElement')
  const titleClipped = useOverflowing(titleElement)
</script>

<template>
  <Flex
    align="center"
    gap="xs"
    :wrap="false"
    class="min-h-14 border-b border-line bg-veil px-3 pt-[env(safe-area-inset-top)] backdrop-blur-(--hn-blur-scrim)"
  >
    <IconButton label="返回作品页" variant="ghost" tone="neutral" @click="emit('back')">
      <ArrowLeft />
    </IconButton>
    <Stack gap="none" class="min-w-0 flex-1">
      <Heading
        ref="titleElement"
        v-tooltip="titleClipped ? title : null"
        :level="1"
        size="sm"
        weight="semibold"
        truncate
      >
        {{ title }}
      </Heading>
      <TruncatedText :text="heading" size="sm" tone="muted" />
    </Stack>
    <DropdownMenu v-if="narrow" label="更多" align="end" :class="dark ? 'dark' : undefined">
      <IconButton label="更多" :tooltip="false" variant="ghost" tone="neutral" aria-haspopup="menu">
        <Ellipsis />
      </IconButton>
      <template #content>
        <DropdownMenuItem @select="emit('copyLink')">
          <template #icon><Link2 /></template>
          复制作品链接
        </DropdownMenuItem>
      </template>
    </DropdownMenu>
    <template v-else>
      <IconButton label="目录" variant="ghost" tone="neutral" @click="emit('directory')">
        <List />
      </IconButton>
      <IconButton
        v-if="paged && double"
        label="调整配对"
        variant="ghost"
        tone="neutral"
        @click="emit('adjust')"
      >
        <SquareSplitHorizontal />
      </IconButton>
      <IconButton
        v-if="paged"
        :label="double ? '单页显示' : '双页显示'"
        variant="ghost"
        tone="neutral"
        :aria-pressed="double"
        :class="double ? 'text-accent-text' : undefined"
        @click="emit('toggleDouble')"
      >
        <Columns2 />
      </IconButton>
      <IconButton
        label="阅读设置"
        variant="ghost"
        tone="neutral"
        @click="(event: MouseEvent) => emit('settings', event)"
      >
        <Settings2 />
      </IconButton>
      <IconButton
        :label="fullscreen ? '退出全屏' : '全屏'"
        variant="ghost"
        tone="neutral"
        @click="emit('fullscreen')"
      >
        <Minimize v-if="fullscreen" />
        <Maximize v-else />
      </IconButton>
    </template>
  </Flex>
</template>

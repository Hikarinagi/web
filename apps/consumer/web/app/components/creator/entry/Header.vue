<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Tag } from '@hina-ui/vue'
  import { ExternalLink, GitMerge, MoveRight, Split } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { cn } from '~/utils/cn'
  import type { HikariImageSource } from '~/utils/media/image'

  defineOptions({ name: 'CreatorEntryHeader' })
  defineProps<{
    title: string
    type: string
    cover?: HikariImageSource
    portrait?: boolean
    to: string | null
    splittable?: boolean
    movable?: boolean
    readonly?: boolean
  }>()
  defineEmits<{ merge: []; split: []; move: [] }>()
</script>

<template>
  <Inline gap="md" align="start" justify="between" wrap>
    <Inline gap="md" align="center" :wrap="false" class="min-w-0">
      <HikariImage
        v-if="cover"
        :src="cover"
        :alt="title"
        preset="small"
        :class="cn('h-16 shrink-0 overflow-hidden rounded-md bg-inset', portrait ? 'w-12' : 'w-22')"
        :image-class="cn('size-full object-cover', portrait && 'object-top')"
      />
      <Stack gap="xs" class="min-w-0">
        <Heading :level="2" size="xl" lang="ja">{{ title }}</Heading>
        <Inline gap="md" align="center" wrap class="gap-y-1">
          <Tag tone="neutral">{{ type }}</Tag>
          <slot />
        </Inline>
      </Stack>
    </Inline>
    <Inline gap="sm" wrap>
      <Button v-if="to" :as="NuxtLink" :to="to" variant="outline" tone="neutral" size="sm">
        <template #icon><ExternalLink /></template>
        查看条目
      </Button>
      <Button v-if="!readonly" variant="outline" tone="neutral" size="sm" @click="$emit('merge')">
        <template #icon><GitMerge /></template>
        合并
      </Button>
      <Button
        v-if="splittable && !readonly"
        variant="outline"
        tone="neutral"
        size="sm"
        @click="$emit('split')"
      >
        <template #icon><Split /></template>
        拆分
      </Button>
      <Button
        v-if="movable && !readonly"
        variant="outline"
        tone="neutral"
        size="sm"
        @click="$emit('move')"
      >
        <template #icon><MoveRight /></template>
        移动
      </Button>
    </Inline>
  </Inline>
</template>

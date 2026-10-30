<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { ExternalLink, GitMerge, MoveRight, Split } from '@lucide/vue'
  import { NuxtLink } from '#components'

  defineOptions({ name: 'CreatorEntryHeader' })
  defineProps<{
    title: string
    type: string
    meta: string[]
    to: string | null
    splittable?: boolean
    movable?: boolean
  }>()
  defineEmits<{ merge: []; split: []; move: [] }>()
</script>

<template>
  <Inline gap="md" align="start" justify="between" wrap>
    <Stack gap="xs" class="min-w-0">
      <Heading :level="2" size="xl" lang="ja">{{ title }}</Heading>
      <Inline gap="sm" align="center">
        <Tag tone="neutral">{{ type }}</Tag>
        <Text v-for="item in meta" :key="item" as="span" size="sm" tone="muted" lang="ja">
          {{ item }}
        </Text>
      </Inline>
    </Stack>
    <Inline gap="sm">
      <Button variant="outline" tone="neutral" size="sm" @click="$emit('merge')">
        <template #icon><GitMerge /></template>
        合并
      </Button>
      <Button v-if="splittable" variant="outline" tone="neutral" size="sm" @click="$emit('split')">
        <template #icon><Split /></template>
        拆分
      </Button>
      <Button v-if="movable" variant="outline" tone="neutral" size="sm" @click="$emit('move')">
        <template #icon><MoveRight /></template>
        移动
      </Button>
      <Button v-if="to" :as="NuxtLink" :to="to" variant="outline" tone="neutral" size="sm">
        <template #icon><ExternalLink /></template>
        查看条目
      </Button>
    </Inline>
  </Inline>
</template>

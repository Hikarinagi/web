<script setup lang="ts">
  import {
    Button,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DisclosureIcon,
    Empty,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { SquarePen } from '@lucide/vue'
  import { NuxtLink } from '#components'

  defineOptions({ name: 'WorkIntro' })

  withDefaults(
    defineProps<{
      text?: string | null
      original?: string | null
      editTo: string
      size?: 'base' | 'sm'
    }>(),
    { text: null, original: null, size: 'base' },
  )

  const open = ref(false)
</script>

<template>
  <Stack gap="none" :class="size === 'sm' ? 'min-w-0 flex-1 gap-2' : 'min-w-0 flex-1 gap-5'">
    <Text v-if="text" :size="size" class="leading-relaxed wrap-anywhere whitespace-pre-line">
      {{ text }}
    </Text>
    <Empty v-else :size="size === 'sm' ? 'sm' : 'md'" title="暂无简介">
      <template #actions>
        <Button :as="NuxtLink" :to="editTo" target="_blank" size="sm">
          <template #icon><SquarePen /></template>
          我来补充
        </Button>
      </template>
    </Empty>

    <Collapsible v-if="original" v-model:open="open">
      <CollapsibleTrigger as-child>
        <Button variant="link" size="sm">
          <template #trailing><DisclosureIcon /></template>
          {{ open ? '收起日文原文' : '展开日文原文' }}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Text
          :size="size"
          tone="muted"
          class="pt-3 leading-relaxed wrap-anywhere whitespace-pre-line"
        >
          {{ original }}
        </Text>
      </CollapsibleContent>
    </Collapsible>
  </Stack>
</template>

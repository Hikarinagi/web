<script setup lang="ts">
  import {
    Button,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DisclosureIcon,
    Stack,
    Text,
  } from '@hina-ui/vue'

  defineOptions({ name: 'WorkIntro' })

  withDefaults(
    defineProps<{
      text?: string | null
      original?: string | null
      emptyText?: string
      size?: 'base' | 'sm'
    }>(),
    { text: null, original: null, emptyText: undefined, size: 'base' },
  )

  const open = ref(false)
</script>

<template>
  <Stack gap="none" :class="size === 'sm' ? 'min-w-0 flex-1 gap-2' : 'min-w-0 flex-1 gap-5'">
    <Text v-if="text" :size="size" class="leading-relaxed wrap-anywhere whitespace-pre-line">
      {{ text }}
    </Text>
    <Text v-else-if="emptyText" :size="size" tone="muted">{{ emptyText }}</Text>

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

<script setup lang="ts">
  import { Card, Center, Empty, Inline, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import type { CommandMenuItem } from './types'

  defineOptions({ name: 'HikariEditorPluginsCommandMenu' })

  const props = defineProps<{
    items: CommandMenuItem[]
    query: string
    highlighted: number
  }>()
  const emit = defineEmits<{ select: [index: number]; highlight: [index: number] }>()

  const scroller = useTemplateRef<{ viewport: HTMLElement | null }>('scroller')

  watch(
    () => props.highlighted,
    () => {
      nextTick(() => {
        const viewport = scroller.value?.viewport
        const target = viewport?.querySelector(`[data-command-index="${props.highlighted}"]`)
        if (!viewport || !(target instanceof HTMLElement)) return
        const top = target.offsetTop
        const bottom = top + target.offsetHeight
        const padding = 4
        if (top < viewport.scrollTop + padding) viewport.scrollTo({ top: top - padding })
        else if (bottom > viewport.scrollTop + viewport.clientHeight - padding)
          viewport.scrollTo({ top: bottom - viewport.clientHeight + padding })
      })
    },
  )
</script>

<template>
  <Center v-if="!items.length" class="w-80 px-3 py-4">
    <Empty size="sm" :title="query ? '没有匹配命令' : '输入命令名称'" />
  </Center>

  <ScrollArea v-else ref="scroller" class="max-h-80 w-80">
    <Stack gap="none" class="p-1">
      <Card
        v-for="(item, index) in items"
        :key="item.id"
        as="button"
        type="button"
        :padded="false"
        :data-command-index="index"
        :class="
          cn(
            'hn-state-layer flex w-full hn-interactive items-center gap-2.5 hn-press-none',
            'rounded-md border-0 px-2.5 py-2 text-start shadow-none',
            index === highlighted ? 'bg-accent-soft text-accent-text' : 'bg-transparent',
          )
        "
        @mousedown.prevent
        @click="emit('select', index)"
        @mouseenter="emit('highlight', index)"
      >
        <component :is="item.icon" class="size-4 shrink-0 text-muted" aria-hidden="true" />

        <Stack gap="none" class="min-w-0 flex-1">
          <Inline :wrap="false" gap="sm" align="center" justify="between" class="min-w-0">
            <Text as="span" size="sm" weight="medium" truncate class="min-w-0">
              {{ item.label }}
            </Text>
            <Text as="span" size="xs" tone="muted" class="shrink-0 font-mono">
              {{ item.command }}
            </Text>
          </Inline>
          <Text as="span" size="xs" tone="muted" truncate>
            {{ item.description }}
          </Text>
        </Stack>
      </Card>
    </Stack>
  </ScrollArea>
</template>

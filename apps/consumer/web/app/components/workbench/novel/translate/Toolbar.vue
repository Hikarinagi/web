<script setup lang="ts">
  import {
    Button,
    DropdownMenu,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    IconButton,
    Inline,
    SegmentedControl,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { BookOpenText, ChevronDown } from '@lucide/vue'
  import { useMediaQuery } from '@vueuse/core'
  import type { SegmentFilter } from '~/features/workbench/composables/useTranslationEditor'

  const props = defineProps<{
    title: string
    done: number
    total: number
    filters: { value: SegmentFilter; label: string }[]
    reference: boolean
  }>()
  const filter = defineModel<SegmentFilter>('filter', { required: true })
  const emit = defineEmits<{ reference: [] }>()

  const roomy = useMediaQuery('(min-width: 768px)', { ssrWidth: 1440 })
  const current = computed(() => props.filters.find(item => item.value === filter.value)?.label)
</script>

<template>
  <Inline
    v-if="roomy"
    gap="md"
    align="center"
    class="min-h-11 shrink-0 gap-y-1.5 border-b border-line px-5 py-1.5"
  >
    <Text weight="semibold" truncate class="min-w-32 flex-1">{{ title }}</Text>
    <Text size="xs" tone="muted" class="shrink-0 tabular-nums">
      已翻译 {{ done }} / {{ total }} 段
    </Text>
    <Inline gap="xs" align="center" :wrap="false" class="shrink-0">
      <SegmentedControl v-model="filter" :options="filters" size="sm" aria-label="段落筛选" />
      <IconButton
        v-if="reference"
        label="参考资料"
        size="sm"
        variant="ghost"
        tone="neutral"
        @click="emit('reference')"
      >
        <BookOpenText />
      </IconButton>
    </Inline>
  </Inline>
  <Inline
    v-else
    gap="sm"
    align="center"
    :wrap="false"
    class="min-h-12 shrink-0 border-b border-line py-1.5 pr-2 pl-4"
  >
    <Stack gap="none" class="min-w-0 flex-1">
      <Text size="sm" weight="semibold" truncate>{{ title }}</Text>
      <Text size="xs" tone="muted" class="tabular-nums">已翻译 {{ done }} / {{ total }} 段</Text>
    </Stack>
    <DropdownMenu label="段落筛选" align="end">
      <Button size="sm" variant="outline" tone="neutral" class="max-w-40 shrink-0">
        <Text as="span" size="sm" truncate>{{ current }}</Text>
        <template #trailing><ChevronDown /></template>
      </Button>
      <template #content>
        <DropdownMenuRadioGroup v-model="filter">
          <DropdownMenuRadioItem v-for="item in filters" :key="item.value" :value="item.value">
            {{ item.label }}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </template>
    </DropdownMenu>
    <IconButton
      v-if="reference"
      label="参考资料"
      size="sm"
      variant="ghost"
      tone="neutral"
      @click="emit('reference')"
    >
      <BookOpenText />
    </IconButton>
  </Inline>
</template>

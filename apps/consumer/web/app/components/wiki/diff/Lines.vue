<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
  import { lineDiff } from '~/features/wiki/diff'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiDiffLines' })

  const props = defineProps<{ before: string; after: string }>()
  const lines = computed(() => lineDiff(props.before, props.after))
  const TONES = {
    same: 'text-muted',
    removed: 'bg-danger-soft line-through',
    added: 'bg-success-soft',
  }
</script>

<template>
  <Stack gap="none" class="overflow-hidden rounded-md border border-line">
    <template v-for="(line, index) in lines" :key="index">
      <Text v-if="line.kind === 'gap'" size="xs" tone="muted" class="bg-subtle px-2 py-1">
        未改动 {{ line.count }} 行
      </Text>
      <Text v-else size="sm" :class="cn('px-2 py-0.5 whitespace-pre-wrap', TONES[line.kind])">
        {{ line.text || ' ' }}
      </Text>
    </template>
  </Stack>
</template>

<script setup lang="ts">
  import { Chip, IconButton as HnIconButton, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { ThumbsDown } from '@lucide/vue'
  import type { WorkTagsControl } from '~/features/entry/useWorkTags'

  defineOptions({ name: 'EntryTagsRows' })
  const props = defineProps<{ control: WorkTagsControl }>()

  const proposed = computed(() => props.control.all.value.filter(tag => tag.proposed))
</script>

<template>
  <Stack gap="none">
    <Inline
      v-for="tag in control.all.value"
      :key="tag.id"
      gap="sm"
      align="center"
      :wrap="false"
      class="border-b border-line py-2 last:border-b-0"
    >
      <Inline gap="sm" align="center" :wrap="false" class="min-w-0 flex-1">
        <Text weight="medium" truncate>{{ tag.name }}</Text>
        <Tag v-if="tag.proposed">仅你可见</Tag>
      </Inline>
      <Text size="sm" tone="muted" class="w-6 text-right tabular-nums">{{ tag.likes }}</Text>
      <Chip selectable :selected="tag.mine === 1" size="sm" @update:selected="control.vote(tag, 1)">
        符合
      </Chip>
      <HnIconButton
        label="不符合"
        size="sm"
        :variant="tag.mine === -1 ? 'soft' : 'ghost'"
        :tone="tag.mine === -1 ? 'danger' : 'neutral'"
        :aria-pressed="tag.mine === -1"
        :disabled="tag.proposed"
        @click="control.vote(tag, -1)"
      >
        <ThumbsDown />
      </HnIconButton>
    </Inline>
  </Stack>
  <Text v-for="tag in proposed" :key="tag.id" size="sm" tone="muted">
    「{{ tag.name }}」仅你可见。再有 2 位成员使用后，将对所有人可见。
  </Text>
</template>

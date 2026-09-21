<script setup lang="ts">
  import { Card, Checkbox, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import type {
    BackfillField,
    BackfillItem,
  } from '~/features/creator/composables/useEntityBackfill'
  import { cn } from '~/utils/cn'

  defineProps<{
    item: BackfillItem
    running: boolean
  }>()

  const STATUS: Record<string, string> = {
    loading: '对比中…',
    blocked: '他人审核中',
    error: '对比失败',
    staged: '已暂存',
  }

  const STATUS_TONE: Record<string, 'success' | 'danger' | 'neutral'> = {
    staged: 'success',
    error: 'danger',
  }

  const TARGET_LABEL: Record<string, string> = {
    person: '人物',
    character: '角色',
    producer: '厂商',
  }

  function opOf(field: BackfillField): Record<string, unknown> {
    if (field.coverUrl) {
      return {
        kind: 'scalar',
        field: field.field,
        value_type: 'media',
        from: null,
        to: { id: 0, src: field.coverUrl },
      }
    }
    return field.op ?? {}
  }
</script>

<template>
  <Card :padded="false" :class="cn('min-w-0', item.status === 'staged' && 'opacity-60')">
    <Stack gap="sm" class="p-2.5">
      <Inline gap="sm" align="center" :wrap="false">
        <HikariImage
          :src="item.cover ?? ''"
          alt=""
          preset="small"
          class="size-10 shrink-0 rounded bg-subtle"
          image-class="size-full object-cover object-top"
        >
          <template #empty />
          <template #error />
        </HikariImage>

        <Stack gap="none" class="min-w-0 flex-1">
          <Inline gap="xs" align="center">
            <Text as="span" size="sm" weight="medium" truncate class="min-w-0">
              {{ item.name }}
            </Text>
            <Tag size="sm" tone="neutral">{{ TARGET_LABEL[item.target] }}</Tag>
            <Tag v-if="item.pairName" size="sm" tone="neutral">外部源：{{ item.pairName }}</Tag>
          </Inline>
          <Text as="span" size="xs" tone="muted" class="font-mono">#{{ item.id }}</Text>
        </Stack>

        <Tag
          v-if="item.status !== 'ready'"
          size="sm"
          :tone="STATUS_TONE[item.status] ?? 'neutral'"
          class="shrink-0"
        >
          {{ STATUS[item.status] }}
        </Tag>
      </Inline>

      <Stack v-if="item.status === 'ready'" gap="sm" class="pl-13">
        <Inline
          v-for="field in item.fields"
          :key="field.field"
          gap="sm"
          align="start"
          :wrap="false"
        >
          <Checkbox
            v-model="field.checked"
            :disabled="running"
            :aria-label="field.label"
            class="mt-3 shrink-0"
          />
          <CreatorChangesetFieldDiff
            :op="opOf(field)"
            :label="field.label"
            class="min-w-0 flex-1"
          />
        </Inline>
      </Stack>
    </Stack>
  </Card>
</template>

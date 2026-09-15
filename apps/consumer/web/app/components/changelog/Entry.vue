<script setup lang="ts">
  import { Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { TimeFormatEnum, datePartFormat } from '~/utils/time-format'

  defineOptions({ name: 'ChangelogEntry' })

  defineProps<{
    version: string
    releasedAt: string
    sections: { type: string; items: { scope: string; text: string }[] }[]
  }>()

  type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

  const LABELS: Record<string, { text: string; tone: Tone; solid?: boolean }> = {
    added: { text: '新增', tone: 'success' },
    changed: { text: '优化', tone: 'info' },
    deprecated: { text: '已弃用', tone: 'neutral' },
    removed: { text: '移除', tone: 'danger' },
    fixed: { text: '修复', tone: 'warning' },
    security: { text: '安全', tone: 'neutral', solid: true },
  }
</script>

<template>
  <Stack gap="md" class="pb-6">
    <Inline gap="sm" align="baseline">
      <Tag pill class="tabular-nums">{{ version }}</Tag>
      <Text as="span" size="xs" tone="muted">
        {{ datePartFormat(releasedAt, TimeFormatEnum.YYYY_M_D_CN) }}
      </Text>
    </Inline>

    <Stack v-for="section in sections" :key="section.type" gap="xs">
      <Tag
        v-if="LABELS[section.type]"
        :tone="LABELS[section.type]!.tone"
        :variant="LABELS[section.type]!.solid ? 'solid' : 'soft'"
        class="w-fit"
      >
        {{ LABELS[section.type]!.text }}
      </Tag>
      <Stack as="ul" gap="xs">
        <Inline v-for="(item, index) in section.items" :key="index" as="li" gap="sm" align="start">
          <Text as="span" size="sm" weight="medium" tone="muted" class="shrink-0">
            {{ item.scope }}
          </Text>
          <Text as="span" size="sm">{{ item.text }}</Text>
        </Inline>
      </Stack>
    </Stack>
  </Stack>
</template>

<script setup lang="ts">
  import {
    Button,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Heading,
    Inline,
    Popover,
    Progress,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { TRANSLATION_QUALITY_LABEL } from '~/features/workbench/labels'

  const props = defineProps<{
    done: number
    total: number
    unit: string
    noun: string
    machine: number
    assisted: number
    threshold: number
    extra?: { label: string; value: string }[]
  }>()

  const label = computed(() => {
    if (!props.done) return null
    if (props.machine * 100 >= props.done * props.threshold)
      return TRANSLATION_QUALITY_LABEL.MACHINE
    return props.machine + props.assisted
      ? TRANSLATION_QUALITY_LABEL.MACHINE_EDITED
      : TRANSLATION_QUALITY_LABEL.HUMAN
  })
  const ratio = computed(() => (props.done ? Math.round((props.machine * 100) / props.done) : 0))
</script>

<template>
  <Popover align="end">
    <Button size="sm" variant="ghost" tone="neutral" aria-label="翻译进度" class="shrink-0">
      <Inline gap="sm" align="center" :wrap="false">
        <Progress :value="done" :max="Math.max(total, 1)" size="sm" class="w-20" />
        <Text as="span" size="xs" tone="muted" class="tabular-nums">
          {{ done }} / {{ total }} {{ unit }}
        </Text>
      </Inline>
    </Button>
    <template #content>
      <Stack gap="md" class="w-72">
        <Heading :level="4" size="sm">翻译进度</Heading>
        <DescriptionList>
          <DescriptionTerm>已翻译</DescriptionTerm>
          <DescriptionDetails class="tabular-nums">{{ done }} {{ unit }}</DescriptionDetails>
          <DescriptionTerm>未翻译</DescriptionTerm>
          <DescriptionDetails class="tabular-nums"
            >{{ total - done }} {{ unit }}</DescriptionDetails
          >
          <template v-for="row in extra" :key="row.label">
            <DescriptionTerm>{{ row.label }}</DescriptionTerm>
            <DescriptionDetails class="tabular-nums">{{ row.value }}</DescriptionDetails>
          </template>
          <DescriptionTerm>未经修改的 AI 翻译</DescriptionTerm>
          <DescriptionDetails class="tabular-nums"
            >已翻译{{ noun }}的 {{ ratio }}%</DescriptionDetails
          >
          <DescriptionTerm>发布标签</DescriptionTerm>
          <DescriptionDetails>{{ label ?? '—' }}</DescriptionDetails>
        </DescriptionList>
        <Text size="xs" tone="muted">
          当未经修改的 AI 翻译占翻译内容的 {{ threshold }}% 或更多时，发布标签为“{{
            TRANSLATION_QUALITY_LABEL.MACHINE
          }}”。如果使用了 AI 翻译但经过编辑，则发布标签为“{{
            TRANSLATION_QUALITY_LABEL.MACHINE_EDITED
          }}”。否则发布标签为“{{ TRANSLATION_QUALITY_LABEL.HUMAN }}”。
        </Text>
      </Stack>
    </template>
  </Popover>
</template>

<script setup lang="ts">
  import {
    Heading,
    Inline,
    List,
    ListItem,
    Panel,
    SegmentedControl,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { useContentLimit } from '~/features/space/useContentLimit'
  import type { ContentLimit, ContentLimits } from '~/utils/media/image'
  import { CONTENT_LIMIT_ORDER, RATING_LABELS } from '~/utils/media/image'

  defineOptions({ name: 'SpaceSettingContentLimitPanel' })

  const props = defineProps<{ limits: ContentLimits }>()

  const { selected, saving, save } = useContentLimit(props.limits)

  const OPTIONS: { value: ContentLimit; label: string }[] = [
    { value: 'JUST_SHOW', label: '直接显示' },
    { value: 'SHOW_WITH_SPOILER', label: '模糊' },
    { value: 'NEVER_SHOW_NSFW_CONTENT', label: '不显示' },
  ]

  const GROUPS = (['sexual', 'violence'] as const).map(kind => ({
    kind,
    title: kind === 'sexual' ? '成人内容' : '血腥暴力',
    levels: ([1, 2] as const).map(level => ({
      level,
      label: RATING_LABELS[kind][level],
      field: `${kind}_${level}_limit` as const,
    })),
  }))

  function options(kind: 'sexual' | 'violence', level: 1 | 2) {
    if (level === 1) return OPTIONS
    const lower = CONTENT_LIMIT_ORDER.indexOf(selected.value[`${kind}_1_limit`])
    return OPTIONS.map(option => ({
      ...option,
      disabled: CONTENT_LIMIT_ORDER.indexOf(option.value) > lower,
    }))
  }

  function onSelect(kind: 'sexual' | 'violence', level: 1 | 2, value: string | number | undefined) {
    const next = OPTIONS.find(option => option.value === value)?.value
    if (next) void save(kind, level, next)
  }
</script>

<template>
  <Panel title="图片显示">
    <template #actions>
      <Question title="图片显示" aria-label="查看图片显示说明">
        <List>
          <ListItem>成人内容：轻度为裸露，重度为性爱场景。</ListItem>
          <ListItem>血腥暴力：轻度为不写实的打斗与流血，重度为写实或残忍的暴力。</ListItem>
          <ListItem>设为「模糊」的图片，点开后可以查看；设为「不显示」的图片无法点开。</ListItem>
          <ListItem>分级为「无」的图片总是直接显示。</ListItem>
          <ListItem>
            未分级的图片和标为 NSFW 的作品，按「成人内容：重度」处理；该项设为「不显示」时，NSFW
            作品不出现在列表、搜索与动态中。
          </ListItem>
          <ListItem>同一类中，高一档的处理不能比低一档宽松。</ListItem>
        </List>
      </Question>
    </template>

    <Stack gap="lg">
      <Stack v-for="group in GROUPS" :key="group.kind" gap="sm">
        <Heading :level="3" size="sm" weight="medium">{{ group.title }}</Heading>
        <Inline
          v-for="row in group.levels"
          :key="row.field"
          justify="between"
          align="center"
          gap="sm"
        >
          <Text size="sm">{{ row.label }}</Text>
          <SegmentedControl
            :model-value="selected[row.field]"
            :options="options(group.kind, row.level)"
            :disabled="saving"
            size="sm"
            :aria-label="`${group.title}：${row.label}`"
            @update:model-value="value => onSelect(group.kind, row.level, value)"
          />
        </Inline>
      </Stack>
    </Stack>
  </Panel>
</template>

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
  import { CONTENT_LIMIT_ORDER } from '~/utils/media/image'

  defineOptions({ name: 'SpaceSettingContentLimitPanel' })

  const props = defineProps<{ limits: ContentLimits }>()

  const { t } = useLocaleText()
  const { selected, saving, save } = useContentLimit(props.limits)

  const VALUES: ContentLimit[] = ['JUST_SHOW', 'SHOW_WITH_SPOILER', 'NEVER_SHOW_NSFW_CONTENT']
  const RULES = ['sexual', 'violence', 'blur', 'none', 'unrated', 'nsfw', 'order'] as const

  const groups = computed(() =>
    (['sexual', 'violence'] as const).map(kind => ({
      kind,
      title: t(`setting.contentLimit.${kind}`),
      levels: ([1, 2] as const).map(level => ({
        level,
        label: t(
          level === 1 ? 'setting.contentLimit.levels.mild' : 'setting.contentLimit.levels.severe',
        ),
        field: `${kind}_${level}_limit` as const,
      })),
    })),
  )

  function options(kind: 'sexual' | 'violence', level: 1 | 2) {
    const lower = CONTENT_LIMIT_ORDER.indexOf(selected.value[`${kind}_1_limit`])
    return VALUES.map(value => ({
      value,
      label: t(`setting.contentLimit.options.${value}`),
      disabled: level === 2 && CONTENT_LIMIT_ORDER.indexOf(value) > lower,
    }))
  }

  function onSelect(kind: 'sexual' | 'violence', level: 1 | 2, value: string | number | undefined) {
    const next = VALUES.find(option => option === value)
    if (next) void save(kind, level, next)
  }
</script>

<template>
  <Panel :title="t('setting.contentLimit.title')">
    <template #actions>
      <Question
        :title="t('setting.contentLimit.title')"
        :aria-label="t('setting.contentLimit.help')"
      >
        <List>
          <ListItem v-for="rule in RULES" :key="rule">
            {{ t(`setting.contentLimit.rules.${rule}`) }}
          </ListItem>
        </List>
      </Question>
    </template>

    <Stack gap="lg">
      <Stack v-for="group in groups" :key="group.kind" gap="sm">
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
            :aria-label="t('setting.contentLimit.field', { group: group.title, level: row.label })"
            @update:model-value="value => onSelect(group.kind, row.level, value)"
          />
        </Inline>
      </Stack>
    </Stack>
  </Panel>
</template>

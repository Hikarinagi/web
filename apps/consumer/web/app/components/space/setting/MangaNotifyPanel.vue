<script setup lang="ts">
  import { MultiSelect, Panel, Stack, Switch, Text } from '@hina-ui/vue'
  import { useMangaNotify } from '~/features/space/useMangaNotify'
  import type { NotificationPageData } from '~~/server/api/pages/setting/notification.get'

  defineOptions({ name: 'SpaceSettingMangaNotifyPanel' })

  const props = defineProps<{ manga: NotificationPageData['manga'] }>()

  const { setting, saving, save } = useMangaNotify(props.manga)

  const SOURCES = [
    { key: 'on_progress', label: '我读过的作品', desc: '任何我打开过、有阅读进度的作品' },
    { key: 'on_status', label: '我标记过状态的作品', desc: '按下面选中的状态筛选' },
    { key: 'on_favorite', label: '我收藏的作品', desc: '加入过收藏夹的作品' },
  ] as const

  type MangaStatus = (typeof setting)['value']['statuses'][number]

  const STATUS_OPTIONS: { value: MangaStatus; label: string }[] = [
    { value: 'GOING', label: '在看' },
    { value: 'PLAN', label: '想看' },
    { value: 'COMPLETED', label: '看过' },
    { value: 'ON_HOLD', label: '搁置' },
    { value: 'DROPPED', label: '弃坑' },
  ]

  function onEnabled(value: boolean) {
    setting.value.enabled = value
    save({ enabled: value })
  }

  function onSource(key: (typeof SOURCES)[number]['key'], value: boolean) {
    setting.value[key] = value
    save({ [key]: value })
  }

  function onStatuses(value: Array<string | number>) {
    const next = STATUS_OPTIONS.filter(option => value.includes(option.value)).map(
      option => option.value,
    )
    setting.value.statuses = next
    save({ statuses: next })
  }
</script>

<template>
  <Stack gap="md">
    <Panel title="追更提醒" description="关注的漫画有新章节时，给你发一条站内通知">
      <Stack gap="sm">
        <Switch
          :model-value="setting.enabled"
          description="关闭后不再收到任何漫画更新通知"
          control-placement="end"
          block
          :disabled="saving"
          @update:model-value="onEnabled"
        >
          接收追更提醒
        </Switch>

        <Switch
          v-for="source in SOURCES"
          :key="source.key"
          :model-value="setting[source.key]"
          :description="source.desc"
          control-placement="end"
          block
          :disabled="saving || !setting.enabled"
          @update:model-value="value => onSource(source.key, value)"
        >
          {{ source.label }}
        </Switch>
      </Stack>
    </Panel>

    <Panel title="按状态筛选" description="只有被标成这些状态的作品才会触发提醒">
      <Stack gap="sm">
        <MultiSelect
          :model-value="setting.statuses"
          :options="STATUS_OPTIONS"
          placeholder="不按状态提醒"
          aria-label="触发提醒的状态"
          class="w-full"
          :disabled="saving || !setting.enabled || !setting.on_status"
          @update:model-value="onStatuses"
        />
        <Text size="xs" tone="muted">
          连载中的作品被标为「看过」通常意味着已追平，所以默认也会提醒。
        </Text>
      </Stack>
    </Panel>
  </Stack>
</template>

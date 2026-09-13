<script setup lang="ts">
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

  const STATUS_OPTIONS = [
    { value: 'GOING', label: '在看' },
    { value: 'PLAN', label: '想看' },
    { value: 'COMPLETED', label: '看过' },
    { value: 'ON_HOLD', label: '搁置' },
    { value: 'DROPPED', label: '弃坑' },
  ]
</script>

<template>
  <div class="flex flex-col gap-5">
    <CardPanel title="追更提醒" description="关注的漫画有新章节时，给你发一条站内通知">
      <div class="flex flex-col gap-2.5">
        <label
          class="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-surface-200 p-4 dark:border-surface-700"
        >
          <div class="min-w-0">
            <p class="text-sm font-medium text-color">接收追更提醒</p>
            <p class="mt-0.5 text-xs text-muted-color">关闭后不再收到任何漫画更新通知</p>
          </div>
          <ToggleSwitch
            v-model="setting.enabled"
            class="shrink-0"
            :disabled="saving"
            @change="save({ enabled: setting.enabled })"
          />
        </label>

        <label
          v-for="source in SOURCES"
          :key="source.key"
          class="flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors"
          :class="
            setting.enabled
              ? 'cursor-pointer border-surface-200 dark:border-surface-700'
              : 'cursor-not-allowed border-surface-200 opacity-55 dark:border-surface-700'
          "
        >
          <div class="min-w-0">
            <p class="text-sm font-medium text-color">{{ source.label }}</p>
            <p class="mt-0.5 text-xs text-muted-color">{{ source.desc }}</p>
          </div>
          <ToggleSwitch
            v-model="setting[source.key]"
            class="shrink-0"
            :disabled="saving || !setting.enabled"
            @change="save({ [source.key]: setting[source.key] })"
          />
        </label>
      </div>
    </CardPanel>

    <CardPanel title="按状态筛选" description="只有被标成这些状态的作品才会触发提醒">
      <MultiSelect
        v-model="setting.statuses"
        :options="STATUS_OPTIONS"
        option-label="label"
        option-value="value"
        display="chip"
        placeholder="不按状态提醒"
        class="w-full"
        :show-toggle-all="false"
        :disabled="saving || !setting.enabled || !setting.on_status"
        @change="save({ statuses: setting.statuses })"
      />
      <p class="mt-2 text-xs text-muted-color">
        连载中的作品被标为「看过」通常意味着已追平，所以默认也会提醒。
      </p>
    </CardPanel>
  </div>
</template>

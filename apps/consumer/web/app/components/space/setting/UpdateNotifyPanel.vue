<script setup lang="ts">
  import { MultiSelect, Panel, Stack, Switch, Text } from '@hina-ui/vue'
  import { useUpdateNotify, type UpdateNotifySetting } from '~/features/space/useUpdateNotify'

  defineOptions({ name: 'SpaceSettingUpdateNotifyPanel' })

  const props = defineProps<{ kind: 'manga' | 'novel'; initial: UpdateNotifySetting }>()

  const { t } = useLocaleText()
  const { setting, saving, save } = useUpdateNotify(props.kind, props.initial)

  const SOURCES = ['on_progress', 'on_status', 'on_favorite'] as const
  const STATUSES = ['GOING', 'PLAN', 'COMPLETED', 'ON_HOLD', 'DROPPED'] as const

  const statusOptions = computed(() =>
    STATUSES.map(value => ({ value, label: t(`setting.notify.statuses.${value}`) })),
  )

  function onEnabled(value: boolean) {
    setting.value.enabled = value
    save({ enabled: value })
  }

  function onSource(key: (typeof SOURCES)[number], value: boolean) {
    setting.value[key] = value
    save({ [key]: value })
  }

  function onStatuses(value: Array<string | number>) {
    const next = STATUSES.filter(status => value.includes(status))
    setting.value.statuses = [...next]
    save({ statuses: [...next] })
  }
</script>

<template>
  <Panel
    :title="t(`setting.notify.${kind}.title`)"
    :description="t(`setting.notify.${kind}.description`)"
  >
    <Stack gap="sm">
      <Switch
        :model-value="setting.enabled"
        :description="t(`setting.notify.${kind}.off`)"
        control-placement="end"
        block
        :disabled="saving"
        @update:model-value="onEnabled"
      >
        {{ t('setting.notify.enabled') }}
      </Switch>
      <Switch
        v-for="source in SOURCES"
        :key="source"
        :model-value="setting[source]"
        :description="t(`setting.notify.sources.${source}.description`)"
        control-placement="end"
        block
        :disabled="saving || !setting.enabled"
        @update:model-value="value => onSource(source, value)"
      >
        {{ t(`setting.notify.sources.${source}.label`) }}
      </Switch>
      <MultiSelect
        :model-value="setting.statuses"
        :options="statusOptions"
        :placeholder="t('setting.notify.statusPlaceholder')"
        :aria-label="t('setting.notify.statusLabel')"
        class="w-full"
        :disabled="saving || !setting.enabled || !setting.on_status"
        @update:model-value="onStatuses"
      />
      <Text size="xs" tone="muted">{{ t('setting.notify.statusHint') }}</Text>
    </Stack>
  </Panel>
</template>

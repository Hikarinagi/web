<script setup lang="ts">
  import { Panel, Stack, Switch } from '@hina-ui/vue'
  import { useOtomeGate } from '~/features/space/useOtomeGate'
  import type { ContentLimits } from '~/utils/media/image'

  defineOptions({ name: 'SpaceSettingPreferencePanel' })

  const props = defineProps<{
    limits: ContentLimits
    hideOtome: boolean
  }>()

  const { t } = useLocaleText()
  const {
    enabled: otomeHidden,
    saving: otomeSaving,
    save: saveOtome,
  } = useOtomeGate(props.hideOtome)

  function onOtome(value: boolean) {
    otomeHidden.value = value
    saveOtome(value)
  }
</script>

<template>
  <Stack gap="lg">
    <SpaceSettingContentLimitPanel :limits="limits" />

    <Panel :title="t('setting.otome.title')" :description="t('setting.otome.description')">
      <Switch
        :model-value="otomeHidden"
        :description="t('setting.otome.hint')"
        control-placement="end"
        block
        :disabled="otomeSaving"
        @update:model-value="onOtome"
      >
        {{ t('setting.otome.toggle') }}
      </Switch>
    </Panel>
  </Stack>
</template>

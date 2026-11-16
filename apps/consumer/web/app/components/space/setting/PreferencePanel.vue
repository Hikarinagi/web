<script setup lang="ts">
  import { Panel, Stack, Switch } from '@hina-ui/vue'
  import { useOtomeGate } from '~/features/space/useOtomeGate'
  import type { ContentLimits } from '~/utils/media/image'

  defineOptions({ name: 'SpaceSettingPreferencePanel' })

  const props = defineProps<{
    limits: ContentLimits
    hideOtome: boolean
  }>()

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

    <Panel title="乙女 / BL 内容" description="在浏览、图鉴、首页与社区动态中隐藏乙女 / BL 作品">
      <Switch
        :model-value="otomeHidden"
        description="隐藏Tag中包含“乙女”或者“BL”关键词的条目。因为是通过关键词筛选，可能会存在少量误伤。"
        control-placement="end"
        block
        :disabled="otomeSaving"
        @update:model-value="onOtome"
      >
        隐藏乙女 / BL 作品
      </Switch>
    </Panel>
  </Stack>
</template>

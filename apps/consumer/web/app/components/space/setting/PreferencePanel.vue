<script setup lang="ts">
  import { Panel, RadioGroup, Stack, Switch } from '@hina-ui/vue'
  import {
    JUST_SHOW_NSFW,
    NEVER_SHOW_NSFW,
    SHOW_NSFW_WITH_SPOILER,
  } from '~/features/nsfw/composables/useNsfwPolicy'
  import { useContentLimit } from '~/features/space/useContentLimit'
  import { useOtomeGate } from '~/features/space/useOtomeGate'
  import type { CurrentUser } from '~/types/auth'

  defineOptions({ name: 'SpaceSettingPreferencePanel' })

  const props = defineProps<{
    contentLimit: CurrentUser['content_limit']
    hideOtome: boolean
  }>()

  const { selected, saving, save } = useContentLimit(props.contentLimit)
  const {
    enabled: otomeHidden,
    saving: otomeSaving,
    save: saveOtome,
  } = useOtomeGate(props.hideOtome)

  const OPTIONS = [
    {
      value: NEVER_SHOW_NSFW,
      label: '隐藏成人内容',
      description: '不展示 NSFW / 限制级内容',
    },
    {
      value: SHOW_NSFW_WITH_SPOILER,
      label: '模糊展示',
      description: '展示 NSFW 条目，但图片会模糊处理',
    },
    { value: JUST_SHOW_NSFW, label: '直接展示', description: '正常展示所有内容' },
  ]

  function onSelect(value: string | number | null | undefined) {
    const next = OPTIONS.find(option => option.value === value)?.value
    if (!next) return
    selected.value = next
    save(next)
  }

  function onOtome(value: boolean) {
    otomeHidden.value = value
    saveOtome(value)
  }
</script>

<template>
  <Stack gap="md">
    <Panel title="内容偏好" description="控制成人 / 限制级(NSFW)内容的展示方式">
      <RadioGroup
        :model-value="selected"
        :options="OPTIONS"
        :disabled="saving"
        block
        aria-label="内容显示等级"
        @update:model-value="onSelect"
      />
    </Panel>

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

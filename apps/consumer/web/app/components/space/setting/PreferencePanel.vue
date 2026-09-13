<script setup lang="ts">
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
    { value: NEVER_SHOW_NSFW, label: '隐藏成人内容', desc: '不展示 NSFW / 限制级内容' },
    { value: SHOW_NSFW_WITH_SPOILER, label: '模糊展示', desc: '展示 NSFW 条目，但图片会模糊处理' },
    { value: JUST_SHOW_NSFW, label: '直接展示', desc: '正常展示所有内容' },
  ]
</script>

<template>
  <div class="flex flex-col gap-5">
    <CardPanel title="内容偏好" description="控制成人 / 限制级(NSFW)内容的展示方式">
      <div class="flex flex-col gap-2.5">
        <label
          v-for="opt in OPTIONS"
          :key="opt.value"
          class="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors"
          :class="
            selected === opt.value
              ? 'border-primary bg-primary/5'
              : 'border-surface-200 hover:border-surface-300 dark:border-surface-700 dark:hover:border-surface-600'
          "
        >
          <RadioButton
            v-model="selected"
            :value="opt.value"
            :input-id="opt.value"
            :disabled="saving"
            @change="save(opt.value)"
          />
          <div class="min-w-0">
            <p class="text-sm font-medium text-color">{{ opt.label }}</p>
            <p class="mt-0.5 text-xs text-muted-color">{{ opt.desc }}</p>
          </div>
        </label>
      </div>
    </CardPanel>

    <CardPanel
      title="乙女 / BL 内容"
      description="在浏览、图鉴、首页与社区动态中隐藏乙女 / BL 作品"
    >
      <label
        class="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-surface-200 p-4 dark:border-surface-700"
      >
        <div class="min-w-0">
          <p class="text-sm font-medium text-color">隐藏乙女 / BL 作品</p>
          <p class="mt-0.5 text-xs text-muted-color">
            隐藏Tag中包含“乙女”或者“BL”关键词的条目。因为是通过关键词筛选，可能会存在少量误伤。
          </p>
        </div>
        <ToggleSwitch
          v-model="otomeHidden"
          class="shrink-0"
          :disabled="otomeSaving"
          @change="saveOtome(otomeHidden)"
        />
      </label>
    </CardPanel>
  </div>
</template>

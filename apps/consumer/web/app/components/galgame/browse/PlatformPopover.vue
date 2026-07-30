<script setup lang="ts">
  import {
    PLATFORM_DEEMPHASIZED,
    PLATFORM_GROUPS,
    type PlatformCode,
    platformLabel,
  } from '~/features/galgame/platforms'

  defineOptions({ name: 'GalgameBrowsePlatformPopover' })
  const model = defineModel<string[]>({ default: () => [] })

  interface PlatformOption {
    value: PlatformCode
    label: string
  }

  const platformGroups = PLATFORM_GROUPS.map(group => ({
    label: group.label,
    items: group.codes.map(code => ({ value: code, label: platformLabel(code) })),
  }))
</script>

<template>
  <MultiSelect
    v-model="model"
    :options="platformGroups"
    option-label="label"
    option-value="value"
    option-group-label="label"
    option-group-children="items"
    data-key="value"
    placeholder="平台"
    size="small"
    :max-selected-labels="0"
    selected-items-label="平台 ({0})"
    :show-toggle-all="false"
    overlay-class="w-64"
    class="w-32"
  >
    <template #option="{ option }: { option: PlatformOption }">
      <span
        :class="[
          'flex w-full min-w-0 items-center gap-2',
          PLATFORM_DEEMPHASIZED.has(option.value) && 'opacity-55',
        ]"
      >
        <span class="truncate">{{ option.label }}</span>
        <span
          v-if="PLATFORM_DEEMPHASIZED.has(option.value)"
          class="ml-auto shrink-0 text-[10px] text-surface-400 dark:text-surface-500"
        >
          96%，通常不必勾
        </span>
      </span>
    </template>
    <template #optiongroup="{ option }">
      <span class="text-xs font-medium text-surface-500 dark:text-surface-400">
        {{ option.label }}
      </span>
    </template>
  </MultiSelect>
</template>

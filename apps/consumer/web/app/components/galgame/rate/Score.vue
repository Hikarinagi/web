<script setup lang="ts">
  defineOptions({ name: 'GalgameRateScore' })
</script>

<template>
  <FormItem v-slot="{ field }" name="rate" label="评分">
    <div class="flex flex-col gap-2">
      <Slider
        :model-value="(field.value as number | null) ?? 0"
        :min="0"
        :max="10"
        :step="1"
        @update:model-value="value => field.props.onInput({ value: value === 0 ? null : value })"
      />
      <div class="flex items-center gap-2 text-[11px] text-surface-400">
        <span>0</span>
        <span class="flex-1" />
        <span
          class="rounded-md bg-hikari-primary-50 px-2.5 py-0.5 text-sm font-semibold text-hikari-primary-800 tabular-nums dark:bg-hikari-primary-950 dark:text-hikari-primary-300"
        >
          {{ field.value == null ? '未评分' : (field.value as number).toFixed(1) }}
        </span>
        <span class="flex-1" />
        <span>10</span>
      </div>
    </div>
  </FormItem>
</template>

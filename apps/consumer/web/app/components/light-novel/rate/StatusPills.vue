<script setup lang="ts">
  defineOptions({ name: 'LightNovelRateStatusPills' })

  const STATUS_PILLS = [
    { value: 'GOING', label: '在读' },
    { value: 'COMPLETED', label: '读完' },
    { value: 'ON_HOLD', label: '搁置' },
    { value: 'DROPPED', label: '弃读' },
  ]
</script>

<template>
  <FormItem v-slot="{ field }" name="status" label="状态" required>
    <div class="flex gap-1.5">
      <Button
        v-for="pill in STATUS_PILLS"
        :key="pill.value"
        unstyled
        class="flex-1 rounded-lg border py-2 text-center text-[13px] transition-colors"
        :class="
          field.value === pill.value
            ? 'border-hikari-primary-500 bg-hikari-primary-50 font-medium text-hikari-primary-800 dark:border-hikari-primary-700 dark:bg-hikari-primary-950 dark:text-hikari-primary-300'
            : 'border-surface-200 bg-surface-50 text-surface-600 hover:bg-surface-100 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
        "
        @click="field.props.onInput({ value: pill.value })"
      >
        {{ pill.label }}
      </Button>
    </div>
  </FormItem>
</template>

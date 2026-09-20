<script setup lang="ts">
  defineProps<{
    busy?: boolean
    currentPageSize: number
    pageSizeItems: { label: string; value: number }[]
    showJump?: boolean
    showPageSize?: boolean
    totalPages: number
  }>()
  const jumpPage = defineModel<number | null>('jumpPage', { required: true })
  const emit = defineEmits<{ jump: []; pageSize: [value: number] }>()
</script>

<template>
  <div class="flex shrink-0 flex-nowrap items-center justify-center gap-2 sm:ml-2">
    <Select
      v-if="showPageSize"
      :model-value="currentPageSize"
      :options="pageSizeItems"
      option-label="label"
      option-value="value"
      size="small"
      class="w-28"
      :disabled="busy"
      @update:model-value="emit('pageSize', $event)"
    />
    <div v-if="showJump" class="flex items-center gap-2">
      <span class="text-xs">跳至</span>
      <InputNumber
        v-model="jumpPage"
        :min="1"
        :max="totalPages"
        :use-grouping="false"
        size="small"
        input-class="w-16 text-center"
        :disabled="busy"
        @keyup.enter="emit('jump')"
      />
      <Button
        label="跳转"
        size="small"
        severity="secondary"
        outlined
        :disabled="busy"
        @click="emit('jump')"
      />
    </div>
  </div>
</template>

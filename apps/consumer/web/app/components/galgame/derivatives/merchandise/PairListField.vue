<script setup lang="ts">
  import { Plus, X } from '@lucide/vue'

  defineOptions({ name: 'GalgameDerivativesMerchandisePairListField' })
  defineProps<{ keyPlaceholder: string; valuePlaceholder: string; addLabel: string }>()
  const model = defineModel<{ key: string; value: string }[]>({ default: () => [] })

  function addRow() {
    model.value = [...model.value, { key: '', value: '' }]
  }

  function removeRow(index: number) {
    model.value = model.value.filter((_, i) => i !== index)
  }

  function updateRow(index: number, patch: Partial<{ key: string; value: string }>) {
    model.value = model.value.map((row, i) => (i === index ? { ...row, ...patch } : row))
  }
</script>

<template>
  <div class="flex flex-col gap-2">
    <div v-for="(row, index) in model" :key="index" class="flex items-center gap-2">
      <InputText
        :model-value="row.key"
        :placeholder="keyPlaceholder"
        maxlength="60"
        fluid
        @update:model-value="value => updateRow(index, { key: String(value ?? '') })"
      />
      <InputText
        :model-value="row.value"
        :placeholder="valuePlaceholder"
        maxlength="200"
        fluid
        @update:model-value="value => updateRow(index, { value: String(value ?? '') })"
      />
      <Button
        severity="secondary"
        text
        rounded
        aria-label="删除此行"
        class="shrink-0"
        @click="removeRow(index)"
      >
        <template #icon>
          <X :size="14" />
        </template>
      </Button>
    </div>
    <div>
      <Button :label="addLabel" severity="secondary" text size="small" @click="addRow">
        <template #icon>
          <Plus :size="14" />
        </template>
      </Button>
    </div>
  </div>
</template>

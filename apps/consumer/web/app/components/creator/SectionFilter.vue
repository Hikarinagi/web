<script setup lang="ts">
  import { Select } from '@hina-ui/vue'
  import { SECTIONS } from '~/features/creator/sections'

  defineOptions({ name: 'CreatorSectionFilter' })
  const props = defineProps<{ types: { value: string; label: string }[] }>()
  const section = defineModel<string>('section', { required: true })
  const type = defineModel<string>('type', { required: true })

  const sections = [
    { value: 'all', label: '全部板块' },
    ...SECTIONS.map(({ value, label }) => ({ value, label })),
  ]
  const subtypes = computed(() => {
    const picked = SECTIONS.find(item => item.value === section.value)
    if (!picked || picked.types.length < 2) return []
    return [
      { value: 'all', label: '全部类型' },
      ...picked.types.map(value => ({
        value,
        label: props.types.find(item => item.value === value)?.label ?? value,
      })),
    ]
  })
  watch(section, () => {
    type.value = 'all'
  })
</script>

<template>
  <Select v-model="section" :options="sections" size="sm" class="w-32" aria-label="板块" />
  <Select
    v-if="subtypes.length"
    v-model="type"
    :options="subtypes"
    size="sm"
    class="w-32"
    aria-label="类型"
  />
</template>

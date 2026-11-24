<script setup lang="ts">
  import { Button, Checkbox, Inline, Popover, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'WikiWorkCastVersions' })

  const props = defineProps<{ versions: { id: number; label: string }[] }>()
  const model = defineModel<number[]>({ required: true })

  const names = computed(() =>
    props.versions
      .filter(item => model.value.includes(item.id))
      .map(item => item.label)
      .join('、'),
  )

  function toggle(id: number, on: boolean) {
    model.value = on ? [...model.value, id] : model.value.filter(item => item !== id)
  }
</script>

<template>
  <Inline gap="xs" align="baseline">
    <Text v-if="names" size="xs" class="min-w-0">{{ names }}</Text>
    <Popover align="start">
      <Button variant="link" size="sm">{{ names ? '修改' : '选择版本' }}</Button>
      <template #content>
        <Stack gap="sm" class="max-w-80">
          <Checkbox
            v-for="item in versions"
            :key="item.id"
            :model-value="model.includes(item.id)"
            @update:model-value="on => toggle(item.id, !!on)"
          >
            {{ item.label }}
          </Checkbox>
        </Stack>
      </template>
    </Popover>
  </Inline>
</template>

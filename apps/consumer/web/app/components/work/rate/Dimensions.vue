<script setup lang="ts">
  import {
    Button,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DisclosureIcon,
    Divider,
    FormField,
    Inline,
    Slider,
    Stack,
    Text,
  } from '@hina-ui/vue'

  defineOptions({ name: 'WorkRateDimensions' })

  const props = defineProps<{
    dimensions: ReadonlyArray<{ key: string; label: string }>
    values: Record<string, unknown>
    update: (key: string, value: number | null) => void
    labelWidth?: string
  }>()
  const open = defineModel<boolean>('open', { required: true })

  function score(key: string) {
    return (props.values[key] as number | null) ?? 0
  }
</script>

<template>
  <Stack gap="sm">
    <Divider />
    <Collapsible v-model:open="open">
      <CollapsibleTrigger as-child>
        <Button variant="link" size="sm">
          更详细评分
          <template #trailing><DisclosureIcon :open="open" /></template>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Stack gap="sm" class="pt-3">
          <FormField v-for="d in dimensions" :key="d.key" :name="d.key">
            <Inline align="center" gap="md" :wrap="false">
              <Text size="sm" :class="cn('shrink-0', labelWidth ?? 'w-12')">{{ d.label }}</Text>
              <Slider
                :model-value="score(d.key)"
                :min="0"
                :max="10"
                :step="1"
                :format="value => (value === 0 ? '未评分' : String(value))"
                :aria-label="d.label"
                class="min-w-0 flex-1"
                @update:model-value="value => update(d.key, value || null)"
              />
              <Text
                size="sm"
                weight="semibold"
                :tone="score(d.key) === 0 ? 'faint' : 'default'"
                class="w-6 text-right tabular-nums"
              >
                {{ score(d.key) || '—' }}
              </Text>
            </Inline>
          </FormField>
        </Stack>
      </CollapsibleContent>
    </Collapsible>
  </Stack>
</template>

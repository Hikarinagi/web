<script setup lang="ts">
  import { Form, FormField, Input, Text } from '@hina-ui/vue'
  import type { BackendEntitySummary } from '~/features/creator/editor'
  import type { EntityTarget } from '~/features/creator/composables/useEntitySearch'
  import { CREATABLE_ENTITY } from '~/features/creator/editor/entity-create'
  import { createProvisionalEntity } from '~/features/creator/editor/create-entity'
  import {
    entityCreateSchema,
    producerCreateSchema,
  } from '~/features/creator/schemas/entity-create.schema'

  const props = defineProps<{ target: EntityTarget; presetName?: string }>()
  const emit = defineEmits<{ created: [entity: BackendEntitySummary] }>()

  const config = computed(() => CREATABLE_ENTITY[props.target] ?? null)
  const needsCountry = computed(() => props.target === 'producer')
  const rules = computed(() => (needsCountry.value ? producerCreateSchema : entityCreateSchema))

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive({ name: '', country: '' })
  const submitting = ref(false)

  onMounted(() => {
    values.name = props.presetName?.trim() ?? ''
  })

  async function onSubmit() {
    const cfg = config.value
    if (!cfg || submitting.value) return
    submitting.value = true
    try {
      const entity = await createProvisionalEntity({
        resource_type: cfg.resource_type,
        label: cfg.label,
        name: values.name,
        country: needsCountry.value ? values.country : undefined,
      })
      if (entity) emit('created', entity)
    } finally {
      submitting.value = false
    }
  }

  defineExpose({ submit: () => form.value?.submit(), submitting })
</script>

<template>
  <Form ref="form" :values="values" :rules="rules" :disabled="submitting" @submit="onSubmit">
    <Text size="sm" tone="muted">新建并选择{{ config?.label }}</Text>

    <FormField name="name" label="名称" required>
      <Input v-model="values.name" placeholder="官方原文名" autofocus />
    </FormField>

    <FormField v-if="needsCountry" name="country" label="国家 / 地区" required>
      <Input v-model="values.country" placeholder="如 日本" />
    </FormField>
  </Form>
</template>

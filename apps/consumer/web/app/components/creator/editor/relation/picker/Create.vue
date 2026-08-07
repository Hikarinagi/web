<script setup lang="ts">
  import Form, { type FormSubmitEvent } from '@primevue/forms/form'
  import type { BackendEntitySummary } from '~/features/creator/editor'
  import type { EntityTarget } from '~/features/creator/composables/useEntitySearch'
  import { CREATABLE_ENTITY } from '~/features/creator/editor/entity-create'
  import { createProvisionalEntity } from '~/features/creator/editor/create-entity'
  import {
    entityCreateResolver,
    producerCreateResolver,
  } from '~/features/creator/schemas/entity-create.schema'

  const props = defineProps<{ target: EntityTarget; presetName?: string }>()
  const emit = defineEmits<{ created: [entity: BackendEntitySummary]; cancel: [] }>()

  const config = computed(() => CREATABLE_ENTITY[props.target] ?? null)
  const needsCountry = computed(() => props.target === 'producer')
  const resolver = computed(() =>
    needsCountry.value ? producerCreateResolver : entityCreateResolver,
  )
  const initialValues = computed(() => ({ name: props.presetName?.trim() ?? '' }))
  const submitting = ref(false)

  async function onSubmit(event: FormSubmitEvent) {
    const cfg = config.value
    if (!event.valid || !cfg || submitting.value) return
    const values = event.values as { name: string; country?: string }
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
</script>

<template>
  <Form
    :initial-values="initialValues"
    :resolver="resolver"
    class="flex flex-col gap-4"
    @submit="onSubmit"
  >
    <p class="text-sm text-muted-color">
      没有合适的{{ config?.label }}？在这里新建一个，创建后立即可选。
    </p>

    <FormItem v-slot="{ id, errorId }" name="name" label="名称" required>
      <InputText :id="id" :aria-describedby="errorId" placeholder="官方原文名" fluid autofocus />
    </FormItem>

    <FormItem
      v-if="needsCountry"
      v-slot="{ id, errorId }"
      name="country"
      label="国家 / 地区"
      required
    >
      <InputText :id="id" :aria-describedby="errorId" placeholder="如 日本" fluid />
    </FormItem>

    <div class="flex items-center justify-end gap-3">
      <Button label="返回" severity="secondary" :disabled="submitting" @click="emit('cancel')" />
      <Button label="创建并选择" type="submit" :loading="submitting" />
    </div>
  </Form>
</template>

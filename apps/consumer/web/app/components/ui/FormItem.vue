<script setup lang="ts">
  import FormField from '@primevue/forms/formfield'

  const props = defineProps<{
    name: string
    label?: string
    description?: string
    required?: boolean
    initialValue?: unknown
  }>()

  const slots = useSlots()
  const fieldId = useId()
  const errorId = useId()
  const descriptionId = useId()
  const hasDescription = computed(() => Boolean(props.description || slots.description))

  function describedBy(invalid: boolean) {
    const ids = []
    if (hasDescription.value) ids.push(descriptionId)
    if (invalid) ids.push(errorId)
    return ids.length ? ids.join(' ') : undefined
  }
</script>

<template>
  <FormField v-slot="$field" :name="name" :initial-value="initialValue" class="flex flex-col gap-2">
    <div v-if="label || hasDescription" class="flex flex-col gap-1">
      <label v-if="label" :for="fieldId" class="text-sm font-medium">
        {{ label }}
        <span v-if="required" class="text-red-500" aria-hidden="true">*</span>
      </label>
      <p v-if="hasDescription" :id="descriptionId" class="text-xs leading-5 text-muted-color">
        <slot :id="descriptionId" name="description">{{ description }}</slot>
      </p>
    </div>
    <slot
      v-bind="{
        id: fieldId,
        errorId: $field.invalid ? errorId : undefined,
        descriptionId: hasDescription ? descriptionId : undefined,
        ariaDescribedby: describedBy($field.invalid),
        field: $field,
      }"
    />
    <Message v-if="$field.invalid" :id="errorId" severity="error" size="small" variant="simple">
      {{ $field.error?.message }}
    </Message>
  </FormField>
</template>

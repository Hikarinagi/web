<script setup lang="ts">
  import { EDITOR_PRESENTATIONS } from '~/features/creator/editor/presentation'
  import { RESOURCE_SLUG } from '~/features/creator/labels'

  const props = defineProps<{
    payload: Record<string, unknown>[]
    resourceType: string
  }>()

  const fieldLabels = computed(() => {
    const slug = RESOURCE_SLUG[props.resourceType]
    return (slug ? EDITOR_PRESENTATIONS[slug]?.fields : undefined) ?? {}
  })

  function labelFor(op: Record<string, unknown>): string {
    const key = (op.field ?? op.relation) as string | undefined
    if (!key) return '—'
    return fieldLabels.value[key]?.label ?? key
  }
</script>

<template>
  <div v-if="payload.length" class="flex flex-col gap-3">
    <CreatorChangesetFieldDiff
      v-for="(op, index) in payload"
      :key="index"
      :op="op"
      :label="labelFor(op)"
    />
  </div>
  <CreatorEmpty v-else text="无变更内容" />
</template>

<script setup lang="ts">
  import { Button, Panel } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import type {
    BackendEditableEntry,
    BackendPropertyDefinition,
  } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorEntryImagesTab' })
  const props = defineProps<{
    entry: BackendEditableEntry
    definition: BackendPropertyDefinition
    readonly: boolean
  }>()
  defineEmits<{ saved: [] }>()

  const adding = ref(false)
  const of = (status: 'live' | 'deprecated') =>
    props.entry.statements
      .filter(
        item =>
          item.property === props.definition.property &&
          (status === 'live') === (item.status !== 'DEPRECATED'),
      )
      .sort((a, b) => a.position - b.position || a.id - b.id)
  const images = computed(() => of('live'))
  const retired = computed(() => of('deprecated'))
</script>

<template>
  <Panel :title="definition.label" :count="images.length || undefined">
    <template v-if="!readonly && !adding" #actions>
      <Button variant="ghost" tone="neutral" size="sm" @click="adding = true">
        <template #icon><Plus /></template>
        添加图片
      </Button>
    </template>
    <CreatorEntryImagesGallery
      v-model:adding="adding"
      :entry="entry"
      :definition="definition"
      :statements="images"
      :deprecated="retired"
      :readonly="readonly"
      :actions="false"
      @saved="$emit('saved')"
    />
  </Panel>
</template>

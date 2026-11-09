<script setup lang="ts">
  import { Empty, FileUpload, SimpleGrid, Stack } from '@hina-ui/vue'
  import { uploadImage } from '~/components/media-library/lib/upload'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { emptyValue, type PropertyDefinition } from '~/features/wiki/editor/draft'
  import { mediaDraft } from '~/features/wiki/editor/inputs'
  import type { WorkingProperty } from '~/features/wiki/editor/working'

  defineOptions({ name: 'WikiFieldImages' })

  const props = defineProps<{
    entry: number
    definition: PropertyDefinition
    label: string
    view: WorkingProperty
  }>()
  const editor = inject(ENTRY_EDITOR)!
  const uploading = ref(false)
  const single = computed(() => props.definition.cardinality === 'single')
  const ratio = computed(() =>
    props.definition.property === 'SAMPLE_IMAGE'
      ? 16 / 9
      : props.definition.property === 'IMAGE'
        ? 1
        : 3 / 4,
  )
  const live = computed(() =>
    props.view.values.filter(item => item.state !== 'removed' && item.state !== 'moved_out'),
  )

  async function upload(files: File | File[] | null) {
    const list = Array.isArray(files) ? files : files ? [files] : []
    uploading.value = true
    try {
      for (const file of list) {
        const uploaded = await uploadImage(file)
        if (!uploaded) continue
        const media = mediaDraft(uploaded)
        const first = live.value[0]
        if (single.value && first) editor.set(first.id, { ...first.value, media })
        else editor.add(props.entry, props.definition.property, { ...emptyValue(), media })
      }
    } finally {
      uploading.value = false
    }
  }
</script>

<template>
  <Stack gap="md">
    <Empty v-if="!view.values.length" :title="`暂无${label}`" />
    <SimpleGrid v-else :min="single ? '12rem' : '13rem'" gap="md">
      <WikiFieldValue
        v-for="(item, index) in view.values"
        :key="item.id"
        :item="item"
        :entry="entry"
        :definition="definition"
        :label="label"
        card
        :ratio="ratio"
        :up="item.id > 0 && index > 0 && (view.values[index - 1]?.id ?? 0) > 0"
        :down="item.id > 0 && (view.values[index + 1]?.id ?? 0) > 0"
      />
    </SimpleGrid>
    <FileUpload
      :multiple="!single"
      accept="image/jpeg,image/png,image/webp,image/gif"
      :loading="uploading"
      :list="false"
      @update:model-value="upload"
    />
  </Stack>
</template>

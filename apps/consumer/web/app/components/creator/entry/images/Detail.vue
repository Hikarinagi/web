<script setup lang="ts">
  import { Button, Dialog, Stack } from '@hina-ui/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorEntryImagesDetail' })
  defineProps<{
    entry: { id: number; revision: number }
    definition: BackendPropertyDefinition
    statement: BackendStatement | null
    title: string
    editable: boolean
  }>()
  const emit = defineEmits<{ saved: [] }>()
  const open = defineModel<boolean>('open', { required: true })

  const deprecating = ref(false)
</script>

<template>
  <Dialog v-model:open="open" :title="title" size="lg">
    <template #content>
      <Stack v-if="statement" gap="md">
        <HikariImage
          :src="statement.media ?? null"
          alt=""
          class="w-full overflow-hidden rounded-md"
          image-class="max-h-96 w-full object-contain"
        />
        <CreatorEntrySource :statement="statement" :label="definition.label" />
      </Stack>
    </template>
    <template v-if="editable && statement" #footer>
      <Button variant="ghost" tone="danger" size="sm" @click="deprecating = true">
        作废此图片
      </Button>
    </template>
  </Dialog>
  <CreatorEntryDeprecate
    v-if="statement"
    v-model:open="deprecating"
    :entry="entry"
    :definition="definition"
    :statement="statement"
    @saved="
      () => {
        open = false
        emit('saved')
      }
    "
  />
</template>

<script setup lang="ts">
  import { Button, Card, Inline, SimpleGrid, Stack, Text } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorEntryImagesGallery' })
  const props = defineProps<{
    entry: { id: number; revision: number; type: string }
    definition: BackendPropertyDefinition
    statements: BackendStatement[]
    deprecated: BackendStatement[]
    readonly: boolean
  }>()
  const emit = defineEmits<{ saved: [] }>()

  const adding = ref(false)
  const shown = ref<BackendStatement | null>(null)
  const open = ref(false)
  const multiple = computed(() => props.definition.cardinality === 'multiple')
  const existing = computed(() =>
    props.statements.flatMap(statement => (statement.media ? [statement.media.src] : [])),
  )
  const title = computed(() => {
    const index = shown.value ? props.statements.indexOf(shown.value) + 1 : 0
    return multiple.value ? `截图 ${index}` : props.definition.label
  })
  function view(statement: BackendStatement) {
    shown.value = statement
    open.value = true
  }
  function done() {
    adding.value = false
    emit('saved')
  }
</script>

<template>
  <Stack gap="md">
    <SimpleGrid v-if="statements.length" :min="multiple ? '12rem' : '10rem'" gap="sm">
      <Card
        v-for="statement in statements"
        :key="statement.id"
        as="button"
        type="button"
        :padded="false"
        class="hn-state-layer hn-interactive overflow-hidden hn-press-lg"
        :aria-label="`查看${definition.label}`"
        @click="view(statement)"
      >
        <HikariImage
          :src="statement.media ?? null"
          alt=""
          preset="small"
          :class="multiple ? 'aspect-video w-full' : 'aspect-3/4 w-full'"
          image-class="size-full object-cover"
        />
      </Card>
    </SimpleGrid>
    <CreatorEntryImagesAdd
      v-if="adding"
      :entry="entry"
      :definition="definition"
      :current="multiple ? null : (statements[0] ?? null)"
      :existing="existing"
      @cancel="adding = false"
      @saved="done"
    />
    <Inline v-else-if="!readonly" gap="md" align="center" justify="between">
      <Text v-if="!statements.length" as="span" size="sm" tone="faint">未填写</Text>
      <Button variant="ghost" tone="neutral" size="sm" class="ms-auto" @click="adding = true">
        <template v-if="multiple || !statements.length" #icon><Plus /></template>
        {{ multiple ? '添加图片' : statements.length ? '修改' : '添加' }}
      </Button>
    </Inline>
    <CreatorEntryDeprecated
      v-if="deprecated.length && !readonly"
      :entry="entry"
      :statements="deprecated"
      @saved="emit('saved')"
    />
    <CreatorEntryImagesDetail
      v-model:open="open"
      :entry="entry"
      :definition="definition"
      :statement="shown"
      :title="title"
      :editable="!readonly"
      @saved="emit('saved')"
    />
  </Stack>
</template>

<script setup lang="ts">
  import { Button, DescriptionDetails, DescriptionTerm, Inline, Stack, Text } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import { isEditable } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryRow' })
  const props = defineProps<{
    entry: { id: number; revision: number; type: string }
    definition: BackendPropertyDefinition
    statements: BackendStatement[]
    deprecated: BackendStatement[]
    readonly: boolean
    editing: number | 'new' | null
  }>()
  const emit = defineEmits<{ edit: [target: number | 'new' | null]; saved: [] }>()

  const editable = computed(() => isEditable(props.definition) && !props.readonly)
  const moving = ref(false)
  const placed = computed(() =>
    props.definition.property === 'CHARACTER' ? (props.statements[0] ?? null) : null,
  )
  const multiple = computed(() => editable.value && props.definition.cardinality === 'multiple')
  const done = () => {
    emit('edit', null)
    emit('saved')
  }
</script>

<template>
  <DescriptionTerm>{{ definition.label }}</DescriptionTerm>
  <DescriptionDetails>
    <CreatorEntryImagesGallery
      v-if="definition.shape === 'image'"
      :entry="entry"
      :definition="definition"
      :statements="statements"
      :deprecated="deprecated"
      :readonly="readonly"
      @saved="emit('saved')"
    />
    <Stack v-else gap="md">
      <template v-for="statement in statements" :key="statement.id">
        <CreatorEntryFormCard
          v-if="editing === statement.id"
          :entry="entry"
          :definition="definition"
          :statement="statement"
          @cancel="emit('edit', null)"
          @saved="done"
        />
        <CreatorEntryValue
          v-else
          :statement="statement"
          :definition="definition"
          :editable="editable && !definition.move_only"
          :entry-type="entry.type"
          @edit="emit('edit', statement.id)"
        />
      </template>
      <CreatorEntryFormCard
        v-if="editing === 'new'"
        :entry="entry"
        :definition="definition"
        :statement="null"
        @cancel="emit('edit', null)"
        @saved="done"
      />
      <Inline
        v-else-if="!statements.length"
        gap="md"
        align="center"
        justify="between"
        :wrap="false"
      >
        <Text as="span" size="sm" tone="faint">未填写</Text>
        <Button
          v-if="editable"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="emit('edit', 'new')"
        >
          <template #icon><Plus /></template>
          添加
        </Button>
      </Inline>
      <Button
        v-else-if="multiple"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="self-start"
        @click="emit('edit', 'new')"
      >
        <template #icon><Plus /></template>
        添加{{ definition.label }}
      </Button>
      <Button
        v-if="placed && editable"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="self-start"
        @click="moving = true"
      >
        归入其他角色
      </Button>
      <CreatorEntryMoveDialog
        v-if="placed"
        v-model:open="moving"
        :entry="entry"
        :definition="definition"
        :statement="placed"
        @saved="emit('saved')"
      />
      <CreatorEntryDeprecated
        v-if="deprecated.length && editable"
        :entry="entry"
        :statements="deprecated"
        @saved="emit('saved')"
      />
    </Stack>
  </DescriptionDetails>
</template>

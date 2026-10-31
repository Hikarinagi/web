<script setup lang="ts">
  import { Button, DescriptionDetails, DescriptionTerm, Inline, Stack, Text } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import { isEditable } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryRow' })
  const props = withDefaults(
    defineProps<{
      entry: { id: number; revision: number; type: string }
      definition: BackendPropertyDefinition
      statements: BackendStatement[]
      deprecated: BackendStatement[]
      readonly: boolean
      editing: number | 'new' | null
      label?: string
      code?: string | null
      addable?: boolean
      bare?: boolean
    }>(),
    { label: undefined, code: null, addable: true },
  )
  const emit = defineEmits<{ edit: [target: number | 'new' | null]; saved: [] }>()

  const editable = computed(() => isEditable(props.definition) && !props.readonly)
  const moving = ref(false)
  const placed = computed(() =>
    props.definition.property === 'CHARACTER' ? (props.statements[0] ?? null) : null,
  )
  const multiple = computed(
    () =>
      editable.value &&
      props.addable &&
      props.code === null &&
      props.definition.cardinality === 'multiple',
  )
  const done = () => {
    emit('edit', null)
    emit('saved')
  }
</script>

<template>
  <DescriptionTerm v-if="!bare">
    {{ label ?? definition.label }}
    <CreatorEntryHint v-if="!label" :name="definition.property" class="align-middle" />
  </DescriptionTerm>
  <component :is="bare ? Stack : DescriptionDetails">
    <CreatorEntryImagesGallery
      v-if="definition.shape === 'image'"
      :entry="entry"
      :definition="definition"
      :statements="statements"
      :deprecated="deprecated"
      :readonly="readonly"
      @saved="emit('saved')"
    />
    <Stack v-else gap="sm">
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
          :code-as="code !== null ? 'none' : bare ? 'tag' : 'text'"
          @edit="emit('edit', statement.id)"
        >
          <template v-if="placed && editable && statement.id === placed.id" #action>
            <Button variant="ghost" tone="neutral" size="sm" @click="moving = true">
              归入其他角色
            </Button>
          </template>
        </CreatorEntryValue>
      </template>
      <CreatorEntryFormCard
        v-if="editing === 'new' && addable"
        :entry="entry"
        :definition="definition"
        :statement="null"
        :code="code ?? undefined"
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
          v-if="editable && addable"
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
        添加{{ label ?? definition.label }}
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
  </component>
</template>

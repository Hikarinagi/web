<script setup lang="ts">
  import { Button, Card, Inline, SimpleGrid, Stack, Text } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import { sourcesOf } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryImagesGallery' })
  const props = defineProps<{
    entry: { id: number; revision: number; type: string }
    definition: BackendPropertyDefinition
    statements: BackendStatement[]
    deprecated: BackendStatement[]
    readonly: boolean
    actions?: boolean
  }>()
  const emit = defineEmits<{ saved: [] }>()

  const adding = defineModel<boolean>('adding', { default: false })
  const shown = ref<BackendStatement | null>(null)
  const open = ref(false)
  const multiple = computed(() => props.definition.cardinality === 'multiple')
  const portrait = computed(() => props.definition.property === 'IMAGE')
  const sources = computed(() => {
    const seen = new Map<string, BackendStatement>()
    for (const statement of props.statements) {
      const citation = sourcesOf(statement)[0]
      const key = citation ? `${citation.source}|${citation.url}` : ''
      if (!seen.has(key)) seen.set(key, statement)
    }
    return [...seen.values()]
  })
  const existing = computed(() =>
    props.statements.flatMap(statement => (statement.media ? [statement.media.src] : [])),
  )
  const title = computed(() => {
    const index = shown.value
      ? props.statements.findIndex(item => item.id === shown.value?.id) + 1
      : 0
    return multiple.value ? `截图 ${index}` : props.definition.label
  })
  const ratio = (statement: BackendStatement) =>
    statement.media?.width && statement.media.height
      ? statement.media.width / statement.media.height
      : 3 / 4
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
    <SimpleGrid v-if="multiple && statements.length" :min="portrait ? '10rem' : '20rem'" gap="sm">
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
          :class="portrait ? 'aspect-3/4 w-full' : 'aspect-video w-full'"
          :image-class="portrait ? 'size-full object-cover object-top' : 'size-full object-cover'"
        />
      </Card>
    </SimpleGrid>
    <Inline
      v-else-if="statements[0] && !adding"
      gap="md"
      align="start"
      justify="between"
      :wrap="false"
    >
      <Stack gap="xs" class="items-start">
        <Card
          as="button"
          type="button"
          :padded="false"
          class="hn-state-layer hn-interactive overflow-hidden hn-press-lg"
          :aria-label="`查看${definition.label}`"
          @click="view(statements[0])"
        >
          <HikariImage
            :src="statements[0].media ?? null"
            alt=""
            preset="small"
            :ratio="ratio(statements[0])"
            class="w-56"
            image-class="size-full object-cover"
          />
        </Card>
        <CreatorEntrySource :statement="statements[0]" />
      </Stack>
      <Button
        v-if="!readonly && actions !== false"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="adding = true"
      >
        修改
      </Button>
    </Inline>
    <template v-if="multiple && statements.length">
      <CreatorEntrySource v-for="statement in sources" :key="statement.id" :statement="statement" />
    </template>
    <CreatorEntryImagesAdd
      v-if="adding"
      :entry="entry"
      :definition="definition"
      :current="multiple ? null : (statements[0] ?? null)"
      :existing="existing"
      @cancel="adding = false"
      @saved="done"
    />
    <Inline
      v-else-if="!readonly && actions !== false && (multiple || !statements.length)"
      gap="md"
      align="center"
      justify="between"
    >
      <Text v-if="!statements.length" as="span" size="sm" tone="faint">未填写</Text>
      <Button variant="ghost" tone="neutral" size="sm" class="ms-auto" @click="adding = true">
        <template #icon><Plus /></template>
        {{ multiple ? '添加图片' : '添加' }}
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

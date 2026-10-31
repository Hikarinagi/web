<script setup lang="ts">
  import {
    Button,
    Dialog,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Inline,
    Link,
    Stack,
    Tag,
  } from '@hina-ui/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import { accessedText, sourcesOf } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryImagesDetail' })
  const props = defineProps<{
    entry: { id: number; revision: number }
    definition: BackendPropertyDefinition
    statement: BackendStatement | null
    title: string
    editable: boolean
  }>()
  const emit = defineEmits<{ saved: [] }>()
  const open = defineModel<boolean>('open', { required: true })

  const deprecating = ref(false)
  const source = computed(() => (props.statement ? (sourcesOf(props.statement)[0] ?? null) : null))
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
        <DescriptionList orientation="horizontal" class="text-sm">
          <DescriptionTerm>来源</DescriptionTerm>
          <DescriptionDetails>
            <Link
              v-if="source?.url"
              as="a"
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
              tone="accent"
            >
              {{ source.source ?? source.url }}
            </Link>
            <Tag v-else tone="warning">无来源</Tag>
          </DescriptionDetails>
          <template v-if="source?.accessed_at">
            <DescriptionTerm>访问时间</DescriptionTerm>
            <DescriptionDetails>{{ accessedText(source.accessed_at, true) }}</DescriptionDetails>
          </template>
          <DescriptionTerm>添加者</DescriptionTerm>
          <DescriptionDetails>
            <Inline gap="sm" align="center" :wrap="false">
              <Avatar :user="statement.editor" class="size-5!" />
              <UserName :user="statement.editor" />
            </Inline>
          </DescriptionDetails>
        </DescriptionList>
      </Stack>
    </template>
    <template v-if="editable && statement" #footer>
      <Button variant="ghost" tone="neutral" size="sm" class="me-auto" @click="deprecating = true">
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

<script setup lang="ts">
  import { Button, Dialog, Form, FormField, IconButton, Inline, Input, Stack } from '@hina-ui/vue'
  import { ArrowDownUp } from '@lucide/vue'
  import { TITLE_FIELDS, hasKana } from '~/features/creator/duplicates'
  import { RESOURCE_TYPE_LABEL, RESOURCE_SLUG } from '~/features/creator/labels'
  import { newEntrySchema, type NewEntryValues } from '~/features/creator/schemas/find.schema'

  const props = defineProps<{
    type: string
    query: string
    author: { id: number; name: string } | null
  }>()
  const open = defineModel<boolean>('open', { default: false })

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive<NewEntryValues>({ original: '', chinese: '' })

  const fields = computed(() => TITLE_FIELDS[props.type] ?? { original: 'name' })
  const isPersonLike = computed(() => props.type === 'person' || props.type === 'character')
  const typeLabel = computed(() => {
    const key = Object.keys(RESOURCE_SLUG).find(name => RESOURCE_SLUG[name] === props.type)
    return key ? RESOURCE_TYPE_LABEL[key] : ''
  })
  const labels = computed(() => {
    if (isPersonLike.value) return { original: '姓名', chinese: '译名' }
    if (!fields.value.chinese) return { original: '名称', chinese: '' }
    return { original: '原名', chinese: '中文名' }
  })
  const originalDesc = computed(() =>
    isPersonLike.value
      ? '以原始文字书写的官方名称。'
      : fields.value.chinese
        ? '日文原版的书名。繁体中文版与简体中文版通常在版权页印有原书名。'
        : undefined,
  )

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    const query = props.query.trim()
    const asOriginal = !fields.value.chinese || hasKana(query)
    values.original = asOriginal ? query : ''
    values.chinese = asOriginal ? '' : query
  })

  function swap() {
    const original = values.original
    values.original = values.chinese ?? ''
    values.chinese = original
  }

  function onSubmit() {
    const params = new URLSearchParams()
    params.set(fields.value.original, values.original.trim())
    const chinese = values.chinese?.trim()
    if (fields.value.chinese && chinese) params.set(fields.value.chinese, chinese)
    if (props.type === 'light-novel' && props.author) {
      params.set('author_id', String(props.author.id))
      params.set('author_name', props.author.name)
    }
    open.value = false
    void navigateTo(`/create/new/${props.type}?${params.toString()}`)
  }
</script>

<template>
  <Dialog v-model:open="open" :title="`新建${typeLabel}`" size="sm">
    <template #content>
      <Form ref="form" :values="values" :rules="newEntrySchema" @submit="onSubmit">
        <Stack gap="sm">
          <FormField
            name="original"
            :label="labels.original"
            :description="originalDesc"
            description-placement="control"
            required
          >
            <Input v-model="values.original" autofocus />
          </FormField>
          <template v-if="labels.chinese">
            <Inline justify="center">
              <IconButton
                label="交换两个标题"
                variant="ghost"
                tone="neutral"
                size="sm"
                @click="swap"
              >
                <ArrowDownUp />
              </IconButton>
            </Inline>
            <FormField
              name="chinese"
              :label="labels.chinese"
              description="若原作为中文，请留空。"
              description-placement="control"
            >
              <Input v-model="values.chinese" />
            </FormField>
          </template>
        </Stack>
      </Form>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" @click="open = false">取消</Button>
      <Button @click="form?.submit()">打开编辑器</Button>
    </template>
  </Dialog>
</template>

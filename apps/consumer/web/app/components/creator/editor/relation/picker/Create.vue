<script setup lang="ts">
  import {
    Alert,
    Button,
    Checkbox,
    Form,
    FormField,
    Inline,
    Input,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
  import type { BackendEntitySummary } from '~/features/creator/editor'
  import type { EntityTarget } from '~/features/creator/composables/useEntitySearch'
  import { isBlocking, type BackendDuplicateCandidate } from '~/features/creator/duplicates'
  import { CREATABLE_ENTITY } from '~/features/creator/editor/entity-create'
  import { createProvisionalEntity } from '~/features/creator/editor/create-entity'
  import {
    entityCreateSchema,
    producerCreateSchema,
  } from '~/features/creator/schemas/entity-create.schema'
  import { isApiError, showApiErrorToast } from '~/utils/api/error'

  const props = defineProps<{
    target: EntityTarget
    presetName?: string
    label?: string
    field?: string
    candidates?: BackendEntitySummary[]
  }>()
  const emit = defineEmits<{ created: [entity: BackendEntitySummary] }>()

  const config = computed(() => CREATABLE_ENTITY[props.target] ?? null)
  const bunko = computed(() => props.field === 'bunko_id')
  const needsCountry = computed(() => props.target === 'producer')
  const rules = computed(() => (needsCountry.value ? producerCreateSchema : entityCreateSchema))
  const copy = computed(() => {
    if (bunko.value) return { title: '已存在同名厂商', other: '都不是，这是另一个文库' }
    if (props.target === 'producer') return { title: '已存在同名厂商', other: '这是另一个厂商' }
    if (props.target === 'tag') return { title: '已存在同名标签', other: '这是另一个标签' }
    return { title: '存在同名人物', other: '这是另一个人' }
  })

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive({ name: '', country: '' })
  const submitting = ref(false)
  const namesakes = ref<BackendDuplicateCandidate[]>([])
  const checkedName = ref<string | null>(null)
  const different = ref(false)
  const partials = computed(() =>
    (props.candidates ?? []).filter(item => !namesakes.value.some(found => found.id === item.id)),
  )
  const blocked = computed(
    () => (partials.value.length > 0 || namesakes.value.length > 0) && !different.value,
  )
  const partialTitle = computed(() => `可能是已有${bunko.value ? (props.label ?? '文库') : '厂商'}`)
  const partialBody = computed(() =>
    bunko.value
      ? `「${values.name}」可能不是文库的完整名称。它可能是以下之一；请选择版权页上印有的文库。`
      : `「${values.name}」可能是以下厂商之一。`,
  )

  onMounted(() => {
    values.name = props.presetName?.trim() ?? ''
  })

  watch(
    () => values.name,
    () => {
      checkedName.value = null
      namesakes.value = []
      different.value = false
    },
  )

  function pick(item: BackendDuplicateCandidate) {
    emit('created', { id: item.id, name: item.title, cover: item.cover, status: 'PUBLISHED' })
  }

  function choose(item: BackendEntitySummary) {
    emit('created', item)
  }

  async function onSubmit() {
    const cfg = config.value
    if (!cfg || submitting.value) return
    submitting.value = true
    try {
      if (checkedName.value !== values.name) {
        const data = await hikariRequest('/api/v3/contribution/duplicate-checks', {
          method: 'POST',
          body: {
            resource_type: cfg.resource_type,
            changeset: [{ kind: 'scalar', field: 'name', from: null, to: values.name }],
          },
          toast: false,
        }).catch(() => ({ candidates: [] }))
        namesakes.value = data.candidates.filter(isBlocking)
        checkedName.value = values.name
      }
      if (blocked.value) return
      const entity = await createProvisionalEntity({
        resource_type: cfg.resource_type,
        label: cfg.label,
        name: values.name,
        country: needsCountry.value ? values.country : undefined,
        dismissals: different.value ? namesakes.value.map(item => item.id) : undefined,
      })
      if (entity) emit('created', entity)
    } catch (error) {
      if (isApiError(error) && error.code === HIKARI_BIZ_CODE.CHANGE_REQUEST_DUPLICATE_SUSPECTED) {
        const found = error.details?.candidates
        namesakes.value = Array.isArray(found) ? (found as BackendDuplicateCandidate[]) : []
        different.value = false
        return
      }
      if (isApiError(error)) showApiErrorToast(error)
      throw error
    } finally {
      submitting.value = false
    }
  }

  defineExpose({ submit: () => form.value?.submit(), submitting, blocked })
</script>

<template>
  <Form ref="form" :values="values" :rules="rules" :disabled="submitting" @submit="onSubmit">
    <Text size="sm" tone="muted">
      {{ bunko ? `创建并选择${label ?? '文库'}` : `新建并选择${config?.label ?? ''}` }}
    </Text>

    <Alert :open="partials.length > 0 && !namesakes.length" tone="warning" :title="partialTitle">
      <Stack gap="sm">
        <Text size="sm">{{ partialBody }}</Text>
        <Stack as="ul" gap="xs">
          <Inline
            v-for="item in partials"
            :key="item.id"
            as="li"
            gap="sm"
            align="center"
            :wrap="false"
          >
            <Stack gap="none" class="min-w-0 flex-1">
              <Text as="span" size="sm" weight="medium" truncate>{{ item.name }}</Text>
              <Text as="span" size="xs" tone="muted">
                {{
                  bunko && item.light_novel_count != null
                    ? `${item.light_novel_count} 部轻小说 · `
                    : ''
                }}#{{ item.id }}
              </Text>
            </Stack>
            <Button variant="outline" tone="neutral" size="sm" @click="choose(item)">选择</Button>
          </Inline>
        </Stack>
      </Stack>
    </Alert>

    <FormField name="name" label="名称" required>
      <Input v-model="values.name" placeholder="官方原文名" autofocus />
    </FormField>

    <FormField v-if="needsCountry" name="country" label="国家 / 地区" required>
      <Input v-model="values.country" placeholder="如 日本" />
    </FormField>

    <Checkbox v-if="partials.length > 0 && !namesakes.length" v-model="different">
      {{ copy.other }}
    </Checkbox>

    <Alert :open="namesakes.length > 0" tone="warning" :title="copy.title">
      <Stack gap="sm">
        <Stack v-for="item in namesakes" :key="item.id" gap="xs">
          <Text size="sm">
            {{ item.title }}（#{{
              item.id
            }}）名称相同，可能只是写法不同。除非这是另一个条目，否则请选择它。
          </Text>
          <Button variant="outline" tone="neutral" size="sm" class="self-start" @click="pick(item)">
            选择{{ item.title }}
          </Button>
        </Stack>
        <Checkbox v-model="different">{{ copy.other }}</Checkbox>
      </Stack>
    </Alert>
  </Form>
</template>

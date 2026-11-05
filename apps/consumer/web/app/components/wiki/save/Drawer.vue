<script setup lang="ts">
  import {
    Button,
    Checkbox,
    Drawer,
    Form,
    FormField,
    Inline,
    Link,
    Stack,
    Textarea,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { useSaveFlow, type EditResult } from '~/features/wiki/composables/useSaveFlow'
  import { problemsOf } from '~/features/wiki/editor/problems'
  import { saveSchema } from '~/features/wiki/schemas/save.schema'

  defineOptions({ name: 'WikiSaveDrawer' })

  const emit = defineEmits<{ saved: [result: EditResult | undefined] }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const router = useRouter()
  const flow = useSaveFlow(editor, result => emit('saved', result))
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const conflicting = ref(false)

  const open = computed({
    get: () => route.query.save === '1',
    set: next => {
      const { save: _save, ...query } = route.query
      void router.replace({ query: next ? { ...query, save: '1' } : query })
    },
  })
  const problems = computed(() =>
    problemsOf(
      editor.draft.value,
      editor.members.value,
      editor.definitions.value,
      editor.statements.value,
    ),
  )
  const preview = computed(() => {
    const root = editor.root === null ? undefined : editor.entries.value.get(editor.root)
    if (root?.resource?.kind !== 'galgame' || route.path.endsWith('/preview')) return null
    const { save: _save, ...query } = route.query
    return { path: `${route.path.replace(/\/$/, '')}/preview`, query }
  })
  const values = computed(() => ({
    note: editor.draft.value.note,
    url: editor.draft.value.basis.url,
  }))
  const blocked = computed(
    () =>
      problems.value.length > 0 ||
      Boolean(flow.check.value?.violations.length || flow.check.value?.locked.length) ||
      !editor.count.value,
  )

  function refresh() {
    if (open.value && editor.count.value) void flow.inspect()
  }
  watch(open, refresh, { immediate: true })
  watchDebounced(() => editor.draft.value, refresh, { debounce: 600, deep: true })

  async function submit() {
    if (blocked.value) return
    if (flow.check.value?.conflicts.length) {
      conflicting.value = true
      return
    }
    if (await flow.save()) open.value = false
  }

  async function resolved() {
    await flow.inspect()
    if (!flow.check.value?.conflicts.length) await submit()
  }
</script>

<template>
  <Drawer v-model:open="open" title="保存修改" size="lg" :locked="flow.saving.value">
    <template #content>
      <Stack gap="lg">
        <WikiSaveProblems :problems="problems" :check="flow.check.value" />
        <WikiSaveChanges />
        <Link v-if="preview" :as="NuxtLink" :to="preview" class="self-start text-sm">
          预览游戏页
        </Link>
        <Form
          ref="form"
          :values="values"
          :rules="saveSchema"
          :disabled="flow.saving.value"
          @submit="submit"
        >
          <FormField name="note" label="编辑说明">
            <Textarea
              :model-value="values.note"
              :min-rows="2"
              @update:model-value="value => editor.note(String(value))"
            />
          </FormField>
          <FormField name="url" label="依据">
            <template #label>
              <Inline gap="xs" align="center" as="span">
                依据
                <WikiFieldRule label="依据" :clauses="['A.13.8', 'A.2.1.6']" />
              </Inline>
            </template>
            <WikiSaveBasis />
          </FormField>
        </Form>
      </Stack>
    </template>
    <template #footer>
      <Checkbox v-model="flow.watching.value" class="me-auto">关注修改过的条目</Checkbox>
      <Button variant="ghost" tone="neutral" :disabled="flow.saving.value" @click="open = false">
        取消
      </Button>
      <Button
        :loading="flow.saving.value || flow.checking.value"
        :disabled="blocked"
        @click="form?.submit()"
      >
        保存
      </Button>
    </template>
  </Drawer>
  <WikiSaveConflict
    v-model:open="conflicting"
    :conflicts="flow.check.value?.conflicts ?? []"
    @resolved="resolved"
  />
</template>

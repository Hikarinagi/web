<script setup lang="ts">
  import {
    Button,
    Dialog,
    Form,
    FormField,
    Heading,
    IconButton,
    Inline,
    Input,
    Skeleton,
    Stack,
    Text,
    toast,
  } from '@hina-ui/vue'
  import { Plus, X } from '@lucide/vue'
  import { creditsSchema, type CreditsValues } from '~/features/workbench/schemas/workbench.schema'
  import { getFieldErrors } from '~/utils/api/error'
  import type { WorkbenchProjectPageData } from '~~/server/api/pages/create/projects/[id].get'

  const props = defineProps<{ project: WorkbenchProjectPageData['project'] }>()
  const open = defineModel<boolean>('open', { required: true })
  const emit = defineEmits<{ saved: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const preview = ref<{ role: string; names: string }[] | null>(null)
  const values = reactive<CreditsValues>({ lines: [] })
  const manage = computed(
    () =>
      props.project.viewer_capabilities.includes('manage') &&
      ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status),
  )

  async function load() {
    preview.value = null
    const data = await hikariRequest('/api/v3/novel-projects/{project_id}/credits', {
      path: { project_id: props.project.id },
      toast: false,
    }).catch(() => ({ lines: [] }))
    preview.value = data.lines.slice(0, data.lines.length - props.project.credits.length)
  }

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    values.lines = props.project.credits.map(line => ({ ...line }))
    void load()
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      await hikariRequest('/api/v3/novel-projects/{project_id}', {
        method: 'patch',
        path: { project_id: props.project.id },
        body: {
          credits: values.lines.map(line => ({ role: line.role.trim(), names: line.names.trim() })),
        },
      })
      toast.success('已保存')
      open.value = false
      emit('saved')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:open="open"
    title="制作信息"
    description="发布时，此信息将写入电子书的制作信息页面。翻译、校对和录入的署名是从记录中自动生成的。"
    size="md"
    :locked="submitting"
  >
    <template #content>
      <Stack gap="lg">
        <Stack v-if="!preview" gap="xs">
          <Skeleton v-for="index in 2" :key="index" class="h-5" />
        </Stack>
        <Stack v-else gap="xs">
          <Text v-for="line in preview" :key="line.role" size="sm">
            <Text as="span" size="sm" tone="muted">{{ line.role }}：</Text>{{ line.names }}
          </Text>
        </Stack>
        <Stack gap="sm">
          <Heading :level="3" size="sm">其他贡献者</Heading>
          <Form
            ref="form"
            :values="values"
            :rules="creditsSchema"
            :disabled="submitting || !manage"
            @submit="onSubmit"
          >
            <Stack gap="sm">
              <Inline
                v-for="(line, index) in values.lines"
                :key="index"
                gap="sm"
                align="start"
                :wrap="false"
              >
                <FormField :name="`lines.${index}.role`" class="w-32 shrink-0">
                  <Input v-model="line.role" placeholder="例如：图源" aria-label="职责" />
                </FormField>
                <FormField :name="`lines.${index}.names`" class="min-w-0 flex-1">
                  <Input
                    v-model="line.names"
                    placeholder="多个署名之间用、分隔"
                    aria-label="署名"
                  />
                </FormField>
                <IconButton
                  v-if="manage"
                  label="删除这一行"
                  variant="ghost"
                  tone="neutral"
                  @click="values.lines.splice(index, 1)"
                >
                  <X />
                </IconButton>
              </Inline>
              <Button
                v-if="manage && values.lines.length < 10"
                variant="ghost"
                size="sm"
                class="self-start"
                @click="values.lines.push({ role: '', names: '' })"
              >
                <template #icon><Plus /></template>
                添加一行
              </Button>
            </Stack>
          </Form>
        </Stack>
      </Stack>
    </template>
    <template v-if="manage" #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">保存</Button>
    </template>
  </Dialog>
</template>

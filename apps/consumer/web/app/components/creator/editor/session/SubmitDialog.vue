<script setup lang="ts">
  import {
    Alert,
    Button,
    Dialog,
    Form,
    FormField,
    Inline,
    Stack,
    Tag,
    Text,
    Textarea,
  } from '@hina-ui/vue'
  import {
    ENTITY_RESOURCE_TYPE,
    WORKSPACE_SESSION_KEY,
    type WorkspaceMember,
  } from '~/features/creator/composables/useWorkspaceSession'
  import { RESOURCE_TYPE_LABEL } from '~/features/creator/labels'
  import { editorSubmitSchema } from '~/features/creator/schemas/editor-submit.schema'

  const props = defineProps<{ workResourceType: string }>()

  const session = inject(WORKSPACE_SESSION_KEY)!

  const workLabel = computed(
    () => RESOURCE_TYPE_LABEL[props.workResourceType] ?? props.workResourceType,
  )

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive({ summary: '' })

  const workChangeset = ref<Record<string, unknown>[]>([])
  const members = ref<WorkspaceMember[]>([])
  watchEffect(() => {
    if (!session.dialogOpen.value) return
    workChangeset.value = session.workChangeset.value as unknown as Record<string, unknown>[]
    members.value = [...session.memberList.value]
  })

  watch(session.dialogOpen, next => {
    if (next) return
    form.value?.reset()
    values.summary = ''
  })

  const sectionCount = computed(
    () => members.value.length + (workChangeset.value.length > 0 ? 1 : 0),
  )

  function memberKey(member: WorkspaceMember) {
    return `${member.target}:${member.id}`
  }

  function memberQueued(member: WorkspaceMember) {
    return member.needsReview || member.openChangeRequestId != null
  }

  const workQueued = computed(() => session.workNeedsReview.value || session.workAdopted)

  function onSubmit() {
    void session.submit(values.summary.trim()).catch(() => {})
  }
</script>

<template>
  <Dialog
    v-model:open="session.dialogOpen.value"
    title="确认提交本次会话的变更"
    size="2xl"
    :locked="session.submitting.value"
  >
    <template #content>
      <Stack gap="md">
        <Text size="sm" tone="muted">
          共 {{ sectionCount }} 个条目的修改将作为一批提交，各自生成独立的变更请求
        </Text>

        <Stack gap="md">
          <Stack v-if="workChangeset.length" as="section" gap="sm">
            <Inline as="h3" gap="sm" align="center" :wrap="false">
              <Text as="span" size="sm" weight="semibold">{{ workLabel }}</Text>
              <Tag size="sm" :tone="workQueued ? 'warning' : 'success'">
                {{ workQueued ? '将进入审核' : '将即时生效' }}
              </Tag>
            </Inline>
            <Alert :open="Boolean(session.itemErrors.value.work)" tone="danger">
              {{ session.itemErrors.value.work }}
            </Alert>
            <CreatorChangesetView :payload="workChangeset" :resource-type="workResourceType" />
          </Stack>

          <Stack v-for="member in members" :key="memberKey(member)" as="section" gap="sm">
            <Inline as="h3" gap="sm" align="center" :wrap="false">
              <Text as="span" size="sm" tone="muted">
                {{ RESOURCE_TYPE_LABEL[ENTITY_RESOURCE_TYPE[member.target]] }}
              </Text>
              <Text as="span" size="sm" weight="semibold">
                {{ member.name || `#${member.id}` }}
              </Text>
              <Tag size="sm" :tone="memberQueued(member) ? 'warning' : 'success'">
                {{ memberQueued(member) ? '将进入审核' : '将即时生效' }}
              </Tag>
            </Inline>
            <Alert :open="Boolean(session.itemErrors.value[memberKey(member)])" tone="danger">
              {{ session.itemErrors.value[memberKey(member)] }}
            </Alert>
            <CreatorChangesetView
              :payload="member.changeset as unknown as Record<string, unknown>[]"
              :resource-type="ENTITY_RESOURCE_TYPE[member.target]"
            />
          </Stack>
        </Stack>

        <Form
          ref="form"
          :values="values"
          :rules="editorSubmitSchema"
          :disabled="session.submitting.value"
          @submit="onSubmit"
        >
          <FormField name="summary" label="变更说明" required>
            <Textarea
              v-model="values.summary"
              autosize
              placeholder="一句话说明本次会话修改了什么"
            />
          </FormField>
        </Form>
      </Stack>
    </template>

    <template #footer>
      <Button
        variant="ghost"
        tone="neutral"
        :disabled="session.submitting.value"
        @click="session.dialogOpen.value = false"
      >
        取消
      </Button>
      <Button :loading="session.submitting.value" @click="form?.submit()">确认提交</Button>
    </template>
  </Dialog>
</template>

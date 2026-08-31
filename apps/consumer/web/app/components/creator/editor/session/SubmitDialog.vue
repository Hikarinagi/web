<script setup lang="ts">
  import Form, { type FormSubmitEvent } from '@primevue/forms/form'
  import {
    ENTITY_RESOURCE_TYPE,
    WORKSPACE_SESSION_KEY,
    type WorkspaceMember,
  } from '~/features/creator/composables/useWorkspaceSession'
  import { RESOURCE_TYPE_LABEL } from '~/features/creator/labels'
  import {
    editorSubmitResolver,
    type EditorSubmitValues,
  } from '~/features/creator/schemas/editor-submit.schema'

  const props = defineProps<{ workResourceType: string }>()

  const session = inject(WORKSPACE_SESSION_KEY)!

  const workLabel = computed(
    () => RESOURCE_TYPE_LABEL[props.workResourceType] ?? props.workResourceType,
  )

  const workChangeset = ref<Record<string, unknown>[]>([])
  const members = ref<WorkspaceMember[]>([])
  watchEffect(() => {
    if (!session.dialogOpen.value) return
    workChangeset.value = session.workChangeset.value as unknown as Record<string, unknown>[]
    members.value = [...session.memberList.value]
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

  function onSubmit(event: FormSubmitEvent) {
    if (!event.valid) return
    void session.submit((event.values as EditorSubmitValues).summary).catch(() => {})
  }
</script>

<template>
  <Dialog
    v-model:visible="session.dialogOpen.value"
    modal
    header="确认提交本次会话的变更"
    :dismissable-mask="!session.submitting.value"
    :close-on-escape="!session.submitting.value"
    :style="{ width: '92vw', maxWidth: '44rem' }"
  >
    <div class="flex flex-col gap-5">
      <p class="text-sm text-muted-color">
        共 {{ sectionCount }} 个条目的修改将作为一批提交，各自生成独立的变更请求
      </p>

      <ScrollArea class="max-h-[50vh]">
        <div class="flex flex-col gap-4 pr-1">
          <section v-if="workChangeset.length" class="flex flex-col gap-2">
            <h3 class="flex items-center gap-2 text-sm font-semibold">
              {{ workLabel }}
              <Tag
                :severity="workQueued ? 'warn' : 'success'"
                :value="workQueued ? '将进入审核' : '将即时生效'"
                class="text-[10px]!"
              />
            </h3>
            <Message
              v-if="session.itemErrors.value.work"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ session.itemErrors.value.work }}
            </Message>
            <CreatorChangesetView :payload="workChangeset" :resource-type="workResourceType" />
          </section>

          <section v-for="member in members" :key="memberKey(member)" class="flex flex-col gap-2">
            <h3 class="flex items-center gap-2 text-sm font-semibold">
              <span class="text-muted-color">
                {{ RESOURCE_TYPE_LABEL[ENTITY_RESOURCE_TYPE[member.target]] }}
              </span>
              {{ member.name || `#${member.id}` }}
              <Tag
                :severity="memberQueued(member) ? 'warn' : 'success'"
                :value="memberQueued(member) ? '将进入审核' : '将即时生效'"
                class="text-[10px]!"
              />
            </h3>
            <Message
              v-if="session.itemErrors.value[memberKey(member)]"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ session.itemErrors.value[memberKey(member)] }}
            </Message>
            <CreatorChangesetView
              :payload="member.changeset as unknown as Record<string, unknown>[]"
              :resource-type="ENTITY_RESOURCE_TYPE[member.target]"
            />
          </section>
        </div>
      </ScrollArea>

      <Form :resolver="editorSubmitResolver" class="flex flex-col gap-3" @submit="onSubmit">
        <FormItem v-slot="{ id }" name="summary" label="变更说明" required>
          <Textarea :id="id" rows="3" placeholder="一句话说明本次会话修改了什么" fluid />
        </FormItem>

        <div class="flex justify-end gap-3">
          <Button
            label="取消"
            severity="secondary"
            :disabled="session.submitting.value"
            @click="session.dialogOpen.value = false"
          />
          <Button label="确认提交" type="submit" :loading="session.submitting.value" />
        </div>
      </Form>
    </div>
  </Dialog>
</template>

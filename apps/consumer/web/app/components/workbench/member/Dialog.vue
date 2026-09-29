<script setup lang="ts">
  import {
    Button,
    Dialog,
    Form,
    FormField,
    IconButton,
    Inline,
    Select,
    Skeleton,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import type { ApiData, components } from '@hikarinagi/api-contract/v3'
  import { X } from '@lucide/vue'
  import { MEMBER_ROLE_OPTIONS, PROJECT_ROLE_LABEL } from '~/features/workbench/labels'
  import { MANGA_MEMBER_ROLE_OPTIONS, MANGA_ROLE_LABEL } from '~/features/workbench/manga/labels'
  import {
    projectMemberSchema,
    type ProjectMemberValues,
  } from '~/features/workbench/schemas/workbench.schema'
  import { getFieldErrors } from '~/utils/api/error'
  import { displayName } from '~/utils/user'

  type Member =
    | ApiData<'/api/v3/novel-projects/{project_id}/members', 'get'>[number]
    | ApiData<'/api/v3/manga-projects/{project_id}/members', 'get'>[number]

  const props = defineProps<{
    kind: 'novel' | 'manga'
    project: {
      id: number
      owner: components['schemas']['UserRefDto']
      viewer_capabilities: readonly string[]
    }
  }>()
  const open = defineModel<boolean>('open', { required: true })

  const { confirm } = useHikariConfirm()
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const members = ref<Member[] | null>(null)
  const busy = ref(false)
  const values = reactive<{ user_id: number | null; role: ProjectMemberValues['role'] }>({
    user_id: null,
    role: 'TRANSLATOR',
  })

  const manage = computed(() => props.project.viewer_capabilities.includes('manage'))
  const roleLabel = computed<Record<string, string>>(() =>
    props.kind === 'manga' ? MANGA_ROLE_LABEL : PROJECT_ROLE_LABEL,
  )
  const roleOptions = computed(() =>
    props.kind === 'manga' ? MANGA_MEMBER_ROLE_OPTIONS : MEMBER_ROLE_OPTIONS,
  )
  const note = computed(() =>
    props.kind === 'manga'
      ? '协作者可以根据自己的角色处理本章。管理还可以上传页面并提交审核。'
      : '协作者可以翻译和编辑此卷。管理还可以导入正文、编辑章节并提交审核。',
  )

  async function load() {
    const path = { project_id: props.project.id }
    members.value = await (
      props.kind === 'manga'
        ? hikariRequest('/api/v3/manga-projects/{project_id}/members', { path, toast: false })
        : hikariRequest('/api/v3/novel-projects/{project_id}/members', { path, toast: false })
    ).catch(() => [])
  }

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    values.user_id = null
    values.role = 'TRANSLATOR'
    void load()
  })

  async function run(task: () => Promise<unknown>) {
    if (busy.value) return
    busy.value = true
    try {
      await task()
      await load()
    } finally {
      busy.value = false
    }
  }

  async function onAdd() {
    if (values.user_id === null) return
    const body = { user_id: values.user_id, role: values.role as 'MANAGER' }
    const path = { project_id: props.project.id }
    try {
      await run(() =>
        props.kind === 'manga'
          ? hikariRequest('/api/v3/manga-projects/{project_id}/members', {
              method: 'post',
              path,
              body,
            })
          : hikariRequest('/api/v3/novel-projects/{project_id}/members', {
              method: 'post',
              path,
              body,
            }),
      )
      form.value?.reset()
      values.user_id = null
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    }
  }

  function changeRole(userId: number, role: string) {
    const path = { project_id: props.project.id, user_id: userId }
    const body = { role: role as 'MANAGER' }
    void run(() =>
      props.kind === 'manga'
        ? hikariRequest('/api/v3/manga-projects/{project_id}/members/{user_id}', {
            method: 'patch',
            path,
            body,
          })
        : hikariRequest('/api/v3/novel-projects/{project_id}/members/{user_id}', {
            method: 'patch',
            path,
            body,
          }),
    )
  }

  function remove(member: Member) {
    confirm({
      title: '移除协作者',
      description: `从协作者中移除 ${displayName(member.user)}？他们写的译文将被保留。`,
      confirmText: '移除',
      cancelText: '取消',
      tone: 'danger',
      onConfirm: () => {
        const path = { project_id: props.project.id, user_id: member.user.id }
        return run(() =>
          props.kind === 'manga'
            ? hikariRequest('/api/v3/manga-projects/{project_id}/members/{user_id}', {
                method: 'delete',
                path,
              })
            : hikariRequest('/api/v3/novel-projects/{project_id}/members/{user_id}', {
                method: 'delete',
                path,
              }),
        )
      },
    })
  }
</script>

<template>
  <Dialog v-model:open="open" title="协作者" :description="note" size="md">
    <template #content>
      <Stack gap="lg">
        <Form
          v-if="manage"
          ref="form"
          :values="values"
          :rules="projectMemberSchema"
          :disabled="busy"
          @submit="onAdd"
        >
          <Inline gap="sm" align="end" :wrap="false">
            <FormField name="user_id" label="用户" class="min-w-0 flex-1">
              <WorkbenchUserPicker v-model="values.user_id" />
            </FormField>
            <FormField name="role" label="角色" class="w-32 shrink-0">
              <Select v-model="values.role" :options="roleOptions" />
            </FormField>
            <Button :loading="busy" class="shrink-0" @click="form?.submit()">添加</Button>
          </Inline>
        </Form>
        <Stack v-if="!members" gap="sm">
          <Skeleton v-for="index in 3" :key="index" class="h-10" />
        </Stack>
        <Stack v-else gap="none" class="divide-y divide-line">
          <Inline gap="sm" align="center" :wrap="false" class="py-3">
            <Avatar :user="project.owner" card class="size-9! shrink-0" />
            <UserName :user="project.owner" class="min-w-0 flex-1 text-sm font-medium" />
            <Tag size="sm" tone="accent" variant="soft">{{ roleLabel.OWNER }}</Tag>
          </Inline>
          <Inline
            v-for="member in members"
            :key="member.user.id"
            gap="sm"
            align="center"
            :wrap="false"
            class="py-3"
          >
            <Avatar :user="member.user" card class="size-9! shrink-0" />
            <UserName :user="member.user" class="min-w-0 flex-1 text-sm font-medium" />
            <template v-if="manage">
              <Select
                :model-value="member.role"
                :options="roleOptions"
                size="sm"
                class="w-28 shrink-0"
                :disabled="busy"
                aria-label="角色"
                @update:model-value="role => changeRole(member.user.id, String(role))"
              />
              <IconButton
                label="移除协作者"
                variant="ghost"
                tone="danger"
                size="sm"
                class="shrink-0"
                :disabled="busy"
                @click="remove(member)"
              >
                <X />
              </IconButton>
            </template>
            <Text v-else size="xs" tone="muted" class="shrink-0">
              {{ roleLabel[member.role] }}
            </Text>
          </Inline>
        </Stack>
      </Stack>
    </template>
  </Dialog>
</template>

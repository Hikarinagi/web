<script setup lang="ts">
  import { Button, Inline, Tag, toast } from '@hina-ui/vue'

  const props = defineProps<{
    kind: 'novel' | 'manga'
    project: {
      id: number
      mode: string
      status: string
      viewer_role: string | null
      viewer_reviewer: boolean
      viewer_capabilities: readonly string[]
      pending_changes?: boolean
    }
    blocker: string
  }>()
  const emit = defineEmits<{ changed: [] }>()

  const COPY = {
    novel: {
      TRANSLATION:
        '在提交之前，系统会检查每个段落是否都有通过质量检查的所选译文。批准后，译文将添加到分卷页面。',
      ENTRY: '批准后，文本将转换为电子书并添加到分卷页面。',
      approve: '审核通过后，立即生成电子书，并添加到分卷页面中，供读者在线阅读。',
    },
    manga: {
      TRANSLATION: '每个页面都需要上传或生成的成品图。一旦获得批准，该投稿将成为本章的首选来源。',
      UPLOAD: '审核通过后，上传的图片将作为本章发布，读者可以在线阅读。',
      approve: '批准后，立即将页面发布到本章，读者可以在线阅读。',
    },
  }

  const { confirm } = useHikariConfirm()
  const busy = ref(false)
  const rejectOpen = ref(false)
  const copy = computed(() => COPY[props.kind] as Record<string, string>)
  const manage = computed(() => props.project.viewer_capabilities.includes('manage'))
  const owner = computed(() => props.project.viewer_role === 'OWNER')
  const editable = computed(() => ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status))
  const shelved = computed(() => ['STALE', 'ARCHIVED'].includes(props.project.status))
  const published = computed(() => props.project.status === 'PUBLISHED')
  const settled = computed(() => published.value && props.project.pending_changes === false)
  const submitLabel = computed(() => (published.value ? '提交更新' : '提交审核'))

  async function run(action: 'submit' | 'withdraw' | 'approve' | 'restore', done: string) {
    if (busy.value) return
    busy.value = true
    try {
      const request = { method: 'post' as const, path: { project_id: props.project.id } }
      const novel = props.kind === 'novel'
      if (action === 'submit') {
        await (novel
          ? hikariRequest('/api/v3/novel-projects/{project_id}/submit', request)
          : hikariRequest('/api/v3/manga-projects/{project_id}/submit', request))
      } else if (action === 'withdraw') {
        await (novel
          ? hikariRequest('/api/v3/novel-projects/{project_id}/withdraw', request)
          : hikariRequest('/api/v3/manga-projects/{project_id}/withdraw', request))
      } else if (action === 'approve') {
        await (novel
          ? hikariRequest('/api/v3/novel-projects/{project_id}/approve', request)
          : hikariRequest('/api/v3/manga-projects/{project_id}/approve', request))
      } else {
        await (novel
          ? hikariRequest('/api/v3/novel-projects/{project_id}/restore', request)
          : hikariRequest('/api/v3/manga-projects/{project_id}/restore', request))
      }
      toast.success(done)
      emit('changed')
    } finally {
      busy.value = false
    }
  }

  function confirmSubmit() {
    confirm({
      title: submitLabel.value,
      description: copy.value[props.project.mode] ?? '',
      confirmText: '提交',
      cancelText: '取消',
      onConfirm: () => run('submit', '已提交审核'),
    })
  }

  function confirmApprove() {
    confirm({
      title: '通过并发布',
      description: copy.value.approve ?? '',
      confirmText: '通过',
      cancelText: '取消',
      onConfirm: () => run('approve', '已通过并发布'),
    })
  }
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false">
    <template v-if="project.status === 'REVIEW'">
      <template v-if="project.viewer_reviewer">
        <Button size="sm" variant="soft" tone="danger" :disabled="busy" @click="rejectOpen = true">
          退回
        </Button>
        <Button size="sm" :loading="busy" @click="confirmApprove">通过</Button>
      </template>
      <Button
        v-else-if="manage"
        size="sm"
        variant="soft"
        :loading="busy"
        @click="run('withdraw', '已撤回审核')"
      >
        撤回审核
      </Button>
    </template>
    <Button
      v-else-if="shelved && owner"
      size="sm"
      :loading="busy"
      @click="run('restore', '已恢复')"
    >
      恢复
    </Button>
    <Tag
      v-else-if="settled"
      v-tooltip="'自上次发布以来没有任何更改。'"
      size="sm"
      tone="success"
      variant="soft"
    >
      已发布
    </Tag>
    <Inline v-else-if="manage && editable" v-tooltip="blocker || null" as="span">
      <Button size="sm" :loading="busy" :disabled="!!blocker" @click="confirmSubmit">
        {{ submitLabel }}
      </Button>
    </Inline>
    <WorkbenchProjectRejectDialog
      v-model:visible="rejectOpen"
      :kind="kind"
      :project-id="project.id"
      @rejected="emit('changed')"
    />
  </Inline>
</template>

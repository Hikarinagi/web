<script setup lang="ts">
  import { Layers, X } from '@lucide/vue'
  import {
    WORKSPACE_SESSION_KEY,
    type WorkspaceMember,
  } from '~/features/creator/composables/useWorkspaceSession'
  import { RESOURCE_TYPE_LABEL } from '~/features/creator/labels'

  const session = inject(WORKSPACE_SESSION_KEY)!
  const confirm = useConfirm()

  const TARGET_LABEL: Record<WorkspaceMember['target'], string> = {
    person: RESOURCE_TYPE_LABEL.PERSON ?? '人物',
    producer: RESOURCE_TYPE_LABEL.PRODUCER ?? '厂商',
    character: RESOURCE_TYPE_LABEL.CHARACTER ?? '角色',
  }

  function confirmDiscard(member: WorkspaceMember) {
    confirm.require({
      group: 'app-shell',
      header: '丢弃暂存修改',
      message: `确定丢弃「${member.name || `#${member.id}`}」的 ${member.changeset.length} 项暂存修改？`,
      acceptLabel: '丢弃',
      rejectLabel: '取消',
      onAccept: ({ close }) => {
        session.discard(member.target, member.id)
        close()
      },
    })
  }
</script>

<template>
  <div
    v-if="session.memberList.value.length"
    class="flex flex-wrap items-center gap-2 rounded-lg border border-surface px-3 py-2 bg-emphasis"
  >
    <span class="flex items-center gap-1.5 text-xs text-muted-color">
      <Layers :size="13" />
      本次会话暂存
    </span>
    <span
      v-for="member in session.memberList.value"
      :key="`${member.target}:${member.id}`"
      class="inline-flex items-center gap-1 rounded-full border border-surface bg-surface-0 py-0.5 pr-1 pl-2.5 text-xs dark:bg-surface-900"
    >
      <Button
        unstyled
        class="inline-flex items-center gap-1 hover:text-color"
        :aria-label="`编辑 ${member.name}`"
        @click="session.open(member.target, member.id)"
      >
        <span class="text-muted-color">{{ TARGET_LABEL[member.target] }}</span>
        <span class="max-w-32 truncate font-medium">{{ member.name || `#${member.id}` }}</span>
        <span class="text-muted-color">{{ member.changeset.length }} 项</span>
      </Button>
      <Button
        unstyled
        class="flex size-4.5 items-center justify-center rounded-full text-muted-color transition-colors hover:bg-surface-100 hover:text-red-500 dark:hover:bg-surface-800"
        aria-label="丢弃暂存"
        @click="confirmDiscard(member)"
      >
        <template #icon><X :size="12" /></template>
      </Button>
    </span>
  </div>
</template>

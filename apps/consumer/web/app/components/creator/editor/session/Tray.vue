<script setup lang="ts">
  import { Card, Chip, IconButton, Inline, Text } from '@hina-ui/vue'
  import { Layers, X } from '@lucide/vue'
  import {
    WORKSPACE_SESSION_KEY,
    type WorkspaceMember,
  } from '~/features/creator/composables/useWorkspaceSession'
  import { RESOURCE_TYPE_LABEL } from '~/features/creator/labels'

  const session = inject(WORKSPACE_SESSION_KEY)!
  const { confirm } = useHikariConfirm()

  const TARGET_LABEL: Record<WorkspaceMember['target'], string> = {
    person: RESOURCE_TYPE_LABEL.PERSON ?? '人物',
    producer: RESOURCE_TYPE_LABEL.PRODUCER ?? '厂商',
    character: RESOURCE_TYPE_LABEL.CHARACTER ?? '角色',
  }

  function confirmDiscard(member: WorkspaceMember) {
    confirm({
      title: '丢弃暂存修改',
      description: `确定丢弃「${member.name || `#${member.id}`}」的 ${member.changeset.length} 项暂存修改？`,
      confirmText: '丢弃',
      cancelText: '取消',
      tone: 'danger',
      onConfirm: () => session.discard(member.target, member.id),
    })
  }
</script>

<template>
  <Card v-if="session.memberList.value.length" :padded="false" class="bg-subtle">
    <Inline gap="sm" align="center" class="px-3 py-2">
      <Inline gap="xs" align="center" :wrap="false">
        <Layers class="size-3.5 shrink-0 text-muted" aria-hidden="true" />
        <Text as="span" size="xs" tone="muted">本次会话暂存</Text>
      </Inline>

      <Inline
        v-for="member in session.memberList.value"
        :key="`${member.target}:${member.id}`"
        gap="xs"
        align="center"
        :wrap="false"
      >
        <Chip
          as="button"
          variant="outline"
          size="sm"
          :aria-label="`编辑 ${member.name || `#${member.id}`}`"
          @click="session.open(member.target, member.id)"
        >
          <Inline gap="xs" align="center" :wrap="false">
            <Text as="span" size="xs" tone="muted">{{ TARGET_LABEL[member.target] }}</Text>
            <Text as="span" size="xs" weight="medium" truncate class="max-w-32">
              {{ member.name || `#${member.id}` }}
            </Text>
            <Text as="span" size="xs" tone="muted">{{ member.changeset.length }} 项</Text>
          </Inline>
        </Chip>
        <IconButton
          label="丢弃暂存"
          tooltip
          variant="ghost"
          tone="danger"
          size="sm"
          class="shrink-0"
          @click="confirmDiscard(member)"
        >
          <X />
        </IconButton>
      </Inline>
    </Inline>
  </Card>
</template>

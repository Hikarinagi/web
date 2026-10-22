<script setup lang="ts">
  import { Alert, Button, Inline, Panel, Spinner, Stack, Tag, Text, toast } from '@hina-ui/vue'
  import { timeBrief } from '#imports'
  import { ScanSearch } from '@lucide/vue'
  import {
    isFailed,
    isRunning,
    type CheckEntityChoice,
    type CheckOverride,
  } from '~/features/creator/check'
  import type { BackendChangeRequestDetail } from '~/features/creator/contribution'

  const props = defineProps<{
    changeRequest: BackendChangeRequestDetail
    mode: 'review' | 'correct' | 'view'
    overrides: CheckOverride[]
    entityChoices: CheckEntityChoice[]
  }>()
  const fields = defineModel<Record<string, 'request' | 'original'>>('fields', { required: true })
  const entities = defineModel<Record<number, 'existing' | 'new'>>('entities', { required: true })
  const emit = defineEmits<{ changed: [] }>()

  const check = computed(() => props.changeRequest.check)
  const verification = computed(() =>
    check.value?.status === 'DONE' ? (check.value.verification ?? null) : null,
  )
  const identified = computed(() => {
    const identity = verification.value?.identity
    return !!identity?.verified && (identity.kind === 'site' || identity.kind === 'pending')
  })
  const verifiedFields = computed(() =>
    (verification.value?.fields ?? []).filter(field => field.verified),
  )
  const unverifiedFields = computed(() =>
    (verification.value?.fields ?? []).filter(field => !field.verified),
  )
  const chosen = computed(() => props.overrides.length + props.entityChoices.length)
  const suggested = computed(() =>
    (verification.value?.entities ?? []).filter(
      entity => entity.verified && entity.existing_id != null,
    ),
  )
  const correctable = computed(
    () =>
      (!identified.value && verifiedFields.value.some(field => !field.applied)) ||
      suggested.value.some(entity => !entity.applied),
  )
  const settled = computed(
    () =>
      !correctable.value &&
      (verifiedFields.value.some(field => field.applied) ||
        suggested.value.some(entity => entity.applied)),
  )

  const rerunning = ref(false)
  const correcting = ref(false)

  async function rerun() {
    if (rerunning.value) return
    rerunning.value = true
    try {
      await hikariRequest('/api/v3/change-requests/{id}/checks', {
        method: 'POST',
        path: { id: props.changeRequest.id },
      })
      emit('changed')
    } finally {
      rerunning.value = false
    }
  }

  async function correct() {
    if (correcting.value || chosen.value === 0) return
    correcting.value = true
    try {
      const created = await hikariRequest('/api/v3/change-requests/{id}/corrections', {
        method: 'POST',
        path: { id: props.changeRequest.id },
        body: { overrides: props.overrides, entity_choices: props.entityChoices },
      })
      toast.success(`修正已作为变更请求 #${created.id} 提交。`)
      emit('changed')
    } finally {
      correcting.value = false
    }
  }
</script>

<template>
  <Panel
    v-if="check"
    title="核对"
    :description="
      changeRequest.check_root
        ? `与同批的 #${changeRequest.check_root.change_request_id}《${changeRequest.check_root.title}》一并核对`
        : check.finished_at && verification
          ? `完成于 ${timeBrief(check.finished_at)}`
          : undefined
    "
  >
    <template #icon><ScanSearch /></template>
    <template #actions>
      <Button
        v-if="mode !== 'view' && !isRunning(check)"
        variant="ghost"
        tone="neutral"
        size="sm"
        :loading="rerunning"
        @click="rerun"
      >
        重新核对
      </Button>
    </template>

    <Stack gap="md">
      <Inline v-if="isRunning(check)" gap="sm" align="center">
        <Spinner size="sm" />
        <Text size="sm" tone="muted">正在查找原版。通常用时不到两分钟。</Text>
      </Inline>
      <Alert :open="isFailed(check)" tone="danger" title="未能核对">
        核对在完成前已停止。你可以照常审核此变更请求，或重新核对。
      </Alert>
      <template v-if="verification">
        <Tag
          v-if="!identified && verification.mismatches"
          size="sm"
          tone="warning"
          class="self-start"
        >
          与原版不符 {{ verification.mismatches }} 处
        </Tag>
        <Text weight="medium">{{ verification.summary }}</Text>
        <CreatorReviewCheckEvidence
          :evidence="verification.evidence"
          :resource-type="changeRequest.resource_type"
        />
        <CreatorReviewCheckEntities
          v-model:choices="entities"
          :entities="verification.entities"
          :selectable="mode !== 'view'"
        />
        <CreatorReviewCheckFields
          v-if="!identified && verifiedFields.length"
          v-model:choices="fields"
          :fields="verifiedFields"
          :resource-type="changeRequest.resource_type"
          :selectable="mode !== 'view'"
        />
        <CreatorReviewCheckUnverified
          v-if="!identified"
          :fields="unverifiedFields"
          :resource-type="changeRequest.resource_type"
        />
        <CreatorReviewCheckSources :sources="verification.sources" />
        <Inline v-if="mode === 'correct' && correctable" justify="end">
          <Button :disabled="chosen === 0" :loading="correcting" @click="correct">
            按所选提交修正
          </Button>
        </Inline>
        <Text v-else-if="mode === 'correct' && settled" size="sm" tone="muted">
          条目已使用本次核对所核实的全部值。
        </Text>
        <Text v-if="mode === 'view' && identified" size="sm" tone="muted">
          审核员将作出决定。你也可以自行撤回。
        </Text>
      </template>
    </Stack>
  </Panel>
</template>

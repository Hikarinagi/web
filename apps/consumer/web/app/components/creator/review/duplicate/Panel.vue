<script setup lang="ts">
  import { Button, Grid, Inline, Link, Panel, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { CopyCheck } from '@lucide/vue'
  import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
  import {
    PUBLIC_PATH,
    isBlocking,
    isEntityType,
    levelText,
    reasonText,
    submittedFacts,
    type BackendDuplicateCandidate,
  } from '~/features/creator/duplicates'
  import {
    entityKind,
    onSite,
    sameEntryText,
    type CheckEntityChoice,
  } from '~/features/creator/check'
  import { RESOURCE_SLUG } from '~/features/creator/labels'

  const props = defineProps<{
    changeRequest: BackendChangeRequestDetail
    canReview: boolean
    entityChoices?: CheckEntityChoice[]
  }>()
  const emit = defineEmits<{ reviewed: [] }>()

  const verifiedId = computed(() => onSite(props.changeRequest.check)?.id ?? null)
  const candidates = computed(() =>
    props.changeRequest.duplicates
      .filter(item => isBlocking(item) || item.id === verifiedId.value)
      .sort((a, b) => Number(b.id === verifiedId.value) - Number(a.id === verifiedId.value))
      .slice(0, 3),
  )
  const replacing = computed(() => {
    const entities = props.changeRequest.check?.verification?.entities ?? []
    return (props.entityChoices ?? []).flatMap(choice => {
      const entity = entities.find(item => item.change_request_id === choice.change_request_id)
      return entity ? [{ name: entity.name, use_id: choice.use_id }] : []
    })
  })
  const verifiedText = computed(() =>
    isEntityType(props.changeRequest.resource_type)
      ? '核对已核实'
      : `核对已核实：${sameEntryText(props.changeRequest.resource_type)}`,
  )
  const rootNote = computed(() => {
    const root = props.changeRequest.check_root
    const id = verifiedId.value
    if (!root || id === null) return ''
    const kind = entityKind({ resource_type: props.changeRequest.resource_type, fields: [] })
    return `并入 #${id} 后，#${root.change_request_id} 将改用 #${id}，不会新建${kind}。`
  })
  const dismissed = computed(() => props.changeRequest.duplicate_check?.dismissed ?? [])
  const cols = computed(() => (candidates.value.length + 2) as 3 | 4 | 5)
  const facts = computed(() => [
    submittedFacts(
      RESOURCE_SLUG[props.changeRequest.resource_type] ?? '',
      props.changeRequest.payload,
      props.changeRequest.resource,
    ),
    ...candidates.value,
  ])

  const mergeTarget = ref<BackendDuplicateCandidate | null>(null)
  const mergeOpen = ref(false)
  const dismissing = ref<number | null>(null)

  function reasonsOf(item: BackendDuplicateCandidate) {
    const level = levelText(item.level, item.resource_type)
    return item.reasons.filter(reason => reasonText(reason, item.resource_type) !== level)
  }

  function openMerge(item: BackendDuplicateCandidate) {
    mergeTarget.value = item
    mergeOpen.value = true
  }

  async function dismiss(item: BackendDuplicateCandidate) {
    if (dismissing.value) return
    dismissing.value = item.id
    try {
      await hikariRequest('/api/v3/change-requests/{id}/duplicates/{candidate_id}/dismiss', {
        method: 'POST',
        path: { id: props.changeRequest.id, candidate_id: item.id },
      })
      emit('reviewed')
    } finally {
      dismissing.value = null
    }
  }
</script>

<template>
  <Panel v-if="candidates.length" title="疑似重复" :count="candidates.length">
    <template #icon><CopyCheck /></template>
    <Stack gap="md">
      <Grid :cols="cols" gap="sm" class="items-start">
        <Text as="span" size="sm" aria-hidden="true" />
        <Text size="sm" weight="medium">本次请求</Text>
        <Stack v-for="item in candidates" :key="item.id" gap="xs">
          <Inline gap="xs" align="center">
            <Link
              :as="NuxtLink"
              :to="`${PUBLIC_PATH[item.resource_type] ?? '/'}${item.id}`"
              target="_blank"
              class="font-mono"
            >
              #{{ item.id }}
            </Link>
            <Tag size="sm" tone="warning">{{ levelText(item.level, item.resource_type) }}</Tag>
            <Tag v-if="item.id === verifiedId" size="sm" tone="success">{{ verifiedText }}</Tag>
          </Inline>
          <Inline gap="xs">
            <Tag v-for="reason in reasonsOf(item)" :key="reason.kind" size="sm" tone="info">
              {{ reasonText(reason, item.resource_type) }}
            </Tag>
          </Inline>
          <Text size="xs" tone="muted">
            {{
              dismissed.includes(item.id) ? '已标记为不是重复条目' : '提交者未将其标记为不同作品。'
            }}
          </Text>
          <Text
            v-for="entity in item.id === verifiedId ? replacing : []"
            :key="entity.use_id"
            size="xs"
            tone="muted"
          >
            并入 #{{ item.id }} 后将改用 #{{ entity.use_id }}，而不会新建「{{ entity.name }}」。
          </Text>
          <Text v-if="item.id === verifiedId && rootNote" size="xs" tone="muted">{{
            rootNote
          }}</Text>
          <Inline v-if="canReview" gap="xs">
            <Button size="sm" @click="openMerge(item)">并入 #{{ item.id }}</Button>
            <Button
              v-if="!dismissed.includes(item.id)"
              variant="ghost"
              tone="neutral"
              size="sm"
              :loading="dismissing === item.id"
              @click="dismiss(item)"
            >
              不是重复条目
            </Button>
          </Inline>
        </Stack>
      </Grid>

      <CreatorReviewDuplicateCompare
        :resource-type="changeRequest.resource_type"
        :columns="facts"
      />
    </Stack>

    <CreatorReviewDuplicateMergeDialog
      v-if="mergeTarget"
      v-model:open="mergeOpen"
      :change-request="changeRequest"
      :target="mergeTarget"
      :entity-choices="entityChoices"
      @merged="emit('reviewed')"
    />
  </Panel>
</template>

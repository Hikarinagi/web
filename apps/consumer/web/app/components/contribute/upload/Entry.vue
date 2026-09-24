<script setup lang="ts">
  import { Button, IconButton, Inline, List, ListItem, Spinner, Stack, Text } from '@hina-ui/vue'
  import { FileText, X } from '@lucide/vue'
  import { intakeStatus } from '~/features/contribute/intake-status'
  import { useDeskSize } from '~/features/contribute/useDeskSize'
  import type { IntakeItem, IntakeVolume } from '~/features/contribute/useNovelIntake'
  import Picker from './Picker.vue'
  import Stamp from './Stamp.vue'

  const props = defineProps<{ item: IntakeItem; duplicate: boolean; locked: boolean }>()
  const emit = defineEmits<{
    remove: []
    pick: [volume: IntakeVolume]
    release: []
    retry: []
  }>()

  const { large, control, body, caption } = useDeskSize()
  const status = computed(() => intakeStatus(props.item, props.duplicate))
  const editable = computed(() => props.item.stage === 'ready' && !props.locked)
  const reasons = computed(() =>
    props.item.review?.status === 'REJECTED' ? props.item.review.reasons : [],
  )
</script>

<template>
  <Stack gap="xs" class="border-b border-line py-3 last:border-b-0">
    <Inline align="center" gap="sm" :wrap="false">
      <ContributeVolumeHead
        v-if="item.volume"
        :volume="item.volume"
        :large="large"
        class="flex-1"
      />
      <Inline v-else gap="sm" align="center" :wrap="false" class="min-w-0 flex-1">
        <FileText :class="cn('shrink-0', large ? 'size-5' : 'size-4')" aria-hidden="true" />
        <Text :size="body" weight="medium" truncate>{{ item.file.name }}</Text>
      </Inline>
      <Inline v-if="status.busy" gap="xs" align="center" :wrap="false" class="shrink-0">
        <Spinner :size="control" />
        <Text :size="caption" tone="muted">{{ status.label }}</Text>
      </Inline>
      <Stamp v-else :ink="status.ink" :label="status.label" />
      <IconButton
        v-if="editable || item.stage === 'failed'"
        :label="`移除 ${item.file.name}`"
        :size="control"
        variant="ghost"
        tone="neutral"
        @click="emit('remove')"
      >
        <X />
      </IconButton>
    </Inline>

    <Text v-if="item.volume" :size="caption" tone="faint" truncate>
      {{ item.file.name }} · {{ (item.file.size / 1048576).toFixed(1) }} MB
    </Text>
    <Text v-if="item.error" :size="caption" tone="muted">{{ item.error }}</Text>
    <Text v-else-if="status.hint" :size="caption" tone="muted">{{ status.hint }}</Text>
    <List v-if="reasons.length">
      <ListItem v-for="(reason, index) in reasons" :key="index">
        <Text as="span" :size="caption" tone="muted">{{ reason }}</Text>
      </ListItem>
    </List>

    <Picker
      v-if="editable && item.verdict === 'unknown'"
      :filename="item.file.name"
      :suggestion="item.suggestion"
      @pick="emit('pick', $event)"
    />
    <Inline v-else-if="editable && item.verdict === 'missing' && !duplicate" justify="end">
      <Button :size="control" variant="ghost" tone="neutral" @click="emit('release')">
        重新选择
      </Button>
    </Inline>
    <Inline v-else-if="item.stage === 'failed' && !locked" justify="end">
      <Button :size="control" variant="soft" tone="neutral" @click="emit('retry')">
        重新上传
      </Button>
    </Inline>
  </Stack>
</template>

<script setup lang="ts">
  import { Button, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { EyeOff } from '@lucide/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import {
    isLong,
    isUnpublished,
    qualifierText,
    statementText,
  } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryValue' })
  defineProps<{
    statement: BackendStatement
    definition: BackendPropertyDefinition | undefined
    editable: boolean
    entryType?: string
  }>()
  defineEmits<{ edit: [] }>()
</script>

<template>
  <Inline gap="md" align="start" justify="between" :wrap="false">
    <Stack gap="xs" class="min-w-0 flex-1">
      <Inline gap="sm" align="center">
        <Text
          as="span"
          size="sm"
          :class="isLong(definition) ? 'leading-relaxed whitespace-pre-line' : undefined"
        >
          {{ statementText(statement) }}
        </Text>
        <Text
          v-if="statement.reading && statement.property !== 'CREDIT'"
          as="span"
          size="sm"
          tone="muted"
          lang="ja"
        >
          {{ statement.reading }}
        </Text>
        <Tag v-if="entryType === 'APPEARANCE' && isUnpublished(statement)" tone="info">
          <EyeOff aria-hidden="true" />
          未公开
        </Tag>
      </Inline>
      <Text v-if="qualifierText(statement)" as="span" size="xs" tone="muted">
        {{ qualifierText(statement) }}
      </Text>
      <Text
        v-if="
          statement.property === 'CREDIT' &&
          statement.target &&
          statement.target.label !== statement.text
        "
        as="span"
        size="xs"
        tone="muted"
        lang="ja"
      >
        已关联至 {{ statement.target.label }}
      </Text>
      <CreatorEntrySource :statement="statement" :label="definition?.label ?? ''" />
    </Stack>
    <Button v-if="editable" variant="ghost" tone="neutral" size="sm" @click="$emit('edit')">
      修改
    </Button>
  </Inline>
</template>

<script setup lang="ts">
  import { Button, Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import { EyeOff } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import {
    codeLabel,
    isLong,
    isUnpublished,
    linkOf,
    qualifierText,
    statementText,
  } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryValue' })
  const props = defineProps<{
    statement: BackendStatement
    definition: BackendPropertyDefinition | undefined
    editable: boolean
    entryType?: string
    codeAs?: 'text' | 'tag' | 'none'
  }>()
  defineEmits<{ edit: [] }>()
  const placement = computed(
    () => props.definition?.structural && props.definition.cardinality === 'single',
  )
</script>

<template>
  <Inline gap="md" align="start" justify="between" :wrap="false">
    <Stack gap="xs" class="min-w-0 flex-1">
      <Inline gap="sm" align="center">
        <Link
          v-if="statement.target && statement.property !== 'CREDIT'"
          :as="NuxtLink"
          :to="`/create/edit/entry/${statement.target.id}`"
          tone="accent"
          class="text-sm"
          lang="ja"
        >
          {{ codeAs && codeAs !== 'text' ? statement.target.label : statementText(statement) }}
        </Link>
        <Link
          v-else-if="linkOf(statement)"
          as="a"
          :href="linkOf(statement)!"
          target="_blank"
          rel="noopener noreferrer"
          tone="accent"
          class="text-sm break-all"
        >
          {{ statementText(statement) }}
        </Link>
        <Text
          v-else
          as="span"
          size="sm"
          :class="isLong(definition) ? 'leading-relaxed whitespace-pre-line' : undefined"
        >
          {{ statementText(statement) }}
        </Text>
        <Tag v-if="codeAs === 'tag' && statement.target && statement.code" tone="neutral">
          {{ codeLabel(statement.property, statement.code) }}
        </Tag>
        <Text
          v-if="definition?.shape === 'code' && statement.original"
          as="span"
          size="sm"
          tone="muted"
          lang="ja"
        >
          原文「{{ statement.original }}」
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
      <CreatorEntrySource
        v-if="definition?.sources.length !== 0 && !placement"
        :statement="statement"
      />
    </Stack>
    <slot name="action">
      <Button
        v-if="editable && !placement"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="$emit('edit')"
      >
        修改
      </Button>
    </slot>
  </Inline>
</template>

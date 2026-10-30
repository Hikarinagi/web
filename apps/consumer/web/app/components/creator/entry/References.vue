<script setup lang="ts">
  import { Divider, Inline, Link, Panel, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type {
    BackendEntryDefinition,
    BackendEntryReferenceGroup,
  } from '~/features/creator/entry/contract'
  import { referenceTitle } from '~/features/creator/entry/references'
  import { codeLabel } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryReferences' })
  defineProps<{ groups: BackendEntryReferenceGroup[]; definitions: BackendEntryDefinition[] }>()
</script>

<template>
  <Panel
    v-for="group in groups"
    :key="`${group.type}:${group.property}`"
    :title="referenceTitle(group, definitions)"
    :count="group.total"
  >
    <Stack gap="sm">
      <template v-for="(item, index) in group.items" :key="item.statement_id">
        <Divider v-if="index" />
        <Inline gap="md" align="baseline" justify="between" :wrap="false">
          <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0">
            <Link
              :as="NuxtLink"
              :to="`/create/edit/entry/${item.entry.id}`"
              class="shrink-0 text-sm"
              lang="ja"
            >
              {{ item.entry.label }}
            </Link>
            <Text v-if="item.works.length" as="span" size="xs" tone="muted" truncate lang="ja">
              {{ item.works.join('、') }}
            </Text>
          </Inline>
          <Text
            v-if="item.credits.length || item.code"
            as="span"
            size="sm"
            tone="muted"
            class="min-w-0 truncate text-end"
            lang="ja"
          >
            {{
              item.credits.length ? item.credits.join('、') : codeLabel(group.property, item.code!)
            }}
          </Text>
        </Inline>
      </template>
      <Text v-if="group.total > group.items.length" as="p" size="xs" tone="muted">
        共 {{ group.total }} 项；此处列出前 {{ group.items.length }} 项
      </Text>
    </Stack>
  </Panel>
</template>

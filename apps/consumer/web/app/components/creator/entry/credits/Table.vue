<script setup lang="ts">
  import {
    Button,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import { creditRoleLabel } from '~/features/entry/labels'
  import { sourcesOf } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryCreditsTable' })
  defineProps<{
    statements: BackendStatement[]
    target: string
    entry?: { id: number; revision: number; type: string }
    definition?: BackendPropertyDefinition
    editing?: number | 'new' | null
    readonly?: boolean
    voice?: boolean
  }>()
  defineEmits<{ edit: [id: number | null]; saved: [] }>()

  const sources = (statement: BackendStatement) =>
    sourcesOf(statement)
      .map(citation => citation.source ?? citation.url)
      .filter(Boolean)
      .join('、')
</script>

<template>
  <Table variant="secondary" class="hikari-panel-table">
    <TableHeader>
      <TableRow>
        <TableHead v-if="!voice">职责</TableHead>
        <TableHead>名字</TableHead>
        <TableHead>{{ target }}</TableHead>
        <template v-if="definition">
          <TableHead>{{ voice ? '版本与来源' : '来源' }}</TableHead>
          <TableHead><span class="sr-only">修改</span></TableHead>
        </template>
      </TableRow>
    </TableHeader>
    <TableBody>
      <template v-for="statement in statements" :key="statement.id">
        <TableRow v-if="definition && entry && editing === statement.id">
          <TableCell colspan="5">
            <CreatorEntryFormCard
              :entry="entry"
              :definition="definition"
              :statement="statement"
              @cancel="$emit('edit', null)"
              @saved="$emit('saved')"
            />
          </TableCell>
        </TableRow>
        <TableRow v-else>
          <TableCell v-if="!voice" class="whitespace-nowrap" lang="ja">
            {{ statement.role ?? creditRoleLabel(statement.code ?? '') }}
          </TableCell>
          <TableCell lang="ja">
            {{ statement.text }}
            <Text v-if="statement.song" as="span" size="xs" tone="muted" class="ms-2">
              {{ statement.song }}
            </Text>
          </TableCell>
          <TableCell>
            <Link
              v-if="statement.target"
              :as="NuxtLink"
              :to="`/create/edit/entry/${statement.target.id}`"
              tone="accent"
              lang="ja"
            >
              {{ statement.target.label }}
            </Link>
            <Text v-else as="span" size="sm" tone="muted">未关联</Text>
          </TableCell>
          <template v-if="definition">
            <TableCell>
              <Stack gap="none" class="items-start py-2">
                <Text v-if="voice && statement.versions.length" as="span" size="sm" lang="ja">
                  {{ statement.versions.map(item => item.label).join('、') }}
                </Text>
                <Text v-if="sources(statement)" as="span" size="xs" tone="muted">
                  {{ sources(statement) }}
                </Text>
                <Tag v-else tone="warning">无来源</Tag>
              </Stack>
            </TableCell>
            <TableCell class="w-0">
              <Button
                v-if="!readonly"
                variant="ghost"
                tone="neutral"
                size="sm"
                @click="$emit('edit', statement.id)"
              >
                修改
              </Button>
            </TableCell>
          </template>
        </TableRow>
      </template>
      <TableRow v-if="definition && entry && editing === 'new'">
        <TableCell colspan="5">
          <CreatorEntryFormCard
            :entry="entry"
            :definition="definition"
            :statement="null"
            @cancel="$emit('edit', null)"
            @saved="$emit('saved')"
          />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

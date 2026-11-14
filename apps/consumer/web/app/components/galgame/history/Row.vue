<script setup lang="ts">
  import {
    Button,
    Center,
    Checkbox,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DisclosureIcon,
    IconButton,
    Inline,
    Stack,
    Tag,
    Text,
    Time,
  } from '@hina-ui/vue'
  import { Eye } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { GalgameHistoryPageData } from '~~/server/api/pages/galgames/[id]/revisions/index.get'
  import { titleText } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameHistoryRow' })
  const props = defineProps<{
    row: GalgameHistoryPageData['history']['items'][number]
    galgameId: number
    selected: boolean
  }>()
  defineEmits<{ toggle: [on: boolean] }>()

  const open = ref(false)
  const entries = computed(() => [
    ...new Map(
      props.row.edits.flatMap(edit => edit.entries).map(entry => [entry.id, entry]),
    ).values(),
  ])
  const to = computed(() =>
    props.row.revision === null
      ? null
      : `/galgames/${props.galgameId}/revisions/${props.row.revision}`,
  )
</script>

<template>
  <Collapsible v-model:open="open" class="px-4 py-5 sm:px-5">
    <Inline :wrap="false" align="start" gap="md">
      <Center class="h-6 w-5 shrink-0">
        <Checkbox
          v-if="row.revision !== null"
          :model-value="selected"
          aria-label="选择此修订"
          @update:model-value="value => $emit('toggle', value === true)"
        />
      </Center>
      <Stack gap="sm" class="min-w-0 flex-1">
        <Stack gap="xs">
          <Inline gap="sm" align="center">
            <Text
              weight="medium"
              :tone="row.reverted ? 'muted' : undefined"
              :class="row.reverted ? 'line-through' : undefined"
            >
              {{ row.summary }}
            </Text>
            <Tag v-if="row.reverted" tone="neutral" size="sm">已撤销</Tag>
          </Inline>
          <Text v-if="row.note" size="sm" tone="muted">{{ row.note }}</Text>
        </Stack>
        <Inline gap="none" align="center" class="gap-x-4 gap-y-2 text-sm text-muted">
          <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
            <Avatar :user="row.editor" size="sm" />
            <UserName :user="row.editor" />
          </Inline>
          <Time :value="row.created_at" format="time" class="tabular-nums" />
          <Inline
            v-if="entries.length || row.edits.length > 1"
            gap="none"
            align="center"
            class="min-w-0 gap-x-1.5 gap-y-2"
          >
            <Tag
              v-for="entry in entries.slice(0, 3)"
              :key="entry.id"
              tone="neutral"
              size="sm"
              class="max-w-full"
            >
              <Text as="span" size="inherit" truncate>{{ titleText(entry.title) }}</Text>
            </Tag>
            <Text v-if="entries.length > 3" as="span" size="sm" tone="muted">
              等 {{ entries.length - 3 }} 个
            </Text>
            <CollapsibleTrigger v-if="row.edits.length > 1" as-child>
              <Button variant="ghost" tone="neutral" size="xs" class="ms-1 -me-2">
                {{ row.edits.length }} 次编辑
                <template #trailing><DisclosureIcon /></template>
              </Button>
            </CollapsibleTrigger>
          </Inline>
        </Inline>
      </Stack>
      <template v-if="to">
        <Button
          :as="NuxtLink"
          :to="to"
          variant="ghost"
          tone="neutral"
          size="sm"
          class="hidden self-center sm:inline-flex"
        >
          <template #icon><Eye /></template>
          查看此修订下的条目
        </Button>
        <IconButton
          :as="NuxtLink"
          :to="to"
          label="查看此修订下的条目"
          variant="ghost"
          tone="neutral"
          size="sm"
          class="self-center sm:hidden"
        >
          <Eye />
        </IconButton>
      </template>
    </Inline>
    <CollapsibleContent v-if="row.edits.length > 1">
      <GalgameHistoryEdits :edits="row.edits" class="mt-4 sm:ms-8" />
    </CollapsibleContent>
  </Collapsible>
</template>

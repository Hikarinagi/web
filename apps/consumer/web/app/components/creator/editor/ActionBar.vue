<script setup lang="ts">
  import { Button, IconButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { useCreatorSidebar } from '~/features/creator/composables/useCreatorSidebar'
  import type { BackendEditorField } from '~/features/creator/editor'
  import type { EditorFieldPresentation } from '~/features/creator/editor/presentation'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'
  import type { SyncRoster } from '~/features/creator/editor/sync'
  import { EASE_CSS } from '~/lib/motion'
  import { List } from '@lucide/vue'

  defineProps<{
    resourceType: string
    resourceId: number | null
    fields: BackendEditorField[]
    presentation: Record<string, EditorFieldPresentation>
    relations: Record<string, EditorRelationRow[]>
    changedCount: number
    submitting: boolean
    disabled: boolean
  }>()
  const emit = defineEmits<{
    add: [field: string, row: EditorRelationRow]
    roster: [roster: SyncRoster]
    openNav: []
  }>()

  const { state } = useCreatorSidebar()
  const offsetClass = computed(() => {
    if (state.value === 'expanded') return 'lg:left-64'
    return state.value === 'rail' ? 'lg:left-14' : 'lg:left-0'
  })
</script>

<template>
  <Stack
    gap="sm"
    :class="
      cn(
        'fixed right-0 bottom-0 left-0 z-20 hn-scrollbar-safe border-line bg-surface/95',
        'border-t px-5 py-4 backdrop-blur-sm transition-[left] duration-200',
        offsetClass,
      )
    "
    :style="{ transitionTimingFunction: EASE_CSS }"
  >
    <CreatorEditorSessionTray />
    <Inline gap="sm" align="center" :wrap="false">
      <CreatorEditorSyncTrigger
        v-if="resourceId != null"
        :resource-type="resourceType"
        :resource-id="resourceId"
        :fields="fields"
        :presentation="presentation"
        :relations="relations"
        @add="(field, row) => emit('add', field, row)"
        @roster="roster => emit('roster', roster)"
      />
      <IconButton
        label="跳转到字段"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="lg:hidden"
        @click="emit('openNav')"
      >
        <List />
      </IconButton>
      <Text size="sm" tone="muted" class="ms-auto">{{ changedCount }} 项修改</Text>
      <Button type="submit" :disabled="disabled" :loading="submitting">提交变更请求</Button>
    </Inline>
  </Stack>
</template>

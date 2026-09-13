<script setup lang="ts">
  import type { FormInstance } from '@primevue/forms/form'
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
    formEl: FormInstance | null
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

  const { collapsed } = useCreatorSidebar()
</script>

<template>
  <div
    class="fixed right-0 bottom-0 left-0 z-20 mr-(--p-scrollbar-width) flex flex-col gap-3 border-t border-surface-200 bg-surface-0/95 px-5 py-4 backdrop-blur-sm transition-[left] duration-200 dark:border-surface-800 dark:bg-surface-950/95"
    :class="collapsed ? 'md:left-[72px]' : 'md:left-[256px]'"
    :style="{ transitionTimingFunction: EASE_CSS }"
  >
    <CreatorEditorSessionTray />
    <div class="flex items-center gap-3">
      <CreatorEditorSyncTrigger
        v-if="resourceId != null"
        :resource-type="resourceType"
        :resource-id="resourceId"
        :form-el="formEl"
        :fields="fields"
        :presentation="presentation"
        :relations="relations"
        @add="(field, row) => emit('add', field, row)"
        @roster="roster => emit('roster', roster)"
      />
      <Button
        type="button"
        variant="text"
        severity="secondary"
        class="lg:hidden!"
        aria-label="跳转到字段"
        @click="emit('openNav')"
      >
        <template #icon>
          <List />
        </template>
      </Button>
      <span class="ml-auto text-sm text-muted-color">{{ changedCount }} 项修改</span>
      <Button label="提交变更请求" type="submit" :disabled="disabled" :loading="submitting" />
    </div>
  </div>
</template>

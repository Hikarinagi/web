<script setup lang="ts">
  import { Button, Empty, Flex, Panel, ScrollArea, Stack } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { CHANGE_TITLES, changesRoute } from '~/features/wiki/changes'
  import { RELOAD_CHANGES, useChangesResults } from '~/features/wiki/composables/useChangesResults'
  import { cn } from '~/utils/cn'
  import type { ChangesPageData } from '~~/server/api/pages/create/wiki/changes.get'

  defineOptions({ name: 'WikiChangesShell' })

  const props = defineProps<{ initial: ChangesPageData }>()
  const route = useRoute()
  const { displayed, state, pending, reload } = useChangesResults(props.initial)
  const { canAny } = useCreatorPermissions()
  provide(RELOAD_CHANGES, reload)

  const current = computed(() => Number(route.params.id) || null)
  const selectable = computed(
    () => state.value.f === 'unchecked' && canAny(WIKI_PERMISSIONS.PATROL),
  )
  const selected = ref<number[]>([])
  const marking = ref(false)
  watch(state, () => (selected.value = []))

  function pick(id: number, on: boolean) {
    selected.value = on ? [...selected.value, id] : selected.value.filter(item => item !== id)
  }

  async function mark() {
    marking.value = true
    try {
      await hikariRequest('/api/v3/wiki/edits/patrols', {
        method: 'POST',
        body: { edit_ids: selected.value },
      })
      selected.value = []
      reload()
    } finally {
      marking.value = false
    }
  }
</script>

<template>
  <Flex gap="lg" align="start">
    <Panel
      :title="CHANGE_TITLES[state.f]"
      :count="displayed.list.meta.total_items"
      :padded="false"
      :class="cn('w-96 shrink-0 max-md:w-full', current && 'max-md:hidden')"
    >
      <template #actions>
        <Button v-if="selected.length" size="sm" variant="soft" :loading="marking" @click="mark">
          将 {{ selected.length }} 条标记为已检查
        </Button>
      </template>
      <Empty v-if="!displayed.list.items.length" title="没有修改" />
      <Stack v-else gap="none" align="stretch" class="divide-y divide-line">
        <WikiChangesItem
          v-for="change in displayed.list.items"
          :key="change.id"
          :change="change"
          :to="changesRoute(state, change.id)"
          :active="change.id === current"
          :selectable="selectable && !change.patrolled_at && !change.batch.imported"
          :selected="selected.includes(change.id)"
          @update:selected="on => pick(change.id, on)"
        />
      </Stack>
      <Paginator
        v-if="displayed.list.meta.total_pages > 1"
        :meta="displayed.list.meta"
        :loading="pending"
        route="push"
        align="center"
        class="border-t border-line px-(--hn-panel-p) py-3"
      />
    </Panel>
    <ScrollArea
      :class="
        cn(
          'sticky top-0 h-[calc(100dvh-var(--hn-app-shell-header-h)-var(--spacing)*8)] min-w-0 flex-1 max-md:static max-md:h-auto',
          !current && 'max-md:hidden',
        )
      "
    >
      <slot />
    </ScrollArea>
  </Flex>
</template>

<script setup lang="ts">
  import { Button, Empty, Flex, Heading, Inline, ScrollArea, Stack, Text } from '@hina-ui/vue'
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
  useRefreshOnSaved(reload)

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
      void refreshNuxtData('wiki-unchecked-count')
    } finally {
      marking.value = false
    }
  }
</script>

<template>
  <Flex gap="none" class="h-full min-h-0">
    <Stack
      gap="none"
      :class="
        cn(
          'w-96 shrink-0 border-r border-line max-md:w-full max-md:border-r-0',
          current && 'max-md:hidden',
        )
      "
    >
      <Inline
        gap="sm"
        align="center"
        justify="between"
        :wrap="false"
        class="h-14 shrink-0 border-b border-line px-4"
      >
        <Heading :level="2" size="xs">
          {{ CHANGE_TITLES[state.f] }}
          <Text as="span" size="xs" tone="muted">{{ displayed.list.meta.total_items }}</Text>
        </Heading>
        <Button v-if="selected.length" size="sm" variant="soft" :loading="marking" @click="mark">
          将 {{ selected.length }} 条标记为已检查
        </Button>
      </Inline>
      <Empty v-if="!displayed.list.items.length" title="没有修改" class="py-12" />
      <ScrollArea v-else class="min-h-0 flex-1">
        <Stack gap="none">
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
          <Paginator
            v-if="displayed.list.meta.total_pages > 1"
            :meta="displayed.list.meta"
            :loading="pending"
            route="push"
            align="center"
            class="px-4 py-3"
          />
        </Stack>
      </ScrollArea>
    </Stack>
    <ScrollArea :class="cn('min-w-0 flex-1', !current && 'max-md:hidden')">
      <slot />
    </ScrollArea>
  </Flex>
</template>

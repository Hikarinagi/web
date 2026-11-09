<script setup lang="ts">
  import { Card, Divider, Stack } from '@hina-ui/vue'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import { creditRoleLabel } from '~/features/entry/labels'
  import { useOrgList } from '~/features/org/composables/useOrgList'
  import { orgGroups, orgWork, spanText } from '~/features/org/works'
  import { CODE_LABELS } from '~/features/wiki/codes'

  defineOptions({ name: 'OrgPage' })
  const props = defineProps<{ data: ProducerPageData }>()

  const groups = computed(() => orgGroups(props.data.stats, creditRoleLabel))
  const newest = computed(() => (props.data.newest ? orgWork(props.data.newest) : null))
  const kind = computed(() => {
    const type = props.data.producer.organization_type
    return type ? (CODE_LABELS.ORGANIZATION_TYPE?.[type] ?? '') : ''
  })
  const list = useOrgList(
    props.data.producer.id,
    props.data.mode,
    { list: props.data.list, state: props.data.state },
    props.data.stats.groups.some(group => group.kind === 'light_novel') ? 'novel' : 'manga',
  )

  const external = computed(() => {
    const { vndb_id: vndb, bangumi_id: bangumi } = props.data.producer
    return [
      ...(vndb ? [{ label: 'VNDB', href: `https://vndb.org/${vndb}` }] : []),
      ...(bangumi ? [{ label: 'Bangumi', href: `https://bgm.tv/person/${bangumi}` }] : []),
    ]
  })

  function pick(code: string) {
    list.update({ tab: groups.value.length > 1 ? code : 'ALL', year: null })
    document.getElementById('works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
</script>

<template>
  <Stack gap="none" class="min-h-screen bg-canvas pt-(--app-header-height)">
    <OrgHeader
      :producer="data.producer"
      :newest="newest"
      :score="data.stats.rating.average"
      :kind="kind"
      :groups="groups"
      @group="pick"
    />
    <Stack
      gap="xl"
      class="mx-auto w-full max-w-(--entry-container) px-4 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--rail-right)] lg:items-start lg:gap-10 lg:px-6 lg:py-10"
    >
      <Stack
        as="aside"
        gap="none"
        class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)] lg:order-2"
      >
        <Card class="w-full">
          <Stack gap="md">
            <OrgFacts
              :producer="data.producer"
              :relations="data.relations"
              :years="spanText(data.stats.first_date, data.stats.last_date)"
            />
            <template v-if="data.collaborators?.length">
              <Divider />
              <OrgCollaborators :people="data.collaborators" />
            </template>
            <EntryMeta
              :contributors="data.contributors"
              resource-type="producer"
              :resource-id="data.producer.id"
              :external="external"
            />
          </Stack>
        </Card>
      </Stack>
      <OrgWorks
        :data="data"
        :groups="groups"
        :list="list.displayed.value"
        :state="list.state.value"
        :pending="list.pending.value"
        class="min-w-0 lg:order-1"
        @update="list.update"
      />
    </Stack>
  </Stack>
</template>

<script setup lang="ts">
  import { Card, Divider, Stack } from '@hina-ui/vue'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import { creditRoleLabel } from '~/features/entry/labels'
  import { CODE_LABELS } from '~/features/wiki/codes'
  import { orgGroups, orgMode, orgWorks } from '~/features/org/works'

  defineOptions({ name: 'OrgPage' })
  const props = defineProps<{ data: ProducerPageData }>()

  const works = computed(() => orgWorks(props.data))
  const mode = computed(() => orgMode(props.data))
  const groups = computed(() => orgGroups(works.value, creditRoleLabel))
  const kind = computed(() => {
    const type = props.data.producer.organization_type
    return type ? (CODE_LABELS.ORGANIZATION_TYPE?.[type] ?? '') : ''
  })
  const tab = ref('ALL')

  const external = computed(() => {
    const { vndb_id: vndb, bangumi_id: bangumi } = props.data.producer
    return [
      ...(vndb ? [{ label: 'VNDB', href: `https://vndb.org/${vndb}` }] : []),
      ...(bangumi ? [{ label: 'Bangumi', href: `https://bgm.tv/person/${bangumi}` }] : []),
    ]
  })

  async function pick(code: string) {
    tab.value = groups.value.length > 1 ? code : 'ALL'
    await nextTick()
    document.getElementById('works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
</script>

<template>
  <Stack gap="none" class="min-h-screen bg-canvas pt-(--app-header-height)">
    <OrgHeader
      :producer="data.producer"
      :works="works"
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
            <OrgFacts :producer="data.producer" :relations="data.relations" :works="works" />
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
      <Stack gap="none" class="min-w-0 lg:order-1">
        <OrgHistory v-if="mode === 'history'" v-model="tab" :works="works" :groups="groups" />
        <OrgShelf v-else-if="mode === 'shelf'" v-model="tab" :works="works" :groups="groups" />
        <OrgHub v-else-if="mode === 'hub'" :works="works" :relations="data.relations" />
        <OrgSerials
          v-else
          :producer-id="data.producer.id"
          :popular="works"
          :total="data.mangas?.meta.total_items ?? 0"
        />
      </Stack>
    </Stack>
  </Stack>
</template>

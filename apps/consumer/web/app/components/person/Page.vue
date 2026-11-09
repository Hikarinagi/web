<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { PeoplePageData } from '~~/server/api/pages/people/[id].get'
  import { usePersonList } from '~/features/person/composables/usePersonList'
  import { defaultPersonTab } from '~/features/person/results'
  import {
    knownWorks,
    personWorks,
    roleCounts,
    voiceRoles,
    workYears,
  } from '~/features/person/works'

  defineOptions({ name: 'PersonPage' })
  const props = defineProps<{ data: PeoplePageData }>()

  const roles = computed(() => roleCounts(props.data.stats))
  const known = computed(() =>
    knownWorks(personWorks(props.data.known.works), voiceRoles(props.data.known.voices)),
  )
  const list = usePersonList(
    props.data.person.id,
    { list: props.data.list, state: props.data.state },
    defaultPersonTab(props.data.stats),
  )

  const external = computed(() => {
    const { vndb_id: vndb, bangumi_id: bangumi } = props.data.person
    return [
      ...(vndb ? [{ label: 'VNDB', href: `https://vndb.org/${vndb}` }] : []),
      ...(bangumi ? [{ label: 'Bangumi', href: `https://bgm.tv/person/${bangumi}` }] : []),
    ]
  })

  function pick(code: string) {
    list.update({ tab: code })
    document.getElementById('works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
</script>

<template>
  <Stack gap="none" class="min-h-screen bg-canvas">
    <PersonHero
      :person="data.person"
      :roles="roles"
      :known="known"
      :voiced="data.stats.voices > 0"
      @role="pick"
    />
    <Stack
      gap="xl"
      class="mx-auto w-full max-w-(--entry-container) px-4 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--rail-right)] lg:items-start lg:gap-10 lg:px-6"
    >
      <PersonWorks
        :roles="roles"
        :total="data.stats.works"
        :list="list.displayed.value"
        :state="list.state.value"
        :pending="list.pending.value"
        class="min-w-0"
        @update="list.update"
      />
      <Stack as="aside" gap="xl" class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]">
        <PersonFacts :person="data.person" :years="workYears(data.stats)" />
        <EntryMeta
          :contributors="data.contributors"
          resource-type="person"
          :resource-id="data.person.id"
          :external="external"
        />
      </Stack>
    </Stack>
  </Stack>
</template>

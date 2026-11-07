<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { PeoplePageData } from '~~/server/api/pages/people/[id].get'
  import { usePageTone } from '~/features/entry/usePageTone'
  import { knownWorks, personWorks, roleCounts, voiceRoles } from '~/features/person/works'
  import { imageSourceThumbHash } from '~/utils/media/image'

  defineOptions({ name: 'PersonPage' })
  const props = defineProps<{ data: PeoplePageData }>()

  const works = computed(() => personWorks(props.data))
  const voices = computed(() => voiceRoles(props.data))
  const roles = computed(() => roleCounts(works.value, voices.value))
  const known = computed(() => knownWorks(works.value, voices.value))

  const workRoles = roles.value.filter(role => role.code !== 'VOICE')
  const tab = ref(
    voices.value.length ? 'VOICE' : workRoles.length > 1 ? 'ALL' : (roles.value[0]?.code ?? 'ALL'),
  )
  usePageTone(
    computed(() => imageSourceThumbHash(known.value[0]?.image) ?? null),
    { paper: true },
  )

  const external = computed(() => {
    const { vndb_id: vndb, bangumi_id: bangumi } = props.data.person
    return [
      ...(vndb ? [{ label: 'VNDB', href: `https://vndb.org/${vndb}` }] : []),
      ...(bangumi ? [{ label: 'Bangumi', href: `https://bgm.tv/person/${bangumi}` }] : []),
    ]
  })

  async function pick(code: string) {
    tab.value = code
    await nextTick()
    document.getElementById('works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
</script>

<template>
  <Stack gap="none" class="min-h-screen bg-canvas">
    <PersonHero
      :person="data.person"
      :roles="roles"
      :known="known"
      :voiced="voices.length > 0"
      @role="pick"
    />
    <Stack
      gap="xl"
      class="mx-auto w-full max-w-(--entry-container) px-4 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--rail-right)] lg:items-start lg:gap-10 lg:px-6"
    >
      <PersonWorks v-model="tab" :works="works" :voices="voices" :roles="roles" class="min-w-0" />
      <Stack as="aside" gap="xl" class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]">
        <PersonFacts :person="data.person" :works="works" :voices="voices" />
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

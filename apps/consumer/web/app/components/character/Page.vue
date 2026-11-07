<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { CharacterPageData } from '~~/server/api/pages/characters/[id].get'
  import { appearancesOf, defaultAppearance, viewOf } from '~/features/character/appearances'
  import { useCast } from '~/features/character/useCast'
  import { usePageTone } from '~/features/entry/usePageTone'
  import { imageSourceThumbHash } from '~/utils/media/image'

  defineOptions({ name: 'CharacterPage' })
  const props = defineProps<{ data: CharacterPageData }>()

  const list = computed(() => appearancesOf(props.data))
  const selected = ref(defaultAppearance(list.value)?.key ?? '')
  const work = computed(() => list.value.find(item => item.key === selected.value) ?? null)
  const view = computed(() => viewOf(props.data.character, list.value, work.value))
  const cast = useCast(props.data.cast, work)

  usePageTone(
    computed(() => imageSourceThumbHash(view.value.image) ?? null),
    { paper: true },
  )

  const external = computed(() => {
    const { vndb_id: vndb, bangumi_id: bangumi } = props.data.character
    return [
      ...(vndb ? [{ label: 'VNDB', href: `https://vndb.org/${vndb}` }] : []),
      ...(bangumi ? [{ label: 'Bangumi', href: `https://bgm.tv/character/${bangumi}` }] : []),
    ]
  })

  function show(key: string) {
    selected.value = key
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
</script>

<template>
  <Stack gap="none" class="relative isolate min-h-screen bg-canvas transition-colors duration-500">
    <Stack
      gap="none"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 max-h-(--ambient-height) bg-(--tone-soft) mask-(--ambient-fade) transition-colors duration-500 dark:bg-(--tone-deep-2)"
    />
    <CharacterStage
      v-model="selected"
      :character="data.character"
      :contributors="data.contributors"
      :appearances="list"
      :work="work"
      :view="view"
      :cast="cast"
      :external="external"
    />
    <Stack gap="xl" class="mx-auto w-full max-w-(--entry-container) px-4 py-8 lg:px-6 lg:py-10">
      <CharacterAppearances
        v-if="list.length > 1"
        :character="data.character"
        :appearances="list"
        :selected="selected"
        @show="show"
      />
      <EntryMeta
        :contributors="data.contributors"
        resource-type="character"
        :resource-id="data.character.id"
        :external="external"
        class="lg:hidden"
      />
    </Stack>
  </Stack>
</template>

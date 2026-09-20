<script setup lang="ts">
  import { characterSeo } from '~/features/seo/character'

  definePageMeta({ container: 'full' })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/characters/${id}`, { fatal: true })
  await redirectIfMerged(data)

  const seo = computed(() => (data.value ? characterSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? '角色',
    headerTitle: () => seo.value?.headerTitle ?? '角色',
    description: () => seo.value?.description,
    card: { type: 'character', id },
    type: 'profile',
    schemaOrg: seo.value?.schema,
  })
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <EntityHero kind="character" :entity="data.character" />

    <div class="mx-auto flex max-w-app flex-col gap-10 px-6 py-12">
      <EntityAbout kind="character" :entity="data.character" :contributors="data.contributors" />
      <EntityWorkSection
        title="出场作品"
        :relation="data.galgames"
        variant="character-galgame"
        unit="Galgame"
        :more-base="`/characters/${id}/galgames`"
      />
      <EntityWorkSection
        title="出演的轻小说"
        :relation="data.light_novels"
        variant="character-light-novel"
        :more-base="`/characters/${id}/light-novels`"
      />
      <EntityWorkSection
        title="出场的漫画"
        :relation="data.mangas"
        variant="character-manga"
        :more-base="`/characters/${id}/mangas`"
      />
    </div>
  </div>
</template>

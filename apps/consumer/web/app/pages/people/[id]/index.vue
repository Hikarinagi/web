<script setup lang="ts">
  import { personSeo } from '~/features/seo/person'

  definePageMeta({ container: 'full' })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/people/${id}`, { fatal: true })
  await redirectIfMerged(data)

  const seo = computed(() => (data.value ? personSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? '人物',
    headerTitle: () => seo.value?.headerTitle ?? '人物',
    description: () => seo.value?.description,
    card: { type: 'person', id },
    type: 'profile',
    schemaOrg: seo.value?.schema,
  })
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <EntityHero kind="person" :entity="data.person" />

    <div class="mx-auto flex max-w-app flex-col gap-10 px-6 py-12">
      <EntityAbout kind="person" :entity="data.person" :contributors="data.contributors" />
      <EntityWorkSection
        title="参与作品"
        :relation="data.galgames"
        variant="person-galgame"
        unit="Galgame"
        :more-base="`/people/${id}/galgames`"
      />
      <EntityWorkSection
        title="参与的轻小说"
        :relation="data.light_novels"
        variant="person-light-novel"
        :more-base="`/people/${id}/light-novels`"
      />
      <EntityWorkSection
        title="参与的漫画"
        :relation="data.mangas"
        variant="person-manga"
        :more-base="`/people/${id}/mangas`"
      />
      <EntityVoiceSection
        title="配音角色"
        :relation="data.characters"
        :more-base="`/people/${id}/characters`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { producerSeo } from '~/features/seo/producer'

  definePageMeta({ container: 'full' })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/producers/${id}`, { fatal: true })
  await redirectIfMerged(data)

  const isMagazine = computed(() => data.value?.producer.type === 'MAGAZINE')
  const seo = computed(() => (data.value ? producerSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? '厂商',
    headerTitle: () => seo.value?.headerTitle ?? '厂商',
    description: () => seo.value?.description,
    card: { type: 'producer', id },
    type: 'profile',
    schemaOrg: seo.value?.schema,
  })
</script>

<template>
  <Stack v-if="data" gap="none" class="-mt-(--app-header-height)">
    <EntityHero kind="producer" :entity="data.producer" />

    <Stack gap="none" class="mx-auto w-full max-w-app gap-10 px-6 py-12">
      <EntityAbout kind="producer" :entity="data.producer" :contributors="data.contributors" />
      <EntityWorkSection
        v-if="isMagazine"
        title="连载作品"
        :relation="data.mangas"
        variant="producer-manga"
        :more-base="`/producers/${id}/mangas`"
      />
      <EntityWorkSection
        title="相关作品"
        :relation="data.galgames"
        variant="producer-galgame"
        unit="Galgame"
        :more-base="`/producers/${id}/galgames`"
      />
      <EntityWorkSection
        title="出版作品"
        :relation="data.light_novels"
        variant="producer-light-novel"
        :more-base="`/producers/${id}/light-novels`"
      />
      <EntityWorkSection
        v-if="!isMagazine"
        title="漫画作品"
        :relation="data.mangas"
        variant="producer-manga"
        :more-base="`/producers/${id}/mangas`"
      />
      <EntityProducerRelations :relations="data.relations" />
    </Stack>
  </Stack>
</template>

<script setup lang="ts">
  import { producerSeo } from '~/features/seo/producer'

  definePageMeta({ container: 'full' })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/producers/${id}`, { fatal: true })
  await redirectIfMerged(data)

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
  <OrgPage v-if="data" :data="data" class="-mt-(--app-header-height)" />
</template>

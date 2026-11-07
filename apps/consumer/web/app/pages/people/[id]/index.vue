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
  <PersonPage v-if="data" :data="data" class="-mt-(--app-header-height)" />
</template>

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
  <CharacterPage v-if="data" :data="data" class="-mt-(--app-header-height)" />
</template>

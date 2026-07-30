<script setup lang="ts">
  import type { PeopleRelationPageData } from '~~/server/api/pages/people/[id]/[relation].get'
  import { readPageQuery } from '#shared/utils/query'
  import { entityTitle } from '~/features/entity/detail'
  import { ENTITY_RELATION_CONFIG } from '~/features/entity/relations'

  definePageMeta({ container: 'full', scrollToTop: false })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const relation = String(route.params.relation)
  const config = ENTITY_RELATION_CONFIG.person[relation]
  if (!config) throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  const page = computed(() => readPageQuery(route.query))
  const request = computed(
    () =>
      `/api/pages/people/${id}/${relation}${page.value > 1 ? `?page=${page.value}` : ''}` as `/api/pages/${string}`,
  )
  const { data, pending } = await useHikariApiData<PeopleRelationPageData>(request, {
    fatal: true,
    watch: [request],
  })
  await redirectIfMerged(data)
  const name = computed(() => (data.value ? entityTitle('person', data.value.person) : ''))

  useHikariSeoMeta({
    title: () => (name.value ? [`${name.value} · ${config.title}`, config.title] : config.title),
  })
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <EntityHero kind="person" :entity="data.person" />

    <div class="mx-auto max-w-app px-6 py-10">
      <EntityRelationView
        :back-to="`/people/${id}`"
        :back-label="`返回 ${name}`"
        :title="config.title"
        :mode="config.mode"
        :variant="config.variant"
        :total="data.relation.meta.total_items"
        :raw-items="data.relation.items"
        :meta="data.relation.meta"
        :pending="pending"
      />
    </div>
  </div>
</template>

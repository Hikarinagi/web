<script setup lang="ts">
  import type { CharacterRelationPageData } from '~~/server/api/pages/characters/[id]/[relation].get'
  import { readPageQuery } from '#shared/utils/query'
  import { entityTitle } from '~/features/entity/detail'
  import { ENTITY_RELATION_CONFIG } from '~/features/entity/relations'

  definePageMeta({ container: 'full', scrollToTop: false })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const relation = String(route.params.relation)
  const config = ENTITY_RELATION_CONFIG.character[relation]
  if (!config) throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  const page = computed(() => readPageQuery(route.query))
  const request = computed(
    () =>
      `/api/pages/characters/${id}/${relation}${page.value > 1 ? `?page=${page.value}` : ''}` as `/api/pages/${string}`,
  )
  const { data, pending } = await useHikariApiData<CharacterRelationPageData>(request, {
    fatal: true,
    watch: [request],
  })
  await redirectIfMerged(data)

  const name = computed(() => (data.value ? entityTitle('character', data.value.character) : ''))

  useHikariSeoMeta({
    title: () => (name.value ? [`${name.value} · ${config.title}`, config.title] : config.title),
  })
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <EntityHero kind="character" :entity="data.character" />

    <div class="mx-auto max-w-app px-6 py-10">
      <EntityRelationView
        :back-to="`/characters/${id}`"
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

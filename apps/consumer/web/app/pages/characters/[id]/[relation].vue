<script setup lang="ts">
  import { RELATION_LIST_PAGE_SIZE } from '~/features/entity/entity'
  import { entityTitle } from '~/features/entity/detail'
  import { ENTITY_RELATION_CONFIG } from '~/features/entity/relations'
  import { useEntityRelation } from '~/features/entity/useEntityRelation'

  definePageMeta({ container: 'full', scrollToTop: false })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const relation = String(route.params.relation)
  const config = ENTITY_RELATION_CONFIG.character[relation]
  if (!config) throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  const { data } = await useHikariApiData(`/api/pages/characters/${id}/${relation}`, {
    fatal: true,
  })
  await redirectIfMerged(data)

  const query = (page: number) => ({
    page,
    page_size: RELATION_LIST_PAGE_SIZE,
    sort: 'recent' as const,
  })
  function loader(page: number) {
    if (relation === 'light-novels')
      return hikariRequest('/api/v3/characters/{id}/light-novels', {
        path: { id },
        query: query(page),
      })
    if (relation === 'mangas')
      return hikariRequest(
        '/api/v3/characters/{id}/mangas' as unknown as '/api/v3/characters/{id}/galgames',
        { path: { id }, query: query(page) },
      )
    return hikariRequest('/api/v3/characters/{id}/galgames', { path: { id }, query: query(page) })
  }

  const { items, total, pending, hasMore, loadMore } = useEntityRelation(
    data.value!.relation,
    loader,
  )
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
        :total="total"
        :raw-items="items"
        :pending="pending"
        :has-more="hasMore"
        @load-more="loadMore"
      />
    </div>
  </div>
</template>

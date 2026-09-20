<script setup lang="ts">
  import { RELATION_LIST_PAGE_SIZE } from '~/features/entity/entity'
  import { entityTitle } from '~/features/entity/detail'
  import { ENTITY_RELATION_CONFIG } from '~/features/entity/relations'
  import { useEntityRelation } from '~/features/entity/useEntityRelation'

  definePageMeta({ container: 'full', scrollToTop: true })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const relation = String(route.params.relation)
  const config = ENTITY_RELATION_CONFIG.producer[relation]
  if (!config) throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  const { data } = await useHikariApiData(`/api/pages/producers/${id}/${relation}`, { fatal: true })
  await redirectIfMerged(data)

  const query = (page: number) => ({
    page,
    page_size: RELATION_LIST_PAGE_SIZE,
    sort: 'recent' as const,
  })
  function loader(page: number) {
    if (relation === 'light-novels')
      return hikariRequest('/api/v3/producers/{id}/light-novels', {
        path: { id },
        query: query(page),
      })
    if (relation === 'mangas')
      return hikariRequest(
        '/api/v3/producers/{id}/mangas' as unknown as '/api/v3/producers/{id}/galgames',
        { path: { id }, query: query(page) },
      )
    return hikariRequest('/api/v3/producers/{id}/galgames', { path: { id }, query: query(page) })
  }

  const { items, total, pending, hasMore, loadMore } = useEntityRelation(
    data.value!.relation,
    loader,
  )
  const name = computed(() => (data.value ? entityTitle('producer', data.value.producer) : ''))
  const title = computed(() =>
    relation === 'mangas' && data.value?.producer.type === 'MAGAZINE' ? '连载作品' : config.title,
  )

  useHikariSeoMeta({
    title: () => (name.value ? [`${name.value} · ${title.value}`, title.value] : title.value),
  })
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <EntityHero kind="producer" :entity="data.producer" />

    <div class="mx-auto max-w-app px-6 py-10">
      <EntityRelationView
        :back-to="`/producers/${id}`"
        :back-label="`返回 ${name}`"
        :title="title"
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

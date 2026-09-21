<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { ProducerRelationPageData } from '~~/server/api/pages/producers/[id]/[relation].get'
  import { readPageQuery } from '#shared/utils/query'
  import { entityTitle } from '~/features/entity/detail'
  import { ENTITY_RELATION_CONFIG } from '~/features/entity/relations'

  definePageMeta({ container: 'full', scrollToTop: false })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const relation = String(route.params.relation)
  const config = ENTITY_RELATION_CONFIG.producer[relation]
  if (!config) throw createError({ statusCode: 404, statusMessage: 'Not Found' })

  const page = computed(() => readPageQuery(route.query))
  const request = computed(
    () =>
      `/api/pages/producers/${id}/${relation}${page.value > 1 ? `?page=${page.value}` : ''}` as `/api/pages/${string}`,
  )
  const { data, pending } = await useHikariApiData<ProducerRelationPageData>(request, {
    fatal: true,
    watch: [request],
  })
  await redirectIfMerged(data)

  const name = computed(() => (data.value ? entityTitle('producer', data.value.producer) : ''))
  const title = computed(() =>
    relation === 'mangas' && data.value?.producer.type === 'MAGAZINE' ? '连载作品' : config.title,
  )

  useHikariSeoMeta({
    title: () => (name.value ? [`${name.value} · ${title.value}`, title.value] : title.value),
  })
</script>

<template>
  <Stack v-if="data" gap="none" class="-mt-(--app-header-height)">
    <EntityHero kind="producer" :entity="data.producer" />

    <Stack gap="none" class="mx-auto w-full max-w-app px-6 py-10">
      <EntityRelationView
        :back-to="`/producers/${id}`"
        :back-label="`返回 ${name}`"
        :title="title"
        :mode="config.mode"
        :variant="config.variant"
        :total="data.relation.meta.total_items"
        :raw-items="data.relation.items"
        :meta="data.relation.meta"
        :pending="pending"
      />
    </Stack>
  </Stack>
</template>

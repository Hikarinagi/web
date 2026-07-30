<script setup lang="ts">
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'
  import { readSpaceRouteQuery, spacePageBffPath } from '~/features/space/route'

  definePageMeta({ container: 'full', footer: 'desktop' })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const pageRequest = spacePageBffPath(id, readSpaceRouteQuery(route.query))

  const { data } = await useHikariApiData<SpacePageData>(pageRequest, { fatal: true })

  useHikariSeoMeta({
    title: () => [`${displayName(data.value?.profile)}的个人空间`, '个人空间'],
    description: () => [data.value?.profile.signature, data.value?.profile.bio],
    card: { type: 'user', id },
    type: 'profile',
  })
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <SpaceHero :profile="data.profile" :statistics="data.statistics" :is-self="data.is_self" />

    <div class="mx-auto max-w-app px-5 py-8 sm:px-6">
      <div class="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <SpaceTabSection :user-id="id" :initial="data" />

        <CommunitySidebar follow class="lg:w-[340px]">
          <SpaceSidebar
            :statistics="data.statistics"
            :going="data.going"
            :status="data.status"
            :is-self="data.is_self"
          />
        </CommunitySidebar>
      </div>
    </div>
  </div>
</template>

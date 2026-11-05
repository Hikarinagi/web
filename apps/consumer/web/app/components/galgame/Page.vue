<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineProps<{ data: GalgamePageData; galgameId: number }>()
</script>

<template>
  <Stack gap="none">
    <GalgameHero
      :galgame="data.galgame"
      :display="data.display"
      :my-rate="data.my_rate"
      :favorited="data.favorite?.favorited ?? false"
    />

    <Stack gap="none" class="mx-auto w-full max-w-app gap-10 px-6 py-12">
      <GalgameRatesSummary
        :stats="data.rate_stats"
        :top-rates="data.top_rates"
        :galgame="data.galgame"
        :my-rate="data.my_rate"
      />

      <GalgameAbout
        :galgame="data.galgame"
        :display="data.display"
        :facts="data.facts"
        :tags="data.tags"
        :contributors="data.contributors"
      />

      <GalgameProducts :galgame-id="galgameId" :products="data.products" />

      <GalgameCast :galgame-id="galgameId" :characters="data.characters" />

      <WorkLongReviews :articles="data.articles" />

      <GalgameImages :galgame="data.galgame" />

      <GalgameRelations :relations="data.relations" />

      <GalgameCrew :galgame-id="galgameId" :credits="data.credits" />
    </Stack>
  </Stack>
</template>

<script setup lang="ts">
  import type { PrizesPageData } from '~~/server/api/pages/me/prizes.get'
  import { prizeBff, readPrizeQuery } from '~/features/lottery/results'

  defineOptions({ name: 'PageMePrizes' })

  const route = useRoute()
  const { data } = await useHikariApiData<PrizesPageData>(prizeBff(readPrizeQuery(route.query)), {
    fatal: true,
    watch: false,
  })
</script>

<template>
  <MePrizeCenter v-if="data" :initial="data" />
</template>

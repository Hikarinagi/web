<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'

  defineOptions({ name: 'PageLotteryDetail' })

  const route = useRoute()
  const { t } = useLocaleText()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/lotteries/${id}`, { fatal: true })

  useHikariSeoMeta({
    title: () => data.value?.lottery.title ?? t('lottery.name'),
    appendSiteName: true,
  })
</script>

<template>
  <Stack v-if="data" gap="xl" class="mx-auto w-full max-w-2xl py-8">
    <LotteryDetailHeader :lottery="data.lottery" />
    <LotteryDetailAction :initial="data.lottery" :winners="data.winners" />
    <LotteryDetailWinners
      v-if="data.winners"
      :winners="data.winners"
      :refill="data.lottery.refill"
    />
    <LotteryDetailPrizes :prizes="data.lottery.prizes" />
    <LotteryDetailRules :lottery="data.lottery" />
  </Stack>
</template>

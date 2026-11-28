<script setup lang="ts">
  import { Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import type { LotteryPageData } from '~~/server/api/pages/lotteries/[id].get'

  const props = defineProps<{
    winners: NonNullable<LotteryPageData['winners']>
    refill: boolean
  }>()

  const { t } = useLocaleText()
  const total = computed(() => props.winners.reduce((sum, group) => sum + group.users.length, 0))
</script>

<template>
  <Stack id="winners" as="section" gap="md">
    <Inline align="baseline" justify="between">
      <Heading :level="2" size="lg">{{ t('lottery.winners.title') }}</Heading>
      <Text as="span" size="sm" tone="muted">{{ t('lottery.winners.count', { total }) }}</Text>
    </Inline>
    <Stack gap="lg">
      <Stack v-for="group in winners" :key="group.prize_id" gap="sm">
        <Text as="span" size="sm" weight="semibold">{{ group.tier }}</Text>
        <Inline v-if="group.users.length" gap="none" class="gap-x-5 gap-y-1.5">
          <UserName
            v-for="user in group.users"
            :key="user.id"
            :user="user"
            :handle="false"
            class="text-sm text-muted"
          />
        </Inline>
        <Text v-else as="span" size="sm" tone="faint">{{ t('lottery.winners.none') }}</Text>
      </Stack>
      <Text v-if="refill" as="p" size="xs" tone="faint" class="m-0!">
        {{ t('lottery.winners.refill') }}
      </Text>
    </Stack>
  </Stack>
</template>

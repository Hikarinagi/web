<script setup lang="ts">
  import { Heading, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { LotteryPageData } from '~~/server/api/pages/lotteries/[id].get'

  defineProps<{ lottery: LotteryPageData['lottery'] }>()

  const { t } = useLocaleText()
</script>

<template>
  <Stack gap="sm">
    <Heading :level="1" size="2xl" class="font-bold">{{ lottery.title }}</Heading>
    <Inline gap="sm" align="center" justify="between" :wrap="false">
      <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
        <Avatar :user="lottery.organizer" size="sm" card />
        <UserName :user="lottery.organizer" :handle="false" class="text-sm font-medium" />
        <Text as="span" size="sm" tone="muted" class="shrink-0">
          {{ t('lottery.detail.host') }}
        </Text>
      </Inline>
      <Text v-if="lottery.post_id" as="span" size="sm" class="shrink-0">
        <Link :as="NuxtLink" :to="`/posts/${lottery.post_id}`">
          {{ t('lottery.detail.viewPost') }}
        </Link>
      </Text>
    </Inline>
  </Stack>
</template>

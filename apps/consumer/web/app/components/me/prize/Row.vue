<script setup lang="ts">
  import { Button, Inline, Link, Stack, Text, Time } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { PrizesPageData } from '~~/server/api/pages/me/prizes.get'

  const props = defineProps<{ item: PrizesPageData['list']['items'][number] }>()
  defineEmits<{ changed: [] }>()

  const { t } = useLocaleText()
  const codeOpen = ref(false)
  const accountOpen = ref(false)
  const kind = computed(() => props.item.prize.kind)
  const waiting = computed(() => props.item.status === 'PENDING')
</script>

<template>
  <Inline gap="md" align="center" :wrap="false" class="px-4 py-3">
    <LotteryPrizeImage :prize="item.prize" class="size-14" />

    <Stack gap="none" class="min-w-0 flex-1 gap-0.5">
      <Text as="span" weight="semibold" truncate>{{ item.prize.name }}</Text>
      <Text as="span" size="xs" tone="muted" truncate>
        <Link :as="NuxtLink" :to="`/lotteries/${item.lottery.id}`" tone="neutral">
          {{ item.lottery.title }}
        </Link>
        {{ item.prize.tier }}
      </Text>
      <Text v-if="waiting && item.claim_by" as="span" size="xs" tone="warning">
        <LocaleMessage keypath="lottery.status.claimBy">
          <template #time><Time :value="item.claim_by" /></template>
        </LocaleMessage>
      </Text>
      <Text v-else-if="item.status === 'SUBMITTED'" as="span" size="xs" tone="muted" truncate>
        {{ t('lottery.status.submitted', { account: item.account }) }}
      </Text>
      <Text
        v-else-if="item.status === 'DONE' && kind === 'ACCOUNT'"
        as="span"
        size="xs"
        tone="success"
        truncate
      >
        {{ t('lottery.status.delivered', { account: item.account }) }}
      </Text>
      <Text
        v-else-if="item.status === 'DONE' && kind === 'CODE'"
        as="span"
        size="xs"
        tone="success"
      >
        {{ t('lottery.status.claimed') }}
      </Text>
      <Text v-else-if="item.status === 'DONE'" as="span" size="xs" tone="success">
        {{ t('lottery.status.credited') }}
      </Text>
      <Text v-else-if="item.status === 'FORFEITED'" as="span" size="xs" tone="faint">
        {{ t('lottery.status.forfeited') }}
      </Text>
      <Text v-else-if="item.status === 'REVOKED'" as="span" size="xs" tone="danger" truncate>
        {{ t('lottery.result.revokedNote', { note: item.revoke_note }) }}
      </Text>
    </Stack>

    <Button
      v-if="kind === 'CODE' && (waiting || item.status === 'DONE')"
      size="sm"
      :variant="waiting ? 'solid' : 'ghost'"
      :tone="waiting ? 'accent' : 'neutral'"
      @click="codeOpen = true"
    >
      {{ t('lottery.viewCode') }}
    </Button>
    <Button
      v-else-if="kind === 'ACCOUNT' && (waiting || item.status === 'SUBMITTED')"
      size="sm"
      :variant="waiting ? 'solid' : 'ghost'"
      :tone="waiting ? 'accent' : 'neutral'"
      @click="accountOpen = true"
    >
      {{ waiting ? t('lottery.fillAccount') : t('common.modify') }}
    </Button>

    <LotteryCodeDialog
      v-if="kind === 'CODE'"
      v-model:open="codeOpen"
      :winner-id="item.id"
      :prize="item.prize"
      :lottery-title="item.lottery.title"
      @claimed="$emit('changed')"
    />
    <LotteryAccountDialog
      v-else-if="kind === 'ACCOUNT'"
      v-model:open="accountOpen"
      :winner-id="item.id"
      :prize="item.prize"
      :initial="item.account"
      @submitted="$emit('changed')"
    />
  </Inline>
</template>

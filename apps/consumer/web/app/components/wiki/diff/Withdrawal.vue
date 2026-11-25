<script setup lang="ts">
  import { Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { revisionTime } from '~/features/entry/time'
  import type { Withdrawal } from '~/features/wiki/changes'
  import { DEPRECATION_REASONS } from '~/features/wiki/values'
  import { displayName } from '~/utils/user'

  defineOptions({ name: 'WikiDiffWithdrawal' })

  defineProps<{ withdrawal: Withdrawal }>()
</script>

<template>
  <Stack gap="none" class="min-w-0">
    <Text size="xs" tone="warning">
      已于 {{ revisionTime(withdrawal.withdrawn_at) }} 在<Link
        :as="NuxtLink"
        :to="`/create/wiki/changes/${withdrawal.edit_id}`"
        >另一次修改</Link
      >中作废
    </Text>
    <Text size="xs" tone="muted">作废人：{{ displayName(withdrawal.editor) }}</Text>
    <Text v-if="withdrawal.reason" size="xs" tone="muted">
      理由：{{ DEPRECATION_REASONS[withdrawal.reason] ?? withdrawal.reason }}
    </Text>
    <Text v-if="withdrawal.note" size="xs" tone="muted">说明：{{ withdrawal.note }}</Text>
    <template v-for="(source, index) in withdrawal.sources" :key="index">
      <Text v-if="source.url" size="xs" tone="muted">
        与之矛盾的来源：<Link :href="source.url" target="_blank" rel="noreferrer">{{
          source.url
        }}</Link>
      </Text>
      <Text v-if="source.excerpt" size="xs" tone="muted">摘录：「{{ source.excerpt }}」</Text>
    </template>
  </Stack>
</template>

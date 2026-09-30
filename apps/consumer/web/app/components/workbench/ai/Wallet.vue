<script setup lang="ts">
  import { Button, Inline, Stack, Text } from '@hina-ui/vue'
  import type { BackendAiCredits } from '~/features/items/ai-credits'

  defineProps<{ credits: BackendAiCredits }>()
  defineEmits<{ purchase: [] }>()
</script>

<template>
  <Inline gap="md" align="end" justify="between">
    <Stack gap="xs">
      <Text size="sm" tone="muted">AI 积分</Text>
      <AiCreditAmount
        :balance="credits.balance"
        :free="credits.free_left"
        class="text-2xl font-semibold tracking-tight"
      />
      <Text v-if="credits.held" size="xs" tone="muted">
        进行中的任务预扣 <AiCreditAmount :balance="credits.held" />
      </Text>
    </Stack>
    <Button size="sm" variant="outline" tone="neutral" @click="$emit('purchase')">
      购买
      <HikariPoint class="size-3.5" aria-hidden="true" />
      {{ credits.pack_price }}
    </Button>
  </Inline>
</template>

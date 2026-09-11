<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { CheckInStatus } from '~/features/checkin/checkin'

  defineOptions({ name: 'CheckinMakeUpBar' })

  const props = defineProps<{ status: CheckInStatus | null }>()
  const makeUp = computed(() => props.status?.make_up ?? null)
</script>

<template>
  <Stack gap="sm">
    <Inline gap="md" class="gap-y-1">
      <Inline gap="xs" as="span">
        <span class="size-3 rounded-full bg-accent/20" aria-hidden="true" />
        <Text as="span" size="xs" tone="muted">已签到</Text>
      </Inline>
      <Inline gap="xs" as="span">
        <span class="size-3 rounded-full bg-amber-500/30" aria-hidden="true" />
        <Text as="span" size="xs" tone="muted">补签</Text>
      </Inline>
      <Inline gap="xs" as="span">
        <span
          class="size-3 rounded-full border border-dashed border-line-strong"
          aria-hidden="true"
        />
        <Text as="span" size="xs" tone="muted">漏签</Text>
      </Inline>
    </Inline>

    <Inline v-if="makeUp" justify="between" class="rounded-lg bg-subtle px-4 py-2.5">
      <Text as="span" size="sm">本月补签 {{ makeUp.used }} / {{ makeUp.limit }} 次</Text>
      <Text as="span" size="sm" tone="muted" class="inline-flex items-center gap-1">
        下次消耗 {{ makeUp.next_cost }}
        <HikariPoint class="size-3.5" aria-hidden="true" />
      </Text>
    </Inline>

    <Text size="xs" tone="muted">点日历上的漏签日即可补签</Text>
  </Stack>
</template>

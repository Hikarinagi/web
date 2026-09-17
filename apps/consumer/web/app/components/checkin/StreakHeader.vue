<script setup lang="ts">
  import { Button, Divider, Inline, Skeleton, Stack, Tag, Text } from '@hina-ui/vue'
  import { Flame } from '@lucide/vue'
  import type { CheckInStatus } from '~/features/checkin/checkin'

  defineOptions({ name: 'CheckinStreakHeader' })

  const props = defineProps<{ status: CheckInStatus | null; checking: boolean }>()
  defineEmits<{ checkIn: [] }>()

  const milestones = computed(() =>
    [...(props.status?.config.milestones ?? [])].sort((a, b) => a.days - b.days),
  )
</script>

<template>
  <Stack gap="md">
    <Inline justify="between" align="end">
      <Inline gap="xs" align="baseline">
        <HikariPoint class="size-5 self-center" aria-hidden="true" />
        <Text v-if="status" as="span" size="2xl" weight="semibold">{{ status.points }}</Text>
        <Skeleton v-else class="inline-block h-5 w-12 align-middle" />
        <Text as="span" size="xs" tone="muted">光点</Text>
      </Inline>
      <Button :disabled="!status || status.checked_in_today || checking" @click="$emit('checkIn')">
        {{ status?.checked_in_today ? '今日已签到' : '签到' }}
      </Button>
    </Inline>

    <Inline gap="md" class="rounded-lg bg-subtle px-4 py-3">
      <Inline gap="sm">
        <Flame class="size-5 text-accent" aria-hidden="true" />
        <Stack gap="xs">
          <Text v-if="status" as="span" size="lg" weight="semibold" class="leading-none">
            {{ status.streak }}
          </Text>
          <Skeleton v-else class="h-4.5 w-6" />
          <Inline gap="xs">
            <Text as="span" size="xs" tone="muted">当前连续签到</Text>
            <Question title="连续签到奖励说明" aria-label="查看连续签到奖励说明">
              <Stack gap="sm">
                <Text>每日首次签到会累计当前连续签到天数，断签后会从下一次签到重新计算。</Text>
                <Text>达到奖励天数当天，会在基础签到奖励外额外获得对应光点。</Text>
                <Stack v-if="milestones.length" gap="sm">
                  <Text weight="medium">当前奖励</Text>
                  <Inline gap="sm">
                    <Tag v-for="milestone in milestones" :key="milestone.days" pill>
                      {{ milestone.days }} 天
                      <Text
                        as="span"
                        tone="accent"
                        size="xs"
                        class="inline-flex items-center gap-0.5"
                      >
                        +{{ milestone.bonus }}
                        <HikariPoint class="size-3" aria-hidden="true" />
                      </Text>
                    </Tag>
                  </Inline>
                </Stack>
                <Text v-else>当前暂未配置连续签到奖励。</Text>
                <Text>补签只补齐日历记录和连续天数，不发放基础签到或连续签到奖励。</Text>
              </Stack>
            </Question>
          </Inline>
        </Stack>
      </Inline>

      <Divider orientation="vertical" class="h-8" />

      <Stack gap="xs">
        <Text v-if="status" as="span" size="lg" weight="semibold" class="leading-none">
          {{ status.longest_streak }}
        </Text>
        <Skeleton v-else class="h-4.5 w-6" />
        <Text as="span" size="xs" tone="muted">最长连续签到</Text>
      </Stack>
    </Inline>
  </Stack>
</template>

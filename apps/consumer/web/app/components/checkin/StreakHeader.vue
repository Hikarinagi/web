<script setup lang="ts">
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
  <div class="flex flex-col gap-4 px-5 pt-1">
    <div class="flex items-end justify-between">
      <div class="flex items-baseline gap-1.5">
        <HikariPoint class="size-5 self-center" aria-hidden="true" />
        <span class="text-2xl font-bold text-color">
          <span v-if="status">{{ status.points }}</span>
          <Skeleton v-else width="3rem" height="1.25rem" class="inline-block align-middle" />
        </span>
        <span class="text-[13px] text-muted-color">光点</span>
      </div>
      <Button
        :label="status?.checked_in_today ? '今日已签到' : '签到'"
        :disabled="!status || status.checked_in_today || checking"
        @click="$emit('checkIn')"
      />
    </div>

    <div class="flex items-center gap-4 rounded-lg px-4 py-3 bg-emphasis">
      <div class="flex items-center gap-2">
        <Flame class="size-5 text-primary" aria-hidden="true" />
        <div class="flex flex-col gap-1">
          <span v-if="status" class="text-lg leading-none font-bold text-color">
            {{ status.streak }}
          </span>
          <Skeleton v-else width="1.5rem" height="1.125rem" />
          <div class="flex items-center gap-1">
            <span class="text-xs text-muted-color">当前连续签到</span>
            <Question title="连续签到奖励说明" aria-label="查看连续签到奖励说明">
              <div class="flex flex-col gap-3">
                <p>每日首次签到会累计当前连续签到天数，断签后会从下一次签到重新计算。</p>
                <p>达到奖励天数当天，会在基础签到奖励外额外获得对应光点。</p>
                <div v-if="milestones.length" class="flex flex-col gap-2">
                  <p class="font-medium text-color">当前奖励</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="milestone in milestones"
                      :key="milestone.days"
                      class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-emphasis text-color"
                    >
                      {{ milestone.days }} 天
                      <span class="inline-flex items-center gap-0.5 text-primary">
                        +{{ milestone.bonus }}
                        <HikariPoint class="size-3" aria-hidden="true" />
                      </span>
                    </span>
                  </div>
                </div>
                <p v-else>当前暂未配置连续签到奖励。</p>
                <p>补签只补齐日历记录和连续天数，不发放基础签到或连续签到奖励。</p>
              </div>
            </Question>
          </div>
        </div>
      </div>
      <div class="h-8 w-px bg-surface-200 dark:bg-surface-700" />
      <div class="flex flex-col gap-1">
        <span v-if="status" class="text-lg leading-none font-bold text-color">
          {{ status.longest_streak }}
        </span>
        <Skeleton v-else width="1.5rem" height="1.125rem" />
        <span class="text-xs text-muted-color">最长连续签到</span>
      </div>
    </div>
  </div>
</template>

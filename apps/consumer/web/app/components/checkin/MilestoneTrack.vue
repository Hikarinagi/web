<script setup lang="ts">
  import { Trophy } from '@lucide/vue'
  import type { CheckInStatus } from '~/features/checkin/checkin'

  defineOptions({ name: 'CheckinMilestoneTrack' })

  const props = defineProps<{ status: CheckInStatus | null }>()

  const milestones = computed(() =>
    [...(props.status?.config.milestones ?? [])].sort((a, b) => a.days - b.days),
  )
  const streak = computed(() => props.status?.streak ?? 0)
</script>

<template>
  <div v-if="milestones.length" class="flex flex-col gap-2 px-5">
    <div class="flex items-center gap-1.5 text-xs font-medium text-muted-color">
      <Trophy class="size-3.5" aria-hidden="true" />
      连续签到奖励
    </div>
    <div class="flex flex-wrap gap-2">
      <div
        v-for="milestone in milestones"
        :key="milestone.days"
        :class="[
          'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs',
          streak >= milestone.days ? 'bg-primary/10 text-primary' : 'bg-emphasis text-muted-color',
        ]"
      >
        <span class="font-semibold">{{ milestone.days }} 天</span>
        <span class="inline-flex items-center gap-0.5">
          +{{ milestone.bonus }}
          <HikariPoint class="size-3" aria-hidden="true" />
        </span>
      </div>
    </div>
  </div>
</template>

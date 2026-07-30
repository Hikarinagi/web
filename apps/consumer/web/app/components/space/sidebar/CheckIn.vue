<script setup lang="ts">
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'

  defineOptions({ name: 'SpaceSidebarCheckIn' })

  const props = defineProps<{ status: NonNullable<SpacePageData['status']> }>()

  const checkin = useCheckin()
  const points = computed(() => checkin.status.value?.points ?? props.status.hikari_point)
  const checkedIn = computed(
    () => checkin.status.value?.checked_in_today ?? props.status.checked_in_today,
  )
  const longest = computed(
    () => checkin.status.value?.longest_streak ?? props.status.longest_check_in_streak,
  )
  const streak = computed(() => checkin.status.value?.streak ?? null)
</script>

<template>
  <FeedSidebarPanel title="签到">
    <div class="flex flex-col gap-3 px-4 pb-4">
      <div class="flex items-end justify-between">
        <div class="flex items-baseline gap-1.5">
          <HikariPoint class="size-5 self-center" aria-hidden="true" />
          <span class="text-2xl font-bold text-color">{{ points }}</span>
          <span class="text-[13px] text-muted-color">光点</span>
        </div>
        <Button
          :label="checkedIn ? '签到日历' : '去签到'"
          size="small"
          :severity="checkedIn ? 'secondary' : undefined"
          @click="checkin.open()"
        />
      </div>
      <p class="text-xs text-muted-color">
        <template v-if="streak !== null">当前连续签到 {{ streak }} 天 ·</template>
        历史最长连续签到 {{ longest }} 天
      </p>
    </div>
  </FeedSidebarPanel>
</template>

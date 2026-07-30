<script setup lang="ts">
  defineOptions({ name: 'CheckinHikariPointContent' })

  const { data } = useHikariApiData('/api/v3/site/hikari-points', { lazy: true })
</script>

<template>
  <div class="flex flex-col gap-5 text-sm">
    <div class="flex flex-col gap-2 leading-6 text-color">
      <p>
        光点
        <HikariPoint class="mx-0.5 inline-block size-4 align-text-bottom" />
        （即 hikari point）是 Hikarinagi 的通用货币。
      </p>
      <p>
        你可以通过包括每日签到在内的各种方式（将在下方列出）获取光点！光点可以用来兑换装扮，你随时可以在
        <NuxtLink to="/setting/decoration" class="mx-0.5 font-medium text-primary hover:underline">
          我的装扮
        </NuxtLink>
        页查看详情。
      </p>
    </div>

    <div v-if="data" class="overflow-hidden rounded-xl border border-surface">
      <div
        class="flex items-start justify-between gap-3 border-b border-surface px-4 py-3 last:border-b-0"
      >
        <div class="min-w-0">
          <p class="font-medium text-color">每日签到</p>
          <p class="mt-1 text-xs leading-5 text-muted-color">
            每天签到即可领取，连续签到的天数越长，额外奖励越丰厚
          </p>
        </div>
        <span class="flex shrink-0 items-center gap-0.5 text-base font-semibold text-primary">
          <span>+{{ data.check_in.daily_min }}~{{ data.check_in.daily_max }}</span>
          <HikariPoint class="size-4" />
        </span>
      </div>

      <div
        v-for="c in data.channels"
        :key="c.key"
        class="flex items-start justify-between gap-3 border-b border-surface px-4 py-3 last:border-b-0"
      >
        <div class="min-w-0">
          <p class="font-medium text-color">{{ c.label }}</p>
          <p class="mt-1 text-xs leading-5 text-muted-color">{{ c.description }}</p>
          <p class="mt-1 text-xs text-muted-color">
            每日上限 {{ c.daily_cap }}
            <template v-if="c.first_time > 0">，首次额外 +{{ c.first_time }}</template>
            <template v-if="c.note">，{{ c.note }}</template>
          </p>
        </div>
        <span class="flex shrink-0 items-center gap-0.5 text-base font-semibold text-primary">
          <span>+{{ c.amount }}</span>
          <HikariPoint class="size-4" />
        </span>
      </div>
    </div>
    <Skeleton v-else height="22rem" />

    <div
      class="flex flex-col gap-1.5 border-t border-surface pt-4 text-xs leading-5 text-muted-color"
    >
      <p>*需要注意的是，如果你违反社区规则，我们可能会扣除你的光点作为惩罚</p>
      <p>*光点系统还在持续进化中～我们会在未来提供更多用法和玩法，敬请期待！</p>
    </div>
  </div>
</template>

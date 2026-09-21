<script setup lang="ts">
  import { Card, Inline, Link, Skeleton, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'CheckinHikariPointContent' })

  const { data } = useHikariApiData('/api/v3/site/hikari-points', { lazy: true })
</script>

<template>
  <Stack gap="none" class="gap-5">
    <Stack gap="sm" class="leading-6">
      <Text size="sm">
        光点
        <HikariPoint class="mx-0.5 inline-block size-4 align-text-bottom" />
        （即 hikari point）是 Hikarinagi 的通用货币。
      </Text>
      <Text size="sm">
        你可以通过包括每日签到在内的各种方式（将在下方列出）获取光点！光点可以用来兑换装扮，你随时可以在
        <NuxtLink v-slot="{ href, navigate }" to="/setting/decoration" custom>
          <Link :href="href ?? undefined" class="mx-0.5 font-medium" @click="navigate">
            我的装扮
          </Link>
        </NuxtLink>
        页查看详情。
      </Text>
    </Stack>

    <Card v-if="data" :padded="false" class="rounded-xl">
      <Inline
        align="start"
        justify="between"
        :wrap="false"
        class="border-b border-line px-4 py-3 last:border-b-0"
      >
        <Stack gap="none" class="min-w-0">
          <Text size="sm" weight="medium">每日签到</Text>
          <Text size="xs" tone="muted" class="mt-1 leading-5">
            每天签到即可领取，连续签到的天数越长，额外奖励越丰厚
          </Text>
        </Stack>
        <Inline as="span" gap="none" :wrap="false" class="shrink-0 gap-0.5 text-accent-text">
          <Text as="span" weight="semibold" class="text-inherit">
            +{{ data.check_in.daily_min }}~{{ data.check_in.daily_max }}
          </Text>
          <HikariPoint class="size-4" />
        </Inline>
      </Inline>

      <Inline
        v-for="c in data.channels"
        :key="c.key"
        align="start"
        justify="between"
        :wrap="false"
        class="border-b border-line px-4 py-3 last:border-b-0"
      >
        <Stack gap="none" class="min-w-0">
          <Text size="sm" weight="medium">{{ c.label }}</Text>
          <Text size="xs" tone="muted" class="mt-1 leading-5">{{ c.description }}</Text>
          <Text size="xs" tone="muted" class="mt-1">
            每日上限 {{ c.daily_cap }}
            <template v-if="c.first_time > 0">，首次额外 +{{ c.first_time }}</template>
            <template v-if="c.note">，{{ c.note }}</template>
          </Text>
        </Stack>
        <Inline as="span" gap="none" :wrap="false" class="shrink-0 gap-0.5 text-accent-text">
          <Text as="span" weight="semibold" class="text-inherit">+{{ c.amount }}</Text>
          <HikariPoint class="size-4" />
        </Inline>
      </Inline>
    </Card>
    <Skeleton v-else class="h-88 rounded-xl" />

    <Stack gap="none" class="gap-1.5 border-t border-line pt-4">
      <Text size="xs" tone="muted" class="leading-5">
        *需要注意的是，如果你违反社区规则，我们可能会扣除你的光点作为惩罚
      </Text>
      <Text size="xs" tone="muted" class="leading-5">
        *光点系统还在持续进化中～我们会在未来提供更多用法和玩法，敬请期待！
      </Text>
    </Stack>
  </Stack>
</template>

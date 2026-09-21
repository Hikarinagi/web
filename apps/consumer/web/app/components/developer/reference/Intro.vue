<script setup lang="ts">
  import { Code, Grid, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'

  defineOptions({ name: 'DeveloperReferenceIntro' })

  const GATES = [
    {
      title: '所需 scope',
      detail:
        '逐端点标注。令牌缺少其中任意一项即返回 403，响应会指出缺失的具体 scope。scope 集合不得超出应用在控制台勾选的范围。',
    },
    {
      title: '是否需要用户授权',
      detail:
        '标注于每组标题旁。「需用户授权」的端点要求令牌代表某个已授权用户，只有授权码流程签发的令牌满足；「无需用户授权」的端点两种流程签发的令牌都可调用。',
    },
  ]
</script>

<template>
  <Stack gap="none" class="gap-4">
    <Text as="p" size="sm" tone="muted" class="leading-relaxed"
      >能否调用一个端点由两件事决定，与令牌来自哪种授权流程无关。响应示例展示的是信封内<Code>data</Code>字段的内容，完整信封见<Link
        :as="NuxtLink"
        to="/developers/guide/conventions"
        underline
        >响应约定</Link
      >。</Text
    >

    <Stack gap="none" class="divide-y divide-line">
      <Grid
        v-for="gate in GATES"
        :key="gate.title"
        :cols="1"
        class="gap-1 py-2.5 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-4"
      >
        <Text as="span" size="sm">{{ gate.title }}</Text>
        <Text as="span" size="xs" tone="muted" class="leading-relaxed">{{ gate.detail }}</Text>
      </Grid>
    </Stack>
  </Stack>
</template>

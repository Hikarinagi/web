<script setup lang="ts">
  import { Card, Center, Grid, Link, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'GuideBrandAssets' })

  const ASSETS = [
    {
      name: '图标',
      file: '/brand/hikarinagi-icon.webp',
      usage: '适用于方形与窄空间：按钮前缀、列表行、署名角标',
      contain: false,
    },
    {
      name: '字标',
      file: '/brand/hikarinagi-wordmark.svg',
      usage: '适用于横向空间：正文中的指代、数据来源标注',
      contain: true,
    },
    {
      name: 'Hikarinagi ID 组合标',
      file: '/brand/hikarinagi-id-lockup.svg',
      usage: '仅用于登录与授权入口',
      contain: true,
    },
  ]
</script>

<template>
  <Grid :cols="1" class="gap-3 sm:grid-cols-3">
    <Card v-for="asset in ASSETS" :key="asset.file" class="flex flex-col gap-3 rounded-xl">
      <Center class="min-h-20 rounded-lg bg-subtle p-4">
        <HikariImage
          :src="asset.file"
          :alt="asset.name"
          :skeleton="false"
          :class="asset.contain ? 'h-6 w-auto' : 'size-12 rounded-lg'"
          image-class="size-full object-contain"
        />
      </Center>
      <Stack gap="none" align="start" class="gap-1">
        <Text as="span" size="sm" weight="medium">{{ asset.name }}</Text>
        <Text as="span" size="xs" tone="muted">{{ asset.usage }}</Text>
        <Link as="a" :href="asset.file" download class="font-mono text-xs break-all">
          {{ asset.file }}
        </Link>
      </Stack>
    </Card>
  </Grid>
</template>

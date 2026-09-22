<script setup lang="ts">
  import { Inline, QRCode, Stack, Text } from '@hina-ui/vue'
  import appIcon from '~/assets/images/app/app-icon.webp'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'AppDownloadQrCode' })

  const props = defineProps<{ url: string | null; downloadable: boolean }>()

  const usable = computed(() => props.downloadable && Boolean(props.url))
</script>

<template>
  <Inline
    v-tooltip="usable ? null : '敬请期待'"
    gap="md"
    align="center"
    :wrap="false"
    class="hidden lg:flex"
  >
    <QRCode
      :value="url ?? ''"
      label="扫码下载 Android 版"
      :size="96"
      :logo="appIcon"
      :logo-size="20"
      :bordered="false"
      :class="cn('shadow-md', !usable && 'opacity-20 blur-hikari-2xs')"
    />
    <Stack gap="none">
      <Text as="span" size="xs" tone="muted" class="leading-relaxed">扫码安装</Text>
      <Text as="span" size="xs" tone="muted" class="leading-relaxed">Android 版</Text>
    </Stack>
  </Inline>
</template>

<script setup lang="ts">
  import { Inline, Skeleton, Stack, Text } from '@hina-ui/vue'
  import appIcon from '~/assets/images/app/app-icon.webp'

  defineOptions({ name: 'AppDownloadQrCode' })

  const props = defineProps<{ src: string | null; downloadable: boolean }>()

  const usable = computed(() => props.downloadable && Boolean(props.src))
</script>

<template>
  <Inline
    v-tooltip="usable ? null : '敬请期待'"
    gap="md"
    align="center"
    :wrap="false"
    class="hidden lg:flex"
  >
    <Stack gap="none" class="relative rounded-lg bg-white p-2 shadow-md">
      <HikariImage
        v-if="src"
        :src="src"
        alt="扫码下载 Android 版"
        class="size-20"
        image-class="size-20"
        :class="usable ? null : 'opacity-20 blur-hikari-2xs'"
      >
        <template #skeleton>
          <Skeleton class="size-full rounded-sm" />
        </template>
      </HikariImage>
      <Stack v-else gap="none" class="size-20 rounded-sm bg-neutral-200" />
      <HikariImage
        :src="appIcon"
        alt=""
        class="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-md ring-2 ring-white"
        image-class="size-5 rounded-md"
        :skeleton="false"
        :lazy="false"
        aria-hidden="true"
      />
    </Stack>
    <Stack gap="none">
      <Text as="span" size="xs" tone="muted" class="leading-relaxed">扫码安装</Text>
      <Text as="span" size="xs" tone="muted" class="leading-relaxed">Android 版</Text>
    </Stack>
  </Inline>
</template>

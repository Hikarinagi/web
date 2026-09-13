<script setup lang="ts">
  import appIcon from '~/assets/images/app/app-icon.webp'

  defineOptions({ name: 'AppDownloadQrCode' })

  const props = defineProps<{ src: string | null; downloadable: boolean }>()

  const usable = computed(() => props.downloadable && Boolean(props.src))
</script>

<template>
  <div v-tooltip.top="usable ? undefined : '敬请期待'" class="hidden items-center gap-3 lg:flex">
    <div class="relative rounded-lg bg-surface-0 p-2 shadow-md dark:bg-white">
      <HikariImage
        v-if="src"
        :src="src"
        alt="扫码下载 Android 版"
        class="size-20"
        image-class="size-20"
        :class="usable ? null : 'opacity-20 blur-[3px]'"
      />
      <div v-else class="size-20 rounded-sm bg-surface-200" />
      <HikariImage
        :src="appIcon"
        alt=""
        class="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-[5px] ring-2 ring-white"
        image-class="size-5 rounded-[5px]"
        :skeleton="false"
        :lazy="false"
        aria-hidden="true"
      />
    </div>
    <span class="text-xs leading-relaxed text-muted-color">
      扫码安装
      <br />
      Android 版
    </span>
  </div>
</template>

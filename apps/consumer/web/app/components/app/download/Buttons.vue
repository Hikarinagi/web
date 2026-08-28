<script setup lang="ts">
  import type { AppPageData } from '~~/server/api/pages/app.get'

  defineOptions({ name: 'AppDownloadButtons' })

  const props = defineProps<{ release: AppPageData['release']; downloadable: boolean }>()

  const platforms = computed(() => {
    const android =
      props.release.android?.find(item => item.abi === 'arm64-v8a') ?? props.release.android?.[0]

    return [
      { key: 'android', icon: 'simple-icons:android', name: 'Android 版', target: android },
      {
        key: 'ios',
        icon: 'simple-icons:apple',
        name: 'iOS 版',
        target: props.release.ios ?? undefined,
      },
    ]
  })

  function sizeLabel(size: number) {
    return size > 0 ? `${(size / 1e6).toFixed(1)} MB` : ''
  }
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
    <template v-for="platform in platforms" :key="platform.key">
      <Button
        v-if="platform.target && downloadable"
        as="a"
        :href="platform.target.url"
        download
        :severity="platform.key === 'ios' ? 'secondary' : undefined"
        :outlined="platform.key === 'ios'"
        :label="`${platform.name} ${sizeLabel(platform.target.size)}`"
      >
        <template #icon>
          <Icon :name="platform.icon" class="size-4" />
        </template>
      </Button>
      <span v-else v-tooltip.top="'敬请期待'" class="inline-flex">
        <Button
          disabled
          :severity="platform.key === 'ios' ? 'secondary' : undefined"
          :outlined="platform.key === 'ios'"
          :label="platform.name"
        >
          <template #icon>
            <Icon :name="platform.icon" class="size-4" />
          </template>
        </Button>
      </span>
    </template>
  </div>
</template>

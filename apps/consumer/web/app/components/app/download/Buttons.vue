<script setup lang="ts">
  import { Button, Inline, Tooltip } from '@hina-ui/vue'
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
  <Inline justify="center" class="lg:justify-start">
    <template v-for="platform in platforms" :key="platform.key">
      <Button
        v-if="platform.target && downloadable"
        as="a"
        :href="platform.target.url"
        download
        :variant="platform.key === 'ios' ? 'outline' : 'solid'"
        :tone="platform.key === 'ios' ? 'neutral' : 'accent'"
      >
        <template #icon>
          <Icon :name="platform.icon" />
        </template>
        {{ `${platform.name} ${sizeLabel(platform.target.size)}` }}
      </Button>

      <Tooltip v-else content="敬请期待">
        <span class="inline-flex">
          <Button
            disabled
            :variant="platform.key === 'ios' ? 'outline' : 'solid'"
            :tone="platform.key === 'ios' ? 'neutral' : 'accent'"
          >
            <template #icon>
              <Icon :name="platform.icon" />
            </template>
            {{ platform.name }}
          </Button>
        </span>
      </Tooltip>
    </template>
  </Inline>
</template>

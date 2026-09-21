<script setup lang="ts">
  import { Button, Inline, Popover, Stack, Tag, Text } from '@hina-ui/vue'
  import type { AppPageData } from '~~/server/api/pages/app.get'

  defineOptions({ name: 'AppDownloadNotes' })

  const props = defineProps<{ release: AppPageData['release']; downloadable: boolean }>()

  const others = computed(() =>
    (props.release.android ?? []).filter(item => item.abi !== 'arm64-v8a').slice(0, 4),
  )
  const ios = computed(() => props.release.ios ?? null)

  const sideloadSteps = [
    '在PC设备上安装 AltStore 或 Sideloadly，登录你的 Apple ID',
    '连接 iPhone，加载下载完成的 .ipa 文件，等待安装完毕',
    '在 iPhone 上打开「设置 › 通用 › VPN 与设备管理」，信任自己的 Apple ID',
  ]

  function sizeLabel(size: number) {
    return size > 0 ? `${(size / 1e6).toFixed(1)} MB` : ''
  }

  const buildLabel = computed(() => {
    const manifest = props.release
    if (!manifest) return ''
    if (manifest.channel === 'release') return `v${manifest.version}`

    return [manifest.build_number && `#${manifest.build_number}`, manifest.commit?.slice(0, 7)]
      .filter(Boolean)
      .join(' · ')
  })
</script>

<template>
  <Inline gap="sm">
    <Tag v-if="buildLabel" class="font-mono">{{ buildLabel }}</Tag>

    <Popover v-if="others.length" :padded="false" class="p-1.5">
      <Button variant="link" tone="neutral" size="sm" :disabled="!downloadable">其他架构</Button>

      <template #content>
        <Stack gap="sm" class="w-60">
          <Button
            v-for="variant in others"
            :key="variant.abi"
            as="a"
            :href="variant.url"
            download
            variant="outline"
            tone="neutral"
            size="sm"
          >
            {{ `${variant.abi} · ${sizeLabel(variant.size)}` }}
          </Button>
        </Stack>
      </template>
    </Popover>

    <Popover v-if="!ios || !ios.signed">
      <Button variant="link" tone="neutral" size="sm">iOS侧载说明</Button>

      <template #content>
        <Stack as="ol" gap="md" class="w-72">
          <Inline v-for="(step, index) in sideloadSteps" :key="step" as="li" gap="sm">
            <Text
              as="span"
              size="xs"
              weight="semibold"
              class="grid size-5 shrink-0 place-items-center rounded-full bg-subtle"
            >
              {{ index + 1 }}
            </Text>
            <Text as="span" size="xs" tone="muted">{{ step }}</Text>
          </Inline>
        </Stack>
      </template>
    </Popover>
  </Inline>
</template>

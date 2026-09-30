<script setup lang="ts">
  import { Button, Inline, Popover, Stack, Tag } from '@hina-ui/vue'
  import type { AppPageData } from '~~/server/api/pages/app.get'

  defineOptions({ name: 'AppDownloadNotes' })

  const props = defineProps<{ release: AppPageData['release']; downloadable: boolean }>()

  const others = computed(() =>
    (props.release.android ?? []).filter(item => item.abi !== 'arm64-v8a').slice(0, 4),
  )
  const ios = computed(() => props.release.ios ?? null)
  const ohos = computed(() => props.release.ohos ?? null)

  const iosSteps = [
    '在PC设备上安装 AltStore 或 Sideloadly，登录你的 Apple ID',
    '连接 iPhone，加载下载完成的 .ipa 文件，等待安装完毕',
    '在 iPhone 上打开「设置 › 通用 › VPN 与设备管理」，信任自己的 Apple ID',
  ]
  const ohosSteps = [
    '在手机上，点击「设置 › 关于本机」中的「软件版本」七次以打开开发者模式',
    '在「设置 › 系统 › 开发者选项」中打开「USB调试」',
    '在你的计算机上安装小白调试助手并使用你的华为账号登录',
    '连接手机，选择下载的 .hap 文件，单击「开始调试（自动签名）」并等待安装完成',
  ]
  const ohosHints = [
    '需要 HarmonyOS 5.1 或更高版本。在早期版本上，请安装 Android 版。',
    '以这种方式安装的应用可以使用 14 天，或者在你完成华为开发者账号实名认证后使用 180 天。',
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
  <Inline gap="sm" justify="center" class="lg:justify-start">
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

    <AppDownloadSideload v-if="!ios || !ios.signed" label="iOS侧载说明" :steps="iosSteps" />
    <AppDownloadSideload
      v-if="ohos && !ohos.signed"
      label="HarmonyOS侧载说明"
      :steps="ohosSteps"
      :hints="ohosHints"
    />
  </Inline>
</template>

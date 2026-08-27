<script setup lang="ts">
  import type { AppPageData } from '~~/server/api/pages/app.get'

  defineOptions({ name: 'AppDownloadNotes' })

  const props = defineProps<{ manifest: AppPageData['manifest'] }>()

  const abiPopover = ref<{ toggle: (event: Event) => void }>()
  const sideloadPopover = ref<{ toggle: (event: Event) => void }>()

  const others = computed(() =>
    (props.manifest?.android ?? []).filter(item => item.abi !== 'arm64-v8a').slice(0, 4),
  )
  const ios = computed(() => props.manifest?.ios ?? null)

  const sideloadSteps = [
    '在PC设备上安装 AltStore 或 Sideloadly，登录你的 Apple ID',
    '连接 iPhone，加载下载完成的 .ipa 文件，等待安装完毕',
    '在 iPhone 上打开「设置 › 通用 › VPN 与设备管理」，信任自己的 Apple ID',
  ]

  function sizeLabel(size: number) {
    return size > 0 ? `${(size / 1e6).toFixed(1)} MB` : ''
  }

  const buildLabel = computed(() => {
    const manifest = props.manifest
    if (!manifest) return ''
    if (manifest.channel === 'release') return `v${manifest.version}`

    return [manifest.build_number && `#${manifest.build_number}`, manifest.commit?.slice(0, 7)]
      .filter(Boolean)
      .join(' · ')
  })
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
    <Tag v-if="buildLabel" severity="secondary" class="!font-mono !text-xs">{{ buildLabel }}</Tag>
    <Button
      v-if="others.length"
      variant="link"
      size="small"
      class="!text-xs"
      label="其他架构"
      @click="abiPopover?.toggle($event)"
    />
    <Button
      v-if="!ios || !ios.signed"
      variant="link"
      size="small"
      class="!text-xs"
      label="iOS侧载说明"
      @click="sideloadPopover?.toggle($event)"
    />

    <Popover ref="abiPopover" :pt="{ root: { class: 'popover-no-arrow' } }">
      <div class="flex w-60 flex-col gap-2">
        <Button
          v-for="variant in others"
          :key="variant.abi"
          as="a"
          :href="variant.url"
          download
          severity="secondary"
          outlined
          size="small"
          :label="`${variant.abi} · ${sizeLabel(variant.size)}`"
        />
      </div>
    </Popover>

    <Popover ref="sideloadPopover" :pt="{ root: { class: 'popover-no-arrow' } }">
      <ol class="flex w-72 flex-col gap-3">
        <li v-for="(step, index) in sideloadSteps" :key="step" class="flex gap-2.5">
          <span
            class="grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold bg-emphasis"
          >
            {{ index + 1 }}
          </span>
          <span class="text-xs leading-relaxed text-muted-color">{{ step }}</span>
        </li>
      </ol>
    </Popover>
  </div>
</template>

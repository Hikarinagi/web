<script setup lang="ts">
  import { ExternalLink, RotateCw } from '@lucide/vue'

  defineOptions({ name: 'GalgameAboutSteamFallback' })
  const props = defineProps<{ appIds: number[]; failed: boolean }>()
  defineEmits<{ retry: [] }>()

  const links = computed(() =>
    props.appIds.map((appId, index) => ({
      appId,
      url: `https://store.steampowered.com/app/${appId}/`,
      label: props.appIds.length > 1 ? `商店页 ${index + 1}` : '在 Steam 上查看',
    })),
  )
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-200 bg-surface-0 px-4 py-3 dark:border-surface-800 dark:bg-surface-900"
  >
    <p class="text-[13px] text-surface-500 dark:text-surface-400">无法从 Steam 获取信息</p>

    <div class="flex flex-wrap items-center gap-2">
      <Button
        v-if="failed"
        severity="secondary"
        size="small"
        variant="text"
        label="重试"
        @click="$emit('retry')"
      >
        <template #icon>
          <RotateCw :size="14" />
        </template>
      </Button>

      <Button
        v-for="link in links"
        :key="link.appId"
        as="a"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        severity="secondary"
        size="small"
        :label="link.label"
      >
        <template #icon>
          <ExternalLink :size="14" />
        </template>
      </Button>
    </div>
  </div>
</template>

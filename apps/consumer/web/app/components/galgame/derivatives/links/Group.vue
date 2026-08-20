<script setup lang="ts">
  import { AtSign, BookOpen, Globe, Link2, Plus, Rss, Trash2 } from '@lucide/vue'
  import type { Component } from 'vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { useExternalLinkMutations } from '~/features/galgame/useExternalLinkMutations'

  defineOptions({ name: 'GalgameDerivativesLinksGroup' })
  const props = defineProps<{ items: GalgamePageData['links']; galgameId: number }>()

  const auth = useAuthStore()
  const addVisible = ref(false)
  const { removing, confirmRemove } = useExternalLinkMutations(props.galgameId)

  const TYPE_ICONS: Record<string, Component> = {
    WEBSITE: Globe,
    TWITTER: AtSign,
    BLOG: Rss,
    WIKI: BookOpen,
    OTHER: Link2,
  }

  function iconOf(type: string) {
    return TYPE_ICONS[type] ?? Link2
  }

  function canRemove(item: GalgamePageData['links'][number]) {
    const role = auth.user?.role
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return true
    return item.creator?.id != null && auth.user?.id === item.creator.id
  }

  // 与相关作品分组一致:空则隐藏;登录用户保留空态与添加入口
  const visible = computed(() => props.items.length > 0 || auth.isAuthenticated)
</script>

<template>
  <div v-if="visible" class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <h3 class="text-[15px] font-bold text-surface-700 dark:text-surface-200">其他资料</h3>
      <p class="text-[13px] text-surface-500 dark:text-surface-400">{{ items.length }} 条</p>
      <Button
        v-if="auth.isAuthenticated"
        label="添加"
        text
        size="small"
        class="ml-auto"
        @click="addVisible = true"
      >
        <template #icon>
          <Plus :size="14" />
        </template>
      </Button>
    </div>
    <CreatorEmpty v-if="!items.length" :icon="Link2" text="还没有其他资料链接" />
    <div v-else class="flex flex-col gap-1.5">
      <div
        v-for="item in items"
        :key="item.id"
        class="group flex items-center gap-2.5 rounded-lg border border-surface-200 px-3 py-2 dark:border-surface-800"
      >
        <component :is="iconOf(item.type)" :size="15" class="shrink-0 text-muted-color" />
        <Button
          as="a"
          :href="item.url"
          target="_blank"
          rel="noopener"
          :label="item.name"
          variant="link"
          class="shrink-0 px-0 py-0 text-sm"
        />
        <span class="min-w-0 flex-1 truncate text-xs text-surface-400 dark:text-surface-500">
          {{ item.url }}
        </span>
        <Button
          v-if="canRemove(item)"
          v-tooltip.top="'删除'"
          unstyled
          :disabled="removing"
          class="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-color opacity-100 transition-opacity hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
          @click="confirmRemove(item)"
        >
          <template #icon>
            <Trash2 :size="13" />
          </template>
        </Button>
      </div>
    </div>
    <GalgameDerivativesLinksAddDialog v-model:visible="addVisible" :galgame-id="galgameId" />
  </div>
</template>

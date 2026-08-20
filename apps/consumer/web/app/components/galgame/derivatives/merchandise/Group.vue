<script setup lang="ts">
  import { Package, Plus } from '@lucide/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameDerivativesMerchandiseGroup' })
  const props = defineProps<{ items: GalgamePageData['merchs']; galgameId: number }>()

  const auth = useAuthStore()
  const addVisible = ref(false)
  // 与相关作品分组一致:空则隐藏;登录用户保留空态与添加入口
  const visible = computed(() => props.items.length > 0 || auth.isAuthenticated)
</script>

<template>
  <div v-if="visible" class="flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <h3 class="text-[15px] font-bold text-surface-700 dark:text-surface-200">
        实体出版/周边制品
      </h3>
      <p class="text-[13px] text-surface-500 dark:text-surface-400">{{ items.length }} 件</p>
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
    <CreatorEmpty v-if="!items.length" :icon="Package" text="还没有实体出版或周边制品信息" />
    <div v-else class="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
      <GalgameDerivativesMerchandiseCard v-for="item in items" :key="item.id" :item="item" />
    </div>
    <GalgameDerivativesMerchandiseAddDialog v-model:visible="addVisible" :galgame-id="galgameId" />
  </div>
</template>

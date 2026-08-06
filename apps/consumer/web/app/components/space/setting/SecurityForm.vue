<script setup lang="ts">
  import { ArrowUpRight } from '@lucide/vue'

  defineOptions({ name: 'SpaceSettingSecurityForm' })

  defineProps<{ email: string }>()
</script>

<template>
  <CardPanel title="账号安全" description="前往 Hikarinagi ID 管理中心管理你的账号信息">
    <div class="flex items-center justify-between gap-4">
      <div class="min-w-0">
        <p class="truncate text-sm font-medium text-color">{{ email }}</p>
        <p class="text-xs text-muted-color">当前登录邮箱</p>
      </div>
      <Button as="a" href="/auth/account" label="前往账号管理" severity="secondary" outlined>
        <template #icon><ArrowUpRight class="size-4" /></template>
      </Button>
    </div>
  </CardPanel>
</template>

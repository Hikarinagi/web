<script setup lang="ts">
  import { LogOut, ShieldCheck } from '@lucide/vue'

  const { visible, pending, pendingScope, submit } = useLogout()
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="退出登录"
    :style="{ width: '24rem' }"
    :dismissable-mask="!pending"
    :close-on-escape="!pending"
  >
    <div class="flex flex-col gap-3">
      <p class="text-sm text-muted-color">选择登出范围</p>

      <Button
        class="w-full"
        autofocus
        :loading="pendingScope === 'global'"
        :disabled="pending"
        @click="submit('global')"
      >
        <span class="flex w-full items-center gap-3">
          <ShieldCheck class="size-5 shrink-0" aria-hidden="true" />
          <span class="flex min-w-0 flex-col text-left">
            <span class="font-medium">登出全部</span>
            <span class="text-xs opacity-80">撤销本设备所有站点的Hikarinagi ID登录态</span>
          </span>
        </span>
      </Button>

      <Button
        class="w-full"
        severity="secondary"
        outlined
        :loading="pendingScope === 'local'"
        :disabled="pending"
        @click="submit('local')"
      >
        <span class="flex w-full items-center gap-3">
          <LogOut class="size-5 shrink-0" aria-hidden="true" />
          <span class="flex min-w-0 flex-col text-left">
            <span class="font-medium">仅退出本站</span>
            <span class="text-xs text-muted-color">下次可无需密码快速登录</span>
          </span>
        </span>
      </Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
  import { Check, Copy, RotateCcwKey } from '@lucide/vue'
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'

  defineOptions({ name: 'DeveloperConsoleAppCredentialsPanel' })

  const props = defineProps<{ app: DeveloperAppPageData['app'] }>()
  const emit = defineEmits<{ rotated: [secret: { client_id: string; client_secret: string }] }>()

  const confirm = useConfirm()
  const busy = ref(false)
  const { copy, copied } = useClipboard({ source: () => props.app.client_id })

  const createdAt = computed(() => new Date(props.app.created_at).toLocaleDateString('zh-CN'))

  function confirmRotate() {
    confirm.require({
      group: 'app-shell',
      header: '轮换密钥',
      message: '旧密钥将立即失效，正在使用该应用的服务需要更换新密钥',
      acceptProps: { label: '轮换', severity: 'danger' },
      rejectProps: { label: '取消', severity: 'secondary' },
      accept: () => void rotate(),
    })
  }

  async function rotate() {
    busy.value = true
    try {
      const result = await hikariRequest<
        '/api/v3/user/me/developer/apps/{client_id}/secret',
        'post'
      >('/api/v3/user/me/developer/apps/{client_id}/secret', {
        method: 'post',
        path: { client_id: props.app.client_id },
      })
      emit('rotated', { client_id: result.client_id, client_secret: result.client_secret })
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <section class="flex flex-col gap-4 py-6 first:pt-0 last:pb-0">
    <div class="flex items-center justify-between gap-4">
      <h3 class="text-sm font-semibold text-color">凭据</h3>
      <Button label="轮换密钥" severity="warn" :loading="busy" @click="confirmRotate">
        <template #icon><RotateCcwKey /></template>
      </Button>
    </div>

    <dl class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <dt class="text-xs text-muted-color">client_id</dt>
        <dd class="flex items-center gap-1.5">
          <code class="font-mono text-sm text-color">{{ app.client_id }}</code>
          <Button
            unstyled
            class="inline-flex items-center justify-center rounded p-1 text-muted-color hover:bg-emphasis"
            :aria-label="copied ? '已复制' : '复制 client_id'"
            @click="copy()"
          >
            <Check v-if="copied" class="size-3.5 text-hikari-primary-500" />
            <Copy v-else class="size-3.5" />
          </Button>
        </dd>
      </div>
      <div class="flex flex-col gap-1">
        <dt class="text-xs text-muted-color">创建时间</dt>
        <dd class="text-sm text-color">{{ createdAt }}</dd>
      </div>
    </dl>
  </section>
</template>

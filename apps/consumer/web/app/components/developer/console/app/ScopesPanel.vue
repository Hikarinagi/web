<script setup lang="ts">
  import { Check, Copy } from '@lucide/vue'
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'
  import { DEVELOPER_SCOPES, developerScopeGroups } from '~/features/developer/scopes'

  defineOptions({ name: 'DeveloperConsoleAppScopesPanel' })

  const props = defineProps<{ app: DeveloperAppPageData['app'] }>()
  const emit = defineEmits<{ changed: [] }>()

  const groups = developerScopeGroups()
  const busy = ref(false)
  const granted = computed(() => new Set((props.app.scope ?? '').split(' ').filter(Boolean)))
  const hasRedirect = computed(() => props.app.redirect_uris.length > 0)
  const lockedByRedirect = (group: { requires_user: boolean }) =>
    group.requires_user && !hasRedirect.value

  const { copy, copied } = useClipboard()
  const lastCopied = ref('')
  function copyScope(scope: string) {
    copy(scope)
    lastCopied.value = scope
  }

  async function toggle(scope: string, next: boolean) {
    if (busy.value) return
    busy.value = true
    try {
      const scopes = DEVELOPER_SCOPES.map(entry => entry.scope).filter(value =>
        value === scope ? next : granted.value.has(value),
      )
      await hikariRequest<'/api/v3/user/me/developer/apps/{client_id}', 'patch'>(
        '/api/v3/user/me/developer/apps/{client_id}',
        { method: 'patch', path: { client_id: props.app.client_id }, body: { scopes } },
      )
      emit('changed')
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <section class="flex flex-col gap-4 py-6 first:pt-0 last:pb-0">
    <h3 class="text-sm font-semibold text-color">授权</h3>

    <div v-for="group in groups" :key="group.domain" class="flex flex-col gap-2">
      <p class="font-mono text-xs font-semibold tracking-widest text-muted-color uppercase">
        {{ group.label }}
      </p>
      <p v-if="lockedByRedirect(group)" class="text-xs text-muted-color">
        该组权限代表用户执行操作，需通过授权码流程取得。请先在下方「回调地址」中添加至少一条地址。
      </p>
      <div class="grid gap-2 sm:grid-cols-2">
        <div
          v-for="entry in group.entries"
          :key="entry.scope"
          class="flex items-start gap-2.5 rounded-lg border border-surface p-3 transition-colors hover:bg-emphasis"
        >
          <label class="flex min-w-0 flex-1 cursor-pointer items-start gap-2.5">
            <Checkbox
              binary
              :model-value="granted.has(entry.scope)"
              :disabled="busy || (lockedByRedirect(group) && !granted.has(entry.scope))"
              :aria-label="entry.label"
              @update:model-value="(value: boolean) => toggle(entry.scope, value)"
            />
            <span class="flex min-w-0 flex-col gap-1">
              <code class="font-mono text-sm font-medium text-color">{{ entry.scope }}</code>
              <span class="flex items-center gap-1 text-xs text-muted-color">
                {{ entry.label }}
                <Question
                  v-if="entry.description"
                  :show-dialog="false"
                  :tooltip="entry.description"
                />
              </span>
            </span>
          </label>
          <Button
            unstyled
            class="inline-flex shrink-0 items-center justify-center rounded p-1 text-muted-color transition-colors hover:text-color"
            :aria-label="copied && lastCopied === entry.scope ? '已复制' : `复制 ${entry.scope}`"
            @click="copyScope(entry.scope)"
          >
            <Check
              v-if="copied && lastCopied === entry.scope"
              class="size-3.5 text-hikari-primary-500"
            />
            <Copy v-else class="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { ReferenceOperation } from '~~/server/features/developer/reference'

  defineOptions({ name: 'DeveloperReferenceCodePanel' })
  defineProps<{ operation: ReferenceOperation }>()

  const LANGUAGES = [
    { value: 'curl', label: 'curl' },
    { value: 'js', label: 'JavaScript' },
  ]

  const preferred = useCookie<string>('hikari_developer_code_language', {
    default: () => 'curl',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    watch: false,
  })
  const language = ref(preferred.value)

  function select(value: string) {
    language.value = value
    preferred.value = value
  }
</script>

<template>
  <div
    class="flex flex-col gap-3 lg:sticky lg:top-[calc(var(--app-header-height)+24px)] lg:self-start"
  >
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-1">
        <Button
          v-for="entry in LANGUAGES"
          :key="entry.value"
          unstyled
          class="rounded-md px-2 py-1 font-mono text-xs transition-colors"
          :class="
            language === entry.value
              ? 'font-semibold bg-emphasis text-color'
              : 'text-muted-color hover:text-color'
          "
          :aria-pressed="language === entry.value"
          @click="select(entry.value)"
        >
          {{ entry.label }}
        </Button>
      </div>
      <DeveloperCodeBlock
        capped
        :code="language === 'js' ? operation.js : operation.curl"
        :html="language === 'js' ? operation.jsHtml : operation.curlHtml"
      />
    </div>

    <div v-if="operation.responseExample" class="flex flex-col gap-2">
      <p class="text-xs text-muted-color">响应示例</p>
      <DeveloperCodeBlock capped :code="operation.responseExample" :html="operation.responseHtml" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { IconButton, Inline } from '@hina-ui/vue'
  import { ArrowLeft, ArrowRight } from '@lucide/vue'

  defineOptions({ name: 'CreatorShellHistory' })

  const nav = useTabNav()
  const mounted = useMounted()
</script>

<template>
  <Inline gap="none" align="center" :wrap="false" class="shrink-0">
    <IconButton
      variant="ghost"
      tone="neutral"
      size="sm"
      label="返回"
      :disabled="!mounted || !nav.canBack.value"
      @click="nav.back()"
    >
      <ArrowLeft />
    </IconButton>
    <IconButton
      variant="ghost"
      tone="neutral"
      size="sm"
      label="前进"
      :disabled="!mounted || !nav.canForward.value"
      @click="nav.forward()"
    >
      <ArrowRight />
    </IconButton>
  </Inline>
</template>

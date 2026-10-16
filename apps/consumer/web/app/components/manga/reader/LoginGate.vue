<script setup lang="ts">
  import { Heading, Inline, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'MangaReaderLoginGate' })

  const props = defineProps<{ mangaId: number }>()

  function back() {
    void navigateTo(`/mangas/${props.mangaId}`)
  }
</script>

<template>
  <Stack align="center" justify="center" gap="lg" class="dark h-dvh bg-neutral-950 px-6 text-fg">
    <Heading :level="1" size="lg">登录后继续阅读</Heading>
    <Inline :wrap="false">
      <Button login-required size="lg">登录</Button>
      <Button variant="soft" tone="neutral" size="lg" @click="back">返回作品页</Button>
    </Inline>
  </Stack>
</template>

<script setup lang="ts">
  import { Heading, Inline, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'MangaReaderLoginGate' })

  const props = defineProps<{ mangaId: number }>()

  function back() {
    void navigateTo(`/mangas/${props.mangaId}`)
  }
</script>

<template>
  <Stack align="center" justify="center" gap="lg" class="h-dvh bg-neutral-950 px-6">
    <Stack align="center" gap="none" class="gap-1.5 text-center">
      <Heading :level="1" size="lg" class="text-neutral-0">登录后继续阅读</Heading>
      <Text size="sm" class="text-neutral-400">
        登录后免费阅读全部章节，还可以随时随地同步阅读进度
      </Text>
    </Stack>
    <Inline :wrap="false">
      <Button login-required pill class="px-6">登录 / 注册</Button>
      <Button
        variant="ghost"
        pill
        class="bg-neutral-0/12 text-neutral-0 hover:bg-neutral-0/20"
        @click="back"
      >
        返回详情页
      </Button>
    </Inline>
  </Stack>
</template>

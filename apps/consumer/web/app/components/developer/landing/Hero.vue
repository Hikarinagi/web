<script setup lang="ts">
  import { Button, Flex, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'

  defineOptions({ name: 'DeveloperLandingHero' })

  const TITLE = 'Code Together'

  const typed = ref('')
  const typing = ref(false)
  const reducedMotion = usePreferredReducedMotion()

  let timer: ReturnType<typeof setTimeout> | undefined

  function typeNext(index: number) {
    if (index > TITLE.length) {
      typing.value = false
      return
    }
    typed.value = TITLE.slice(0, index)
    const pause = Math.random() < 0.1 ? 120 : 0
    timer = setTimeout(() => typeNext(index + 1), 35 + Math.random() * 70 + pause)
  }

  onMounted(() => {
    if (reducedMotion.value === 'reduce') {
      typed.value = TITLE
      return
    }
    typing.value = true
    timer = setTimeout(() => typeNext(1), 250)
  })

  onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <Stack as="section" gap="none" class="relative overflow-hidden border-b border-line">
    <div class="hero-grid absolute inset-0" aria-hidden="true" />

    <Flex
      direction="col"
      justify="center"
      gap="none"
      class="relative z-10 mx-auto box-content min-h-[calc(360px+var(--app-header-height))] w-full max-w-app gap-12 px-6 pt-[calc(var(--app-header-height)+48px)] pb-16 lg:flex-row lg:items-center lg:gap-16"
    >
      <Stack gap="none" align="start" class="max-w-xl flex-1 gap-5">
        <Heading
          :level="1"
          :aria-label="TITLE"
          class="font-mono text-5xl font-extrabold tracking-tight lg:text-6xl"
        >
          <span aria-hidden="true" v-text="typed" />
          <span
            aria-hidden="true"
            class="text-accent"
            :class="{ 'hero-caret': !typing }"
            v-text="'_'"
          />
        </Heading>

        <Text as="p" size="lg" tone="muted">使用 Hikarinagi 的公开数据构建你的应用</Text>

        <Inline gap="md" align="center">
          <Button as-child>
            <NuxtLink to="/developers/guide">查看文档</NuxtLink>
          </Button>
          <AuthGateButton
            variant="outline"
            tone="neutral"
            @click="navigateTo('/developers/console')"
          >
            进入控制台
          </AuthGateButton>
        </Inline>
      </Stack>

      <Stack gap="none" class="w-full max-w-xl min-w-0 flex-1">
        <DeveloperLandingHeroTerminal />
      </Stack>
    </Flex>
  </Stack>
</template>

<style scoped>
  .hero-grid {
    background-image:
      linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
    background-size: 32px 32px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%);
  }

  .dark .hero-grid {
    background-image:
      linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  }

  .hero-caret {
    animation: hero-caret-blink 1.1s steps(2, jump-none) infinite;
  }

  @keyframes hero-caret-blink {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
</style>

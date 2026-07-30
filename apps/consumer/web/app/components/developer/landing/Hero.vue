<script setup lang="ts">
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
  <section class="relative overflow-hidden border-b border-surface">
    <div class="hero-grid absolute inset-0" aria-hidden="true" />

    <div
      class="relative z-10 mx-auto box-content flex min-h-[calc(360px+var(--app-header-height))] max-w-app flex-col justify-center gap-12 px-6 pt-[calc(var(--app-header-height)+48px)] pb-16 lg:flex-row lg:items-center lg:gap-16"
    >
      <div class="flex max-w-xl flex-1 flex-col items-start gap-5">
        <p
          class="font-mono text-xs font-semibold tracking-widest text-hikari-primary-600 uppercase dark:text-hikari-primary-400"
        >
          Hikarinagi Developers
        </p>

        <h1
          class="font-mono text-5xl font-extrabold tracking-tight text-color lg:text-6xl"
          :aria-label="TITLE"
        >
          <span aria-hidden="true" v-text="typed" /><span
            aria-hidden="true"
            class="text-hikari-primary-500"
            :class="{ 'hero-caret': !typing }"
            v-text="'_'"
          />
        </h1>

        <p class="text-lg text-muted-color">使用 Hikarinagi 的公开数据构建你的应用。</p>

        <div class="flex flex-wrap items-center gap-3">
          <Button label="查看 API 文档" as="router-link" to="/developers/reference" />
          <Button
            label="进入控制台"
            severity="secondary"
            outlined
            login-required
            as="router-link"
            to="/developers/console"
          />
        </div>
      </div>

      <div class="w-full max-w-xl min-w-0 flex-1">
        <DeveloperLandingHeroTerminal />
      </div>
    </div>
  </section>
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

<script setup lang="ts">
  import { Mail, Search } from '@lucide/vue'

  const loadingStates = reactive({
    run: false,
    submit: false,
    withIcon: false,
    iconOnly: false,
    smallIconOnly: false,
  })
  const loadingCount = ref(0)

  type LoadingButtonKey = keyof typeof loadingStates

  async function runLoading(key: LoadingButtonKey) {
    if (loadingStates[key]) return

    loadingStates[key] = true
    await new Promise<void>(resolve => {
      window.setTimeout(resolve, 1400)
    })
    loadingStates[key] = false
    loadingCount.value += 1
  }
</script>

<template>
  <section class="space-y-4">
    <h2 class="text-base font-semibold text-color">Loading</h2>
    <p class="text-sm text-muted-color">Completed: {{ loadingCount }}</p>
    <div class="flex flex-wrap items-center gap-3">
      <Button
        :loading="loadingStates.run"
        label="Run promise"
        severity="secondary"
        variant="outlined"
        @click="runLoading('run')"
      />
      <Button :loading="loadingStates.submit" label="Submit" @click="runLoading('submit')" />
      <Button
        :loading="loadingStates.withIcon"
        label="With icon"
        severity="secondary"
        @click="runLoading('withIcon')"
      >
        <template #icon>
          <Mail class="size-4" aria-hidden="true" />
        </template>
      </Button>
      <Button
        :loading="loadingStates.iconOnly"
        aria-label="Loading icon"
        rounded
        variant="text"
        @click="runLoading('iconOnly')"
      >
        <template #icon>
          <Search class="size-4" aria-hidden="true" />
        </template>
      </Button>
      <Button
        :loading="loadingStates.smallIconOnly"
        aria-label="Small loading icon"
        rounded
        size="small"
        variant="text"
        @click="runLoading('smallIconOnly')"
      >
        <template #icon>
          <Search class="size-4" aria-hidden="true" />
        </template>
      </Button>
    </div>
  </section>
</template>

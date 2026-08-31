<script setup lang="ts">
  import logoUrl from '~/assets/images/logo.png'
  import { SITE_CONFIG } from '~/config/site'

  const year = new Date().getFullYear()
  const { appVersion, buildTime } = useRuntimeConfig().public
  const buildLabel = buildTime ? `Built ${buildTime}` : 'Local build'
  const changelogOpen = ref(false)
</script>

<template>
  <footer class="flex flex-col gap-1 border-t border-surface px-1 pt-2">
    <div class="flex items-center justify-between gap-2">
      <NuxtLink to="/" :aria-label="SITE_CONFIG.name" class="w-fit">
        <HikariImage
          :src="logoUrl"
          :alt="SITE_CONFIG.name"
          class="aspect-963/183 h-5"
          image-class="object-contain"
          :skeleton="false"
        />
      </NuxtLink>
      <LayoutFooterSocial size="sm" />
    </div>
    <p class="text-xs leading-relaxed text-muted-color">
      © {{ year }} {{ SITE_CONFIG.name }} · Some Rights Reserved ·
      <button
        v-tooltip.top="buildLabel"
        type="button"
        class="rounded-xs tabular-nums outline-hikari-primary-500 transition-colors hover:text-color focus-visible:outline-2 focus-visible:outline-offset-2"
        @click="changelogOpen = true"
      >
        {{ appVersion }}
      </button>
    </p>

    <ChangelogDialog v-model:visible="changelogOpen" />
  </footer>
</template>

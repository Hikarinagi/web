<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import logoUrl from '~/assets/images/wordmark.svg'
  import { SITE_CONFIG } from '~/config/site'

  const year = new Date().getFullYear()
  const { appVersion, buildTime } = useRuntimeConfig().public
  const buildLabel = buildTime ? `Built ${buildTime}` : 'Local build'
  const changelogOpen = ref(false)
</script>

<template>
  <Stack as="footer" gap="xs" class="border-t border-line px-1 pt-2">
    <Inline gap="sm" align="center" justify="between" :wrap="false">
      <NuxtLink to="/" :aria-label="SITE_CONFIG.name" class="w-fit">
        <HikariImage
          :src="logoUrl"
          :alt="SITE_CONFIG.name"
          class="aspect-792/191 h-5"
          image-class="object-contain"
          :skeleton="false"
        />
      </NuxtLink>
      <LayoutFooterSocial size="sm" />
    </Inline>
    <Text size="xs" tone="muted" class="leading-relaxed">
      © {{ year }} {{ SITE_CONFIG.name }} · Some Rights Reserved ·
      <Link
        v-tooltip="buildLabel"
        as="button"
        type="button"
        tone="neutral"
        class="tabular-nums"
        @click="changelogOpen = true"
      >
        {{ appVersion }}
      </Link>
    </Text>

    <ChangelogDialog v-model:visible="changelogOpen" />
  </Stack>
</template>

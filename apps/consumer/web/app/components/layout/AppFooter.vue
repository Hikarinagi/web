<script setup lang="ts">
  import { Button, Flex, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import logoUrl from '~/assets/images/wordmark.svg'
  import { SITE_CONFIG } from '~/config/site'

  const flags = useFeatureFlags()
  const year = new Date().getFullYear()
  const { appVersion, buildTime } = useRuntimeConfig().public
  const buildLabel = buildTime ? `Built ${buildTime}` : 'Local build'
  const changelogOpen = ref(false)
</script>

<template>
  <Stack as="footer" gap="none" class="hidden border-t border-line bg-canvas md:block">
    <Flex
      direction="col"
      gap="lg"
      class="mx-auto max-w-app px-4 py-9 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4"
    >
      <Stack gap="sm">
        <NuxtLink to="/" :aria-label="SITE_CONFIG.name" class="w-fit">
          <HikariImage
            :src="logoUrl"
            :alt="SITE_CONFIG.name"
            class="aspect-792/191 h-6"
            image-class="object-contain"
            :skeleton="false"
          />
        </NuxtLink>
        <Text as="p" size="sm" tone="muted">{{ SITE_CONFIG.description }}</Text>
      </Stack>

      <Flex direction="col" gap="md" class="md:flex-row md:items-center md:gap-5">
        <Stack gap="xs" class="order-2 md:order-1 md:items-end">
          <Text as="p" size="sm" tone="muted">
            © {{ year }} {{ SITE_CONFIG.name }} · Some Rights Reserved ·
            <Button
              v-tooltip="buildLabel"
              variant="link"
              tone="neutral"
              size="sm"
              class="h-auto px-0 align-baseline tabular-nums"
              @click="changelogOpen = true"
            >
              {{ appVersion }}
            </Button>
          </Text>
          <Inline gap="md" :wrap="false">
            <Link
              v-if="flags.app_download"
              :as="NuxtLink"
              to="/app"
              tone="neutral"
              :underline="false"
              class="w-fit text-sm text-muted"
            >
              下载 App
            </Link>
            <Link
              :as="NuxtLink"
              to="/developers"
              tone="neutral"
              :underline="false"
              class="w-fit text-sm text-muted"
            >
              开发者平台
            </Link>
          </Inline>
        </Stack>
        <LayoutFooterSocial class="order-1 md:order-2" />
      </Flex>
    </Flex>

    <ChangelogDialog v-model:visible="changelogOpen" />
  </Stack>
</template>

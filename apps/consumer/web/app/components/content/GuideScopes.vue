<script setup lang="ts">
  import { Code, Grid, Stack, Tag, Text } from '@hina-ui/vue'
  import { DEVELOPER_SCOPES } from '~/features/developer/scopes'

  defineOptions({ name: 'GuideScopes' })
</script>

<template>
  <Stack gap="none" class="divide-y divide-line">
    <Grid
      v-for="entry in DEVELOPER_SCOPES"
      :key="entry.scope"
      :cols="1"
      class="gap-1.5 py-3 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-4"
    >
      <Stack gap="none" align="start" class="gap-1.5">
        <Code class="text-sm">{{ entry.scope }}</Code>
        <Tag v-if="entry.requires_user" tone="neutral" size="sm">需用户授权</Tag>
      </Stack>
      <Stack gap="none" class="gap-0.5">
        <Text as="span" size="sm">{{ entry.label }}</Text>
        <Text as="span" size="sm" tone="muted">{{ entry.description }}</Text>
      </Stack>
    </Grid>
  </Stack>
</template>

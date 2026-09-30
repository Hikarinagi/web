<script setup lang="ts">
  import { Button, Dialog, Inline, Stack, Text } from '@hina-ui/vue'

  defineOptions({ name: 'AppDownloadSideload' })

  defineProps<{ label: string; steps: string[]; hints?: string[] }>()
</script>

<template>
  <Dialog :title="label" size="sm">
    <Button variant="link" tone="neutral" size="sm">{{ label }}</Button>

    <template #content>
      <Stack gap="md">
        <Stack as="ol" gap="md">
          <Inline
            v-for="(step, index) in steps"
            :key="step"
            as="li"
            gap="sm"
            align="start"
            :wrap="false"
          >
            <Text
              as="span"
              size="xs"
              weight="semibold"
              class="grid size-5 shrink-0 place-items-center rounded-full bg-subtle"
            >
              {{ index + 1 }}
            </Text>
            <Text as="span" size="sm" tone="muted">{{ step }}</Text>
          </Inline>
        </Stack>
        <Text v-for="hint in hints" :key="hint" as="p" size="xs" tone="faint">{{ hint }}</Text>
      </Stack>
    </template>
  </Dialog>
</template>

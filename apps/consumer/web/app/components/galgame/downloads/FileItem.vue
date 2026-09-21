<script setup lang="ts">
  import { Card, Inline, Stack, Text } from '@hina-ui/vue'
  import { Download, Link2 } from '@lucide/vue'
  import { fileSizeLabel, type GalgameDownloadResource } from '~/features/galgame/download'

  defineOptions({ name: 'GalgameDownloadsFileItem' })
  const props = defineProps<{
    file: GalgameDownloadResource['files'][number]
    pendingFileId: number | null
  }>()
  defineEmits<{ download: [number]; copy: [number] }>()

  const loading = computed(() => props.pendingFileId === props.file.id)
</script>

<template>
  <Card class="flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
    <Stack gap="xs" class="min-w-0">
      <Text size="sm" weight="medium" truncate :title="file.file_name">
        {{ file.file_name }}
      </Text>
      <Inline gap="none" class="gap-x-3 gap-y-1">
        <Text as="span" size="xs" tone="muted">{{ fileSizeLabel(file.file_size) }}</Text>
        <Text v-if="file.file_hash" as="span" size="xs" tone="muted" truncate class="font-mono">
          {{ file.hash_algorithm ?? 'hash' }}: {{ file.file_hash }}
        </Text>
      </Inline>
    </Stack>

    <Inline gap="sm" align="stretch" :wrap="false" class="shrink-0">
      <Button login-required :loading="loading" @click="$emit('download', file.id)">
        <template #icon><Download /></template>
        下载
      </Button>
      <IconButton
        login-required
        label="复制下载链接"
        side="top"
        variant="outline"
        tone="neutral"
        :loading="loading"
        @click="$emit('copy', file.id)"
      >
        <Link2 />
      </IconButton>
    </Inline>
  </Card>
</template>

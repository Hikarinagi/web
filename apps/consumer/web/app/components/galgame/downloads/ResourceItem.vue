<script setup lang="ts">
  import { Card, Heading, Inline, Stack, Tag } from '@hina-ui/vue'
  import { languageLabel, type GalgameDownloadResource } from '~/features/galgame/download'
  import { platformLabel } from '~/features/galgame/platforms'

  defineOptions({ name: 'GalgameDownloadsResourceItem' })
  defineProps<{ resource: GalgameDownloadResource; pendingFileId: number | null }>()
  defineEmits<{ download: [number]; copy: [number] }>()
</script>

<template>
  <Card>
    <Stack>
      <Stack gap="sm">
        <Heading v-if="resource.note" :level="2" size="base">{{ resource.note }}</Heading>

        <Inline gap="sm">
          <Tag v-for="code in resource.platform" :key="code" tone="accent">
            {{ platformLabel(code) }}
          </Tag>
          <Tag v-for="code in resource.language" :key="code">{{ languageLabel(code) }}</Tag>
          <Tag v-if="resource.simulator" tone="info">{{ resource.simulator }}</Tag>
        </Inline>
      </Stack>

      <Stack gap="sm">
        <GalgameDownloadsFileItem
          v-for="file in resource.files"
          :key="file.id"
          :file="file"
          :pending-file-id="pendingFileId"
          @download="$emit('download', $event)"
          @copy="$emit('copy', $event)"
        />
      </Stack>
    </Stack>
  </Card>
</template>

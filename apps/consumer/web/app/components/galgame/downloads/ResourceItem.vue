<script setup lang="ts">
  import { languageLabel, type GalgameDownloadResource } from '~/features/galgame/download'
  import { platformLabel } from '~/features/galgame/platforms'

  defineOptions({ name: 'GalgameDownloadsResourceItem' })
  defineProps<{ resource: GalgameDownloadResource; pendingFileId: number | null }>()
  defineEmits<{ download: [number]; copy: [number] }>()
</script>

<template>
  <Card>
    <template #content>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <h2 v-if="resource.note" class="text-base font-semibold text-color">
            {{ resource.note }}
          </h2>

          <div class="flex flex-wrap items-center gap-2">
            <Tag v-for="code in resource.platform" :key="code" :value="platformLabel(code)" />
            <Tag
              v-for="code in resource.language"
              :key="code"
              severity="secondary"
              :value="languageLabel(code)"
            />
            <Tag v-if="resource.simulator" severity="info" :value="resource.simulator" />
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <GalgameDownloadsFileItem
            v-for="file in resource.files"
            :key="file.id"
            :file="file"
            :pending-file-id="pendingFileId"
            @download="$emit('download', $event)"
            @copy="$emit('copy', $event)"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

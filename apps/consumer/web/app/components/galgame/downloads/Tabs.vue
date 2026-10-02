<script setup lang="ts">
  import { Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@hina-ui/vue'
  import type { GalgameDownloadsPageData } from '~~/server/api/pages/galgames/[id]/downloads.get'

  defineOptions({ name: 'GalgameDownloadsTabs' })
  const props = defineProps<{
    galgameId: number
    resources: GalgameDownloadsPageData['resources']
    patches: GalgameDownloadsPageData['patches']
  }>()

  const patchCount = computed(() =>
    props.patches ? props.patches.translation.length + props.patches.other.length : null,
  )
</script>

<template>
  <Tabs default-value="game" size="lg">
    <TabsList label="下载选项">
      <TabsTrigger value="game">
        游戏本体
        <Text v-if="resources" as="span" size="sm" tone="muted" class="tabular-nums">
          {{ resources.length }}
        </Text>
      </TabsTrigger>
      <TabsTrigger value="patch">
        补丁
        <Text v-if="patchCount !== null" as="span" size="sm" tone="muted" class="tabular-nums">
          {{ patchCount }}
        </Text>
      </TabsTrigger>
    </TabsList>

    <TabsContent value="game" class="pt-6">
      <GalgameDownloadsGameList :galgame-id="galgameId" :resources="resources" />
    </TabsContent>
    <TabsContent value="patch" class="pt-6">
      <GalgameDownloadsPatchList :patches="patches" />
    </TabsContent>
  </Tabs>
</template>

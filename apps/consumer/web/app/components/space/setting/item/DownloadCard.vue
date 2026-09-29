<script setup lang="ts">
  import { Empty, Image, Inline, Text, toast } from '@hina-ui/vue'
  import downloadCardUrl from '~/assets/images/novel-download-card.webp'
  import type { ItemsPageData } from '~~/server/api/pages/setting/items.get'
  import { useDownloadCard } from '~/features/download/useDownloadCard'

  const props = defineProps<{
    card: ItemsPageData['download_card']
    refresh: () => Promise<unknown>
  }>()
  const { purchase } = useDownloadCard(
    () => props.card,
    async () => {
      await props.refresh()
      toast.success('下载卡已加入道具库')
    },
  )
</script>

<template>
  <SpaceSettingItemEntry
    name="下载卡"
    :image="downloadCardUrl"
    description="用于下载小说分卷和漫画"
    :available="card.available"
    :purchased="card.purchased"
    :price="card.price"
    validity="长期有效"
    action="购买"
    @purchase="purchase"
  >
    <template #description-extra>
      <DownloadRules :status="card" />
    </template>
    <Empty
      v-if="!card.available"
      description="暂无下载卡"
      :icon="false"
      size="sm"
      class="items-start p-0"
    />
    <Inline
      v-else
      justify="between"
      align="center"
      class="rounded-lg bg-subtle px-4 py-2.5"
    >
      <Inline as="span" gap="xs" align="center">
        <Image
          :src="downloadCardUrl"
          alt="下载卡"
          fit="contain"
          :lazy="false"
          :skeleton="false"
          :draggable="false"
          class="h-5 w-4"
          image-class="select-none"
        />
        <Text as="span" size="sm">长期有效</Text>
      </Inline>
      <Text as="span" size="sm" tone="muted">{{ card.available }} 张</Text>
    </Inline>
  </SpaceSettingItemEntry>
</template>

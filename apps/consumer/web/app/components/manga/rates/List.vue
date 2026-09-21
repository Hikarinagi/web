<script setup lang="ts">
  import { Button, Card, Center, Divider, Stack, Text } from '@hina-ui/vue'
  import type { MangaRateListItem } from '~/features/manga/rate'

  defineOptions({ name: 'MangaRatesList' })
  defineProps<{
    items: MangaRateListItem[]
    mangaId: number
    total: number
    hasMore: boolean
    pending: boolean
    filtered: boolean
  }>()
  defineEmits<{ loadMore: [] }>()
</script>

<template>
  <Stack gap="lg">
    <Card v-if="!items.length">
      <Text as="p" size="sm" tone="muted">
        {{ filtered ? '没有符合筛选条件的短评' : '还没有人写短评' }}
      </Text>
    </Card>

    <Columns v-else>
      <MangaRatesItem v-for="r in items" :key="r.id" :rate="r" :manga-id="mangaId" />
    </Columns>

    <Center v-if="hasMore">
      <Button variant="outline" tone="neutral" :loading="pending" @click="$emit('loadMore')">
        加载更多
      </Button>
    </Center>
    <Divider v-else-if="items.length">已显示全部 {{ total }} 条</Divider>
  </Stack>
</template>

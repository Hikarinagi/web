<script setup lang="ts">
  import { Button, Card, Center, Divider, Stack, Text } from '@hina-ui/vue'
  import type { LightNovelRateListItem } from '~/features/light-novel/rate'

  defineOptions({ name: 'LightNovelRatesList' })
  defineProps<{
    items: LightNovelRateListItem[]
    lightNovelId: number
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
      <LightNovelRatesItem
        v-for="r in items"
        :key="`${r.volume ? 'v' : 's'}${r.id}`"
        :rate="r"
        :light-novel-id="lightNovelId"
      />
    </Columns>

    <Center v-if="hasMore">
      <Button variant="outline" tone="neutral" :loading="pending" @click="$emit('loadMore')">
        加载更多
      </Button>
    </Center>
    <Divider v-else-if="items.length">已显示全部 {{ total }} 条</Divider>
  </Stack>
</template>
